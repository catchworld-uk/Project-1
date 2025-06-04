import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Style.css';

const API_KEY = 'AIzaSyDZx0h7qwxlT9LsSs-wrwbTPYtdWMxblsQ';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const NAV_ITEMS = [
  { label: 'Home', action: 'home', icon: '🏠' },
  { label: 'Trending', action: 'trending', icon: '🔥' },
  { label: 'Shorts', action: 'shots', icon: '🎥' },
  { label: 'Downloads', action: 'download', icon: '⬇️' },
];

function Header({ onSearch, searchTerm, setSearchTerm, toggleSettings, toggleDrawer }) {
  return (
    <header style={styles.header}>
      <div style={styles.headerLeft}>
        <button style={styles.menuButton} onClick={toggleDrawer}>
          ☰
        </button>
        <div style={styles.logo}>
          <img
            src="https://www.youtube.com/s/desktop/7a97f1b1/img/favicon_32x32.png"
            alt="YouTube Logo"
            style={{ width: '30px', marginRight: '5px' }}
          />
          <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'white' }}>
            YouTube
          </span>
          <span style={styles.byMrTechy}>by Mr Techy</span>
        </div>
      </div>
      <form style={styles.searchForm} onSubmit={onSearch}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search videos"
        />
        <button type="submit" style={styles.searchButton}>
          🔍
        </button>
      </form>
      <div style={styles.headerRight}>
        <button style={styles.iconButton}>🔔</button>
        <button style={styles.iconButton} onClick={toggleSettings}>⚙️</button>
        <button style={styles.iconButton}>👤</button>
      </div>
    </header>
  );
}

function Drawer({ showDrawer, toggleDrawer, toggleSettings }) {
  const drawerItems = [
    { label: 'Settings', action: () => toggleSettings() },
    { label: 'History', action: () => alert('History clicked') },
    { label: 'Downloads', action: () => window.open('https://www.youtube.com/download', '_blank') },
    { label: 'Subscriptions', action: () => alert('Subscriptions clicked') },
    { label: 'Help', action: () => alert('Help clicked') },
  ];

  return (
    <div style={{
      ...styles.drawer,
      transform: showDrawer ? 'translateX(0)' : 'translateX(-100%)',
    }}>
      <button style={styles.closeButton} onClick={toggleDrawer}>✕</button>
      <div style={styles.drawerContent}>
        {drawerItems.map(({ label, action }) => (
          <button
            key={label}
            style={styles.drawerItem}
            onClick={() => {
              action();
              toggleDrawer();
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Footer({ onNavClick }) {
  return (
    <footer style={styles.footer}>
      {NAV_ITEMS.map(({ label, action, icon }) => (
        <button
          key={action}
          style={styles.footerButton}
          onClick={() => onNavClick(action)}
        >
          <span style={styles.footerIcon}>{icon}</span>
          <span style={styles.footerLabel}>{label}</span>
        </button>
      ))}
    </footer>
  );
}

function Settings({ darkMode, toggleDarkMode, onClose }) {
  const [tempDarkMode, setTempDarkMode] = useState(darkMode);

  const handleApply = () => {
    toggleDarkMode(tempDarkMode);
    onClose();
  };

  return (
    <div style={styles.settingsOverlay}>
      <div style={styles.settingsPanel}>
        <h3 style={{ color: 'white', margin: '0 0 20px 0' }}>Settings</h3>
        <div style={styles.settingsItem}>
          <label style={{ color: 'white', marginRight: '10px' }}>
            Dark Mode {tempDarkMode ? 'On' : 'Off'}
          </label>
          <label style={styles.switch}>
            <input
              type="checkbox"
              checked={tempDarkMode}
              onChange={() => setTempDarkMode((prev) => !prev)}
            />
            <span
              style={{
                ...styles.slider,
                backgroundColor: tempDarkMode ? '#ff0000' : '#ccc',
              }}
            ></span>
          </label>
        </div>
        <button style={styles.okButton} onClick={handleApply}>
          OK
        </button>
      </div>
    </div>
  );
}

function VideoDetails({ video, onLike, darkMode }) {
  const [likes, setLikes] = useState(() => parseInt(localStorage.getItem(`likes_${video.id.videoId}`)) || 0);
  const [comments, setComments] = useState(() => JSON.parse(localStorage.getItem(`comments_${video.id.videoId}`)) || []);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    setLikes(parseInt(localStorage.getItem(`likes_${video.id.videoId}`)) || 0);
    setComments(JSON.parse(localStorage.getItem(`comments_${video.id.videoId}`)) || []);
    setNewComment('');
  }, [video.id.videoId]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return;
    const newComm = { id: Date.now(), user: 'Guest', text: newComment.trim() };
    const updatedComments = [...comments, newComm];
    setComments(updatedComments);
    localStorage.setItem(`comments_${video.id.videoId}`, JSON.stringify(updatedComments));
    setNewComment('');
  };

  return (
    <div style={styles.videoDetails}>
      <iframe
        width="100%"
        height="400"
        src={`https://www.youtube.com/embed/${video.id.videoId}?autoplay=1`}
        title={video.snippet.title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ borderRadius: '8px' }}
      />
      <h2 style={{ ...styles.videoTitle, color: darkMode ? 'white' : '#0f0f0f' }}>{video.snippet.title}</h2>
      <div style={styles.videoActions}>
        <button style={styles.likeButton} onClick={() => onLike(video.id.videoId)}>
          👍 {likes}
        </button>
        <button style={styles.actionButton}>⬇️ Download</button>
        <button style={styles.actionButton}>↪️ Share</button>
      </div>
      <p style={{ ...styles.videoDescription, color: darkMode ? '#aaa' : '#555' }}>{video.snippet.description}</p>
      <section style={styles.commentsSection}>
        <h3 style={{ color: darkMode ? 'white' : '#0f0f0f' }}>{comments.length} Comments</h3>
        <form onSubmit={handleAddComment} style={styles.commentForm}>
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ ...styles.commentInput, backgroundColor: darkMode ? '#121212' : '#fff', color: darkMode ? 'white' : '#000' }}
          />
          <button type="submit" style={styles.commentSubmitButton}>Comment</button>
        </form>
        <ul style={styles.commentList}>
          {comments.map((c) => (
            <li key={c.id} style={styles.commentItem}>
              <strong style={{ color: darkMode ? '#aaa' : '#606060' }}>{c.user}</strong>
              <p style={{ margin: '5px 0', color: darkMode ? 'white' : '#0f0f0f' }}>{c.text}</p>
            </li>
          ))}
          {comments.length === 0 && <li style={{ color: darkMode ? '#aaa' : '#606060' }}>No comments yet.</li>}
        </ul>
      </section>
    </div>
  );
}

export default function App() {
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentQuery, setCurrentQuery] = useState('trending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const loaderRef = useRef(null);

  const fetchVideos = useCallback(async (query, pageToken = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&key=${API_KEY}&type=video&pageToken=${pageToken}`
      );
      const data = await response.json();
      if (data.error) {
        if (data.error.message.includes('quotaExceeded')) {
          const resetTime = new Date();
          resetTime.setHours(23, 30, 0, 0); // 11:30 PM IST
          const now = new Date();
          const timeDiff = resetTime - now;
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          setError(
            `Site ke credits run out ho gaye hain. Quota reset hoga in ${hours} hours aur ${minutes} minutes (~11:30 PM IST).`
          );
        } else {
          setError(data.error.message);
        }
        setVideos([]);
        setSelectedVideo(null);
        setNextPageToken(null);
        return [];
      }
      return data;
    } catch (err) {
      setError('Error fetching videos');
      setVideos([]);
      setSelectedVideo(null);
      setNextPageToken(null);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchShorts = useCallback(async (pageToken = '') => {
    try {
      const response = await fetch(
        `${BASE_URL}/search?part=snippet&maxResults=5&q=${encodeURIComponent('youtube shorts')}&key=${API_KEY}&type=video&pageToken=${pageToken}`
      );
      const data = await response.json();
      if (data.error) {
        if (data.error.message.includes('quotaExceeded')) {
          const resetTime = new Date();
          resetTime.setHours(23, 30, 0, 0); // 11:30 PM IST
          const now = new Date();
          const timeDiff = resetTime - now;
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          setError(
            `Site ke credits run out ho gaye hain. Quota reset hoga in ${hours} hours aur ${minutes} minutes (~11:30 PM IST).`
          );
        } else {
          setError(data.error.message);
        }
        return [];
      }
      return data.items;
    } catch (err) {
      setError('Error fetching shorts');
      return [];
    }
  }, []);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const normalVideosData = await fetchVideos(currentQuery);
        setVideos(normalVideosData.items || []);
        if (normalVideosData.items && normalVideosData.items.length > 0) {
          setSelectedVideo(normalVideosData.items[0]);
        }
        setNextPageToken(normalVideosData.nextPageToken || null);

        const shortsData = await fetchShorts();
        setShorts(shortsData || []);
      } catch (err) {
        if (err.message.includes('quotaExceeded')) {
          const resetTime = new Date();
          resetTime.setHours(23, 30, 0, 0); // 11:30 PM IST
          const now = new Date();
          const timeDiff = resetTime - now;
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          setError(
            `Site ke credits run out ho gaye hain. Quota reset hoga in ${hours} hours aur ${minutes} minutes (~11:30 PM IST).`
          );
        } else {
          setError('Error loading content');
          setVideos([]);
          setShorts([]);
          setSelectedVideo(null);
          setNextPageToken(null);
        }
      }
      setLoading(false);
    };
    loadContent();
  }, [currentQuery, fetchVideos, fetchShorts]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && nextPageToken && videos.length > 0) {
        fetchVideos(currentQuery, nextPageToken).then((data) => {
          setVideos((prev) => [...prev, ...(data.items || [])]);
          setNextPageToken(data.nextPageToken || null);
        });
      }
    }, { threshold: 1 });

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
      setCurrentQuery('');
      fetchVideos('trending');
    } else if (action === 'trending') {
      setSearchTerm('');
      setCurrentQuery('trending');
    } else if (action === 'shots') {
      setSearchTerm('');
      setCurrentQuery('youtube shorts');
    } else if (action === 'download') {
      window.open('https://www.youtube.com/download', '_blank');
    }
  };

  const handleLike = (videoId) => {
    const currentLikes = parseInt(localStorage.getItem(`likes_${videoId}`)) || 0;
    localStorage.setItem(`likes_${videoId}`, currentLikes + 1);
    setVideos((prevVideos) =>
      prevVideos.map((video) =>
        video.id.videoId === videoId ? { ...video, likes: currentLikes + 1 } : video
      )
    );
  };

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  const toggleDrawer = () => {
    setShowDrawer((prev) => !prev);
  };

  return (
    <div style={{ ...styles.app, backgroundColor: darkMode ? '#0f0f0f' : '#f9f9f9', color: darkMode ? 'white' : '#0f0f0f' }}>
      <Header
        onSearch={handleSearchSubmit}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        toggleSettings={toggleSettings}
        toggleDrawer={toggleDrawer}
      />
      <Drawer
        showDrawer={showDrawer}
        toggleDrawer={toggleDrawer}
        toggleSettings={toggleSettings}
      />
      {showSettings && (
        <Settings
          darkMode={darkMode}
          toggleDarkMode={setDarkMode}
          onClose={toggleSettings}
        />
      )}
      <div style={styles.container}>
        <main style={styles.main}>
          {error && (
            <div style={{ ...styles.errorContainer, backgroundColor: darkMode ? '#1a1a1a' : '#ffe6e6' }}>
              {error.includes('Quota') && (
                <img
                  src="https://via.placeholder.com/300x200.png?text=Quota+Exceeded"
                  alt="Quota Exceeded"
                  style={styles.errorImage}
                />
              )}
              <p style={styles.error}>{error}</p>
            </div>
          )}
          <div style={styles.content}>
            {/* Shorts Section */}
            {shorts.length > 0 && (
              <section style={styles.shortsSection}>
                <h2 style={{ color: darkMode ? 'white' : '#0f0f0f', margin: '0 0 10px 0' }}>
                  Shorts
                </h2>
                <div style={styles.shortsCarousel}>
                  {shorts.map((short) => (
                    <div
                      key={short.id.videoId}
                      style={styles.shortItem}
                      onClick={() => setSelectedVideo(short)}
                      tabIndex={0}
                    >
                      <span style={styles.shortLabel}>Shorts</span>
                      <img
                        src={short.snippet.thumbnails.high.url}
                        alt={short.snippet.title}
                        style={styles.shortThumbnail}
                        loading="lazy"
                      />
                      <h3 style={{ ...styles.shortTitle, color: darkMode ? 'white' : '#0f0f0f' }}>
                        {short.snippet.title}
                      </h3>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Video Details */}
            {selectedVideo ? (
              <VideoDetails video={selectedVideo} onLike={handleLike} darkMode={darkMode} />
            ) : (
              <p style={{ textAlign: 'center', color: darkMode ? 'white' : '#0f0f0f' }}>
                No video selected
              </p>
            )}

            {/* Video List */}
            <section style={styles.videoListSection}>
              {videos.map((video) => (
                <div
                  key={video.id.videoId}
                  style={{
                    ...styles.videoItem,
                    border: selectedVideo && selectedVideo.id.videoId === video.id.videoId
                      ? `2px solid ${darkMode ? '#ff0000' : '#cc0000'}`
                      : 'none',
                    backgroundColor: darkMode ? '#212121' : '#fff',
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
                  <div style={styles.videoInfo}>
                    <h3 style={{ ...styles.videoTitleSmall, color: darkMode ? 'white' : '#0f0f0f' }}>
                      {video.snippet.title}
                    </h3>
                    <p style={{ ...styles.channelName, color: darkMode ? '#aaa' : '#606060' }}>
                      {video.snippet.channelTitle}
                    </p>
                    <p style={{ ...styles.views, color: darkMode ? '#aaa' : '#606060' }}>
                      1M views • 2 days ago
                    </p>
                  </div>
                </div>
              ))}
              {loading && <p style={{ ...styles.loading, color: darkMode ? '#aaa' : '#606060' }}>Loading more videos...</p>}
              <div ref={loaderRef} style={{ height: '1px' }} />
            </section>
          </div>
        </main>
      </div>
      <Footer onNavClick={handleNavClick} />
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    fontFamily: 'Roboto, Arial, sans-serif',
    paddingBottom: '60px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#212121',
    padding: '10px 20px',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    height: '60px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  menuButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  byMrTechy: {
    fontSize: '0.8rem',
    color: '#aaa',
    marginLeft: '10px',
  },
  searchForm: {
    display: 'flex',
    flex: 1,
    maxWidth: '600px',
    margin: '0 20px',
  },
  searchInput: {
    flexGrow: 1,
    padding: '8px 12px',
    borderRadius: '20px 0 0 20px',
    border: '1px solid #303030',
    backgroundColor: '#121212',
    color: 'white',
    outline: 'none',
  },
  searchButton: {
    backgroundColor: '#303030',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '0 20px 20px 0',
    cursor: 'pointer',
    color: 'white',
  },
  headerRight: {
    display: 'flex',
    gap: '15px',
  },
  iconButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '1.2rem',
    cursor: 'pointer',
  },
  drawer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '250px',
    height: '100%',
    backgroundColor: '#212121',
    zIndex: 2000,
    transition: 'transform 0.3s ease-in-out',
    padding: '20px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
    position: 'absolute',
    top: '10px',
    right: '10px',
  },
  drawerContent: {
    marginTop: '40px',
  },
  drawerItem: {
    display: 'block',
    width: '100%',
    padding: '10px',
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '1rem',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.3s',
  },
  footer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#212121',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px 0',
    zIndex: 1000,
  },
  footerButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer',
    padding: '5px 10px',
  },
  footerIcon: {
    fontSize: '1.5rem',
  },
  footerLabel: {
    fontSize: '0.8rem',
  },
  settingsOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  settingsPanel: {
    backgroundColor: '#212121',
    padding: '20px',
    borderRadius: '8px',
    width: '300px',
  },
  settingsItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '60px',
    height: '34px',
  },
  slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: '0',
    bottom: '0',
    transition: '0.4s',
    borderRadius: '34px',
  },
  okButton: {
    backgroundColor: '#ff0000',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '20px',
    color: 'white',
    cursor: 'pointer',
    marginTop: '20px',
    width: '100%',
  },
  container: {
    display: 'flex',
  },
  main: {
    flex: 1,
    padding: '20px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
  },
  shortsSection: {
    marginBottom: '20px',
  },
  shortsCarousel: {
    display: 'flex',
    overflowX: 'auto',
    gap: '15px',
    paddingBottom: '10px',
    scrollbarWidth: 'thin',
  },
  shortItem: {
    position: 'relative',
    flex: '0 0 auto',
    width: '150px',
    cursor: 'pointer',
  },
  shortThumbnail: {
    width: '100%',
    maxWidth: '150px',
    aspectRatio: '9/16',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '5px',
  },
  shortLabel: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    backgroundColor: '#ff0000',
    color: 'white',
    padding: '2px 5px',
    borderRadius: '4px',
    fontSize: '0.7rem',
  },
  shortTitle: {
    fontSize: '0.9rem',
    margin: '0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  videoDetails: {
    width: '100%',
  },
  videoTitle: {
    fontSize: '1.2rem',
    margin: '10px 0',
  },
  videoActions: {
    display: 'flex',
    gap: '10px',
    margin: '10px 0',
  },
  likeButton: {
    backgroundColor: '#303030',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '20px',
    color: 'white',
    cursor: 'pointer',
  },
  actionButton: {
    backgroundColor: '#303030',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '20px',
    color: 'white',
    cursor: 'pointer',
  },
  videoDescription: {
    fontSize: '0.9rem',
    lineHeight: '1.5',
  },
  commentsSection: {
    marginTop: '20px',
  },
  commentForm: {
    display: 'flex',
    gap: '10px',
    margin: '10px 0',
  },
  commentInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '20px',
    border: '1px solid #303030',
    outline: 'none',
  },
  commentSubmitButton: {
    backgroundColor: '#ff0000',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '20px',
    color: 'white',
    cursor: 'pointer',
  },
  commentList: {
    listStyle: 'none',
    padding: '0',
  },
  commentItem: {
    padding: '10px 0',
    borderBottom: '1px solid #303030',
  },
  videoListSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
    gap: '20px',
  },
  videoItem: {
    cursor: 'pointer',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    maxWidth: '210px',
    aspectRatio: '16/9',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  videoInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  videoTitleSmall: {
    fontSize: '1rem',
    margin: '0 0 5px 0',
  },
  channelName: {
    fontSize: '0.8rem',
    margin: '0 0 3px 0',
  },
  views: {
    fontSize: '0.8rem',
    margin: '0',
  },
  error: {
    color: '#ff5555',
    textAlign: 'center',
    padding: '10px',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '20px',
    borderRadius: '8px',
    margin: '20px auto',
    maxWidth: '600px',
  },
  errorImage: {
    width: '100%',
    maxWidth: '300px',
    marginBottom: '15px',
    borderRadius: '8px',
  },
  loading: {
    textAlign: 'center',
  },
};
