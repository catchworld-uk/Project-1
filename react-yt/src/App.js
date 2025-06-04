import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_KEY = 'AIzaSyAo6-di2ZFtlpILvqnThLEX-hKKTdI069U'; // Yahan apni API key daalna
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const NAV_ITEMS = [
  { label: 'Home', action: 'home' },
  { label: 'Trending', action: 'trending' },
  { label: 'Shots', action: 'shots' },
  { label: 'Download', action: 'download' },
];

function Header({ onNavClick, onSearch, searchTerm, setSearchTerm }) {
  return (
    <header style={styles.header}>
      <div style={styles.logo}>YouTube Clone</div>
      <nav style={styles.nav}>
        {NAV_ITEMS.map(({ label, action }) => (
          <button
            key={action}
            style={styles.navButton}
            onClick={() => onNavClick(action)}
          >
            {label}
          </button>
        ))}
      </nav>
      <form style={styles.searchForm} onSubmit={onSearch}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Search videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search videos"
        />
        <button type="submit" style={styles.searchButton}>
          🔍
        </button>
      </form>
    </header>
  );
}

function VideoDetails({ video, onLike }) {
  const [likes, setLikes] = useState(
    () => parseInt(localStorage.getItem(`likes_${video.id.videoId}`)) || 0
  );
  const [comments, setComments] = useState(
    () => JSON.parse(localStorage.getItem(`comments_${video.id.videoId}`)) || []
  );
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    setLikes(parseInt(localStorage.getItem(`likes_${video.id.videoId}`)) || 0);
    setComments(
      JSON.parse(localStorage.getItem(`comments_${video.id.videoId}`)) || []
    );
    setNewComment('');
  }, [video.id.videoId]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return;

    const newComm = {
      id: Date.now(),
      user: 'Guest',
      text: newComment.trim(),
    };
    const updatedComments = [...comments, newComm];
    setComments(updatedComments);
    localStorage.setItem(
      `comments_${video.id.videoId}`,
      JSON.stringify(updatedComments)
    );
    setNewComment('');
  };

  return (
    <div style={styles.videoDetails}>
      <h2 style={styles.videoTitle}>{video.snippet.title}</h2>
      <iframe
        width="100%"
        height="360"
        src={`https://www.youtube.com/embed/${video.id.videoId}`}
        title={video.snippet.title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ borderRadius: '8px', marginBottom: '12px' }}
      />
      <p style={styles.videoDescription}>{video.snippet.description}</p>
      <button
        style={styles.likeButton}
        onClick={() => onLike(video.id.videoId)}
      >
        👍 Like {likes}
      </button>
      <section style={styles.commentsSection}>
        <h3>Comments ({comments.length})</h3>
        <form onSubmit={handleAddComment} style={styles.commentForm}>
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={styles.commentInput}
          />
          <button type="submit" style={styles.commentSubmitButton}>
            Post
          </button>
        </form>
        <ul style={styles.commentList}>
          {comments.map((c) => (
            <li key={c.id} style={styles.commentItem}>
              <strong>{c.user}</strong>: {c.text}
            </li>
          ))}
          {comments.length === 0 && <li>No comments yet.</li>}
        </ul>
      </section>
    </div>
  );
}

export default function App() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentQuery, setCurrentQuery] = useState('trending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const loaderRef = useRef(null);

  const fetchVideos = useCallback(async (query, pageToken = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/search?part=snippet&maxResults=10&q=${encodeURIComponent(
          query
        )}&key=${API_KEY}&type=video&pageToken=${pageToken}`
      );
      const data = await response.json();
      if (data.error) {
        setError(data.error.message);
        setVideos([]);
        setSelectedVideo(null);
        setNextPageToken(null);
      } else {
        setVideos((prev) =>
          pageToken ? [...prev, ...data.items] : data.items
        );
        if (!pageToken && data.items.length > 0) {
          setSelectedVideo(data.items[0]);
        }
        setNextPageToken(data.nextPageToken || null);
      }
    } catch (err) {
      setError('Error fetching videos');
      setVideos([]);
      setSelectedVideo(null);
      setNextPageToken(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVideos(currentQuery);
  }, [currentQuery, fetchVideos]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loading &&
          nextPageToken &&
          videos.length > 0
        ) {
          fetchVideos(currentQuery, nextPageToken);
        }
      },
      { threshold: 1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loaderRef, loading, nextPageToken, fetchVideos, currentQuery, videos]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setCurrentQuery(searchTerm.trim());
    }
  };

  const handleNavClick = (action) => {
    if (action === 'home') {
      setSearchTerm('');
      setCurrentQuery(''); // empty query fetches no result, so we default to trending below
      fetchVideos('trending');
    } else if (action === 'trending') {
      setSearchTerm('');
      setCurrentQuery('trending');
    } else if (action === 'shots') {
      setSearchTerm('');
      setCurrentQuery('youtube shorts'); // Simulating shots
    } else if (action === 'download') {
      window.open('https://www.youtube.com/download', '_blank');
    }
  };

  const handleLike = (videoId) => {
    const currentLikes =
      parseInt(localStorage.getItem(`likes_${videoId}`)) || 0;
    localStorage.setItem(`likes_${videoId}`, currentLikes + 1);
    setVideos((prevVideos) =>
      prevVideos.map((video) =>
        video.id.videoId === videoId
          ? { ...video, likes: currentLikes + 1 }
          : video
      )
    );
  };

  return (
    <>
      <Header
        onNavClick={handleNavClick}
        onSearch={handleSearchSubmit}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <main style={styles.main}>
        {error && <p style={styles.error}>{error}</p>}
        {selectedVideo ? (
          <VideoDetails video={selectedVideo} onLike={handleLike} />
        ) : (
          <p style={{ textAlign: 'center' }}>No video selected</p>
        )}
        <section style={styles.videoListSection}>
          {videos.map((video) => (
            <div
              key={video.id.videoId}
              style={{
                ...styles.videoItem,
                border:
                  selectedVideo && selectedVideo.id.videoId === video.id.videoId
                    ? '3px solid #cc0000'
                    : '1px solid #ccc',
              }}
              onClick={() => setSelectedVideo(video)}
              tabIndex={0}
            >
              <img
                src={video.snippet.thumbnails.high.url}
                alt={video.snippet.title}
                style={styles.thumbnail}
                loading="lazy"
              />
              <p style={styles.videoTitle}>{video.snippet.title}</p>
            </div>
          ))}
          {loading && <p style={styles.loading}>Loading more videos...</p>}
          <div ref={loaderRef} style={{ height: '1px' }} />
        </section>
      </main>
      <footer style={styles.footer}>
        {NAV_ITEMS.map(({ label, action }) => (
          <button
            key={action}
            style={styles.footerButton}
            onClick={() => handleNavClick(action)}
          >
            {label}
          </button>
        ))}
      </footer>
    </>
  );
}

const styles = {
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: '#cc0000',
    padding: '10px 15px',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  logo: {
    fontWeight: '900',
    fontSize: '1.75rem',
    marginRight: '20px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  nav: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    flexGrow: 1,
    justifyContent: 'center',
  },
  navButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '12px',
    transition: 'background-color 0.3s',
  },
  searchForm: {
    display: 'flex',
    flexWrap: 'nowrap',
    maxWidth: '320px',
  },
  searchInput: {
    flexGrow: 1,
    padding: '8px 10px',
    borderRadius: '12px 0 0 12px',
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
  },
  searchButton: {
    backgroundColor: '#b30000',
    border: 'none',
    color: 'white',
    padding: '8px 14px',
    borderRadius: '0 12px 12px 0',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: 'bold',
  },
  main: {
    maxWidth: '900px',
    margin: '20px auto',
    padding: '0 15px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  videoDetails: {
    marginBottom: '40px',
  },
  videoTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#222',
  },
  videoDescription: {
    fontSize: '1rem',
    lineHeight: '1.4',
    color: '#555',
    marginBottom: '12px',
  },
  likeButton: {
    backgroundColor: '#cc0000',
    color: 'white',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    marginBottom: '20px',
    userSelect: 'none',
  },
  commentsSection: {
    backgroundColor: '#f1f1f1',
    borderRadius: '8px',
    padding: '12px 15px',
  },
  commentForm: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  commentInput: {
    flexGrow: 1,
    padding: '10px',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  commentSubmitButton: {
    backgroundColor: '#cc0000',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  commentList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    maxHeight: '200px',
    overflowY: 'auto',
  },
  commentItem: {
    padding: '6px 0',
    borderBottom: '1px solid #ddd',
  },
  videoListSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '15px',
  },
  videoItem: {
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    padding: '5px',
    backgroundColor: 'white',
    userSelect: 'none',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  thumbnail: {
    width: '100%',
    borderRadius: '8px',
    marginBottom: '6px',
  },
  loading: {
    textAlign: 'center',
    marginTop: '15px',
    color: '#777',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-around',
    backgroundColor: '#cc0000',
    padding: '10px 0',
    position: 'fixed',
    bottom: 0,
    width: '100%',
    zIndex: 1000,
  },
  footerButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
  },
};
