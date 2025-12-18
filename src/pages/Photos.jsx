import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Star, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Image,
  Folder
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { photoVaultAPI } from '../services/api';
import styles from './Photos.module.css';

const Photos = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // State
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Filters
  const [selectedAlbum, setSelectedAlbum] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Lightbox
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Fetch albums
  const fetchAlbums = async () => {
    try {
      const data = await photoVaultAPI.getAlbums();
      setAlbums(data.albums || []);
    } catch (error) {
      console.error('Failed to fetch albums:', error);
    }
  };

  // Fetch photos
  const fetchPhotos = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = {
        page: reset ? 1 : page,
        limit: 30,
        album_id: selectedAlbum,
        favorites_only: favoritesOnly,
        search: searchQuery
      };

      const data = await photoVaultAPI.getPhotos(params);
      
      if (reset) {
        setPhotos(data.photos || []);
      } else {
        setPhotos(prev => [...prev, ...(data.photos || [])]);
      }
      
      setHasMore(data.pagination?.hasMore || false);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page, selectedAlbum, favoritesOnly, searchQuery]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchAlbums();
    }
  }, [isAuthenticated]);

  // Fetch photos when filters change
  useEffect(() => {
    if (isAuthenticated) {
      fetchPhotos(true);
    }
  }, [selectedAlbum, favoritesOnly, searchQuery, isAuthenticated]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1 && isAuthenticated) {
      fetchPhotos(false);
    }
  }, [page]);

  // Lightbox keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxPhoto) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxPhoto, lightboxIndex]);

  // Lightbox handlers
  const openLightbox = (photo, index) => {
    setLightboxPhoto(photo);
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxPhoto(null);
    document.body.style.overflow = '';
  };

  const navigateLightbox = (direction) => {
    const newIndex = lightboxIndex + direction;
    if (newIndex >= 0 && newIndex < photos.length) {
      setLightboxIndex(newIndex);
      setLightboxPhoto(photos[newIndex]);
    }
  };

  // Load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Redirect if not authenticated
  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.container}>
      {/* Background Effects */}
      <div className={styles.backgroundEffects}>
        <div className={`${styles.glowOrb} ${styles.glowOrb1}`} />
        <div className={`${styles.glowOrb} ${styles.glowOrb2}`} />
        <div className={`${styles.glowOrb} ${styles.glowOrb3}`} />
      </div>

      {/* Header */}
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={styles.title}>My Photos</h1>
        <p className={styles.subtitle}>
          A private collection of memories and moments
        </p>
      </motion.div>

      {/* Toolbar */}
      <motion.div 
        className={styles.toolbar}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className={styles.toolbarLeft}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search photos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className={styles.albumSelect}
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
          >
            <option value="all">All Albums</option>
            {albums.map(album => (
              <option key={album.id} value={album.id}>
                {album.name} ({album.photo_count || 0})
              </option>
            ))}
          </select>
        </div>
        <div className={styles.toolbarRight}>
          <button
            className={`${styles.filterBtn} ${favoritesOnly ? styles.filterBtnActive : ''}`}
            onClick={() => setFavoritesOnly(!favoritesOnly)}
          >
            <Star size={16} fill={favoritesOnly ? 'currentColor' : 'none'} />
            Favorites
          </button>
        </div>
      </motion.div>

      {/* Gallery */}
      <div className={styles.gallery}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Loading photos...</span>
          </div>
        ) : photos.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Image size={40} />
            </div>
            <h3>No photos found</h3>
            <p>
              {searchQuery 
                ? 'Try a different search term' 
                : 'Upload some photos from the admin panel'}
            </p>
          </div>
        ) : (
          <>
            <div className={styles.photosGrid}>
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  className={styles.photoCard}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  onClick={() => openLightbox(photo, index)}
                  layoutId={`photo-${photo.id}`}
                >
                  <img 
                    src={photo.thumbnail_url || photo.url} 
                    alt={photo.title || 'Photo'} 
                    loading="lazy"
                  />
                  <div className={styles.photoOverlay}>
                    <span className={styles.photoTitle}>
                      {photo.title || 'Untitled'}
                    </span>
                    <span className={styles.photoMeta}>
                      {formatDate(photo.upload_date)}
                      {photo.album_name && ` • ${photo.album_name}`}
                    </span>
                  </div>
                  {photo.is_favorite && (
                    <div className={styles.photoFavorite}>
                      <Star size={18} fill="currentColor" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {hasMore && (
              <div className={styles.loadMore}>
                <button 
                  className={styles.loadMoreBtn}
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <div className={styles.spinner} style={{ width: 16, height: 16 }} />
                      Loading...
                    </>
                  ) : (
                    'Load More Photos'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div 
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button className={styles.lightboxClose} onClick={closeLightbox}>
              <X size={24} />
            </button>
            
            {lightboxIndex > 0 && (
              <button 
                className={`${styles.lightboxNav} ${styles.lightboxNavPrev}`}
                onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
              >
                <ChevronLeft size={28} />
              </button>
            )}
            
            <motion.img 
              key={lightboxPhoto.id}
              src={lightboxPhoto.url} 
              alt={lightboxPhoto.title || 'Photo'} 
              className={styles.lightboxImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            />
            
            {lightboxIndex < photos.length - 1 && (
              <button 
                className={`${styles.lightboxNav} ${styles.lightboxNavNext}`}
                onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
              >
                <ChevronRight size={28} />
              </button>
            )}

            <motion.div 
              className={styles.lightboxInfo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className={styles.lightboxTitle}>
                {lightboxPhoto.title || 'Untitled'}
              </p>
              <p className={styles.lightboxMeta}>
                {lightboxPhoto.width && lightboxPhoto.height 
                  ? `${lightboxPhoto.width} × ${lightboxPhoto.height}` 
                  : ''}
                {lightboxPhoto.format && ` • ${lightboxPhoto.format.toUpperCase()}`}
                {lightboxPhoto.album_name && ` • ${lightboxPhoto.album_name}`}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Photos;
