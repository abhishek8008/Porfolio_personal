import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Image, 
  FolderPlus, 
  Upload, 
  Search,
  Grid3X3,
  LayoutGrid,
  Star,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Edit2,
  Download,
  HardDrive,
  Images,
  Heart,
  Folder,
  Plus,
  MoreVertical
} from 'lucide-react';
import { photoVaultAPI } from '../../services/api';
import styles from './PhotoVault.module.css';

const PhotoVault = () => {
  // State
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [stats, setStats] = useState({ totalPhotos: 0, totalAlbums: 0, favorites: 0, totalStorageMB: '0' });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Filters
  const [selectedAlbum, setSelectedAlbum] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Selection
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);
  
  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Form state
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDesc, setNewAlbumDesc] = useState('');
  const [uploadAlbumId, setUploadAlbumId] = useState('');
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef(null);
  const gridRef = useRef(null);

  // Fetch data
  const fetchAlbums = async () => {
    try {
      const data = await photoVaultAPI.getAlbums();
      setAlbums(data.albums || []);
    } catch (error) {
      console.error('Failed to fetch albums:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await photoVaultAPI.getStats();
      setStats(data.stats || { totalPhotos: 0, totalAlbums: 0, favorites: 0, totalStorageMB: '0' });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

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
        limit: 36,
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
    fetchAlbums();
    fetchStats();
  }, []);

  // Fetch photos when filters change
  useEffect(() => {
    fetchPhotos(true);
  }, [selectedAlbum, favoritesOnly, searchQuery]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchPhotos(false);
    }
  }, [page]);

  // Album handlers
  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return;

    try {
      await photoVaultAPI.createAlbum({ 
        name: newAlbumName.trim(), 
        description: newAlbumDesc.trim() 
      });
      await fetchAlbums();
      await fetchStats();
      setNewAlbumName('');
      setNewAlbumDesc('');
      setShowAlbumModal(false);
    } catch (error) {
      console.error('Failed to create album:', error);
      alert('Failed to create album: ' + error.message);
    }
  };

  const handleUpdateAlbum = async () => {
    if (!editingAlbum || !newAlbumName.trim()) return;

    try {
      await photoVaultAPI.updateAlbum(editingAlbum.id, { 
        name: newAlbumName.trim(), 
        description: newAlbumDesc.trim() 
      });
      await fetchAlbums();
      setEditingAlbum(null);
      setNewAlbumName('');
      setNewAlbumDesc('');
      setShowAlbumModal(false);
    } catch (error) {
      console.error('Failed to update album:', error);
      alert('Failed to update album: ' + error.message);
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    if (!confirm('Delete this album? Photos will be moved to Uncategorized.')) return;

    try {
      await photoVaultAPI.deleteAlbum(albumId);
      await fetchAlbums();
      await fetchStats();
      if (selectedAlbum === albumId.toString()) {
        setSelectedAlbum('all');
      }
    } catch (error) {
      console.error('Failed to delete album:', error);
      alert('Failed to delete album: ' + error.message);
    }
  };

  // Upload handlers
  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      handleUpload(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleUpload(files);
    }
    e.target.value = '';
  };

  const handleUpload = async (files) => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Get album name for upload
      const album = albums.find(a => a.id.toString() === uploadAlbumId);
      const albumName = album?.name || 'Uncategorized';

      // Upload to Cloudinary
      const uploadResult = await photoVaultAPI.uploadPhotos(files, albumName, setUploadProgress);

      if (uploadResult.data.uploaded.length > 0) {
        // Save metadata to database
        await photoVaultAPI.savePhotosBulk(
          uploadResult.data.uploaded,
          uploadAlbumId ? parseInt(uploadAlbumId) : null
        );

        // Refresh data
        await fetchPhotos(true);
        await fetchAlbums();
        await fetchStats();
        setShowUploadModal(false);
      }

      if (uploadResult.data.failed.length > 0) {
        alert(`${uploadResult.data.failed.length} files failed to upload`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Photo handlers
  const handleToggleFavorite = async (photoId, e) => {
    e?.stopPropagation();
    try {
      await photoVaultAPI.toggleFavorite(photoId);
      setPhotos(prev => prev.map(p => 
        p.id === photoId ? { ...p, is_favorite: !p.is_favorite } : p
      ));
      await fetchStats();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDeletePhoto = async (photoId, publicId, e) => {
    e?.stopPropagation();
    if (!confirm('Delete this photo permanently?')) return;

    try {
      // Delete from database
      await photoVaultAPI.deletePhoto(photoId);
      // Delete from Cloudinary
      await photoVaultAPI.deleteFromCloudinary(publicId);
      
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      await fetchAlbums();
      await fetchStats();
    } catch (error) {
      console.error('Failed to delete photo:', error);
      alert('Failed to delete photo: ' + error.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPhotos.size === 0) return;
    if (!confirm(`Delete ${selectedPhotos.size} photos permanently?`)) return;

    try {
      const ids = Array.from(selectedPhotos);
      const photosToDelete = photos.filter(p => ids.includes(p.id));
      const publicIds = photosToDelete.map(p => p.public_id);

      // Delete from database
      await photoVaultAPI.deletePhotosBulk(ids);
      // Delete from Cloudinary
      await photoVaultAPI.bulkDeleteFromCloudinary(publicIds);

      setPhotos(prev => prev.filter(p => !ids.includes(p.id)));
      setSelectedPhotos(new Set());
      setSelectMode(false);
      await fetchAlbums();
      await fetchStats();
    } catch (error) {
      console.error('Failed to delete photos:', error);
      alert('Failed to delete photos: ' + error.message);
    }
  };

  const togglePhotoSelection = (photoId) => {
    setSelectedPhotos(prev => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  // Lightbox handlers
  const openLightbox = (photo, index) => {
    if (selectMode) {
      togglePhotoSelection(photo.id);
      return;
    }
    setLightboxPhoto(photo);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxPhoto(null);
  };

  const navigateLightbox = (direction) => {
    const newIndex = lightboxIndex + direction;
    if (newIndex >= 0 && newIndex < photos.length) {
      setLightboxIndex(newIndex);
      setLightboxPhoto(photos[newIndex]);
    }
  };

  // Load more handler
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // Render album modal
  const renderAlbumModal = () => (
    <div className={styles.modalOverlay} onClick={() => { setShowAlbumModal(false); setEditingAlbum(null); }}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {editingAlbum ? 'Edit Album' : 'Create Album'}
          </h3>
          <button className={styles.modalClose} onClick={() => { setShowAlbumModal(false); setEditingAlbum(null); }}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Album Name</label>
            <input
              type="text"
              className={styles.formInput}
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              placeholder="Enter album name"
              autoFocus
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description (optional)</label>
            <textarea
              className={styles.formTextarea}
              value={newAlbumDesc}
              onChange={(e) => setNewAlbumDesc(e.target.value)}
              placeholder="Enter album description"
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => { setShowAlbumModal(false); setEditingAlbum(null); }}>
            Cancel
          </button>
          <button 
            className={`${styles.btn} ${styles.btnPrimary}`} 
            onClick={editingAlbum ? handleUpdateAlbum : handleCreateAlbum}
            disabled={!newAlbumName.trim()}
          >
            {editingAlbum ? 'Save Changes' : 'Create Album'}
          </button>
        </div>
      </div>
    </div>
  );

  // Render upload modal
  const renderUploadModal = () => (
    <div className={styles.modalOverlay} onClick={() => !uploading && setShowUploadModal(false)}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Upload Photos</h3>
          <button className={styles.modalClose} onClick={() => !uploading && setShowUploadModal(false)} disabled={uploading}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Upload to Album</label>
            <select
              className={styles.albumSelect}
              value={uploadAlbumId}
              onChange={(e) => setUploadAlbumId(e.target.value)}
              disabled={uploading}
            >
              <option value="">Uncategorized</option>
              {albums.map(album => (
                <option key={album.id} value={album.id}>{album.name}</option>
              ))}
            </select>
          </div>

          {uploading ? (
            <div className={styles.uploadProgress}>
              <div className={styles.uploadProgressBar}>
                <div 
                  className={styles.uploadProgressFill} 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className={styles.uploadProgressText}>
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
            </div>
          ) : (
            <div
              className={`${styles.uploadZone} ${dragOver ? styles.uploadZoneDragging : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={styles.uploadIcon}>
                <Upload size={24} />
              </div>
              <h4>Drop photos here or click to browse</h4>
              <p>Supports JPEG, PNG, GIF, WebP • Max 25MB per file • Up to 20 files</p>
              <input
                ref={fileInputRef}
                type="file"
                className={styles.uploadInput}
                accept="image/*"
                multiple
                onChange={handleFileSelect}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render lightbox
  const renderLightbox = () => (
    <div className={styles.lightbox} onClick={closeLightbox}>
      <button className={styles.lightboxClose} onClick={closeLightbox}>
        <X size={24} />
      </button>
      
      {lightboxIndex > 0 && (
        <button 
          className={`${styles.lightboxNav} ${styles.lightboxNavPrev}`}
          onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
        >
          <ChevronLeft size={24} />
        </button>
      )}
      
      <img 
        src={lightboxPhoto.url} 
        alt={lightboxPhoto.title || 'Photo'} 
        className={styles.lightboxImage}
        onClick={e => e.stopPropagation()}
      />
      
      {lightboxIndex < photos.length - 1 && (
        <button 
          className={`${styles.lightboxNav} ${styles.lightboxNavNext}`}
          onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
        >
          <ChevronRight size={24} />
        </button>
      )}

      <div className={styles.lightboxInfo}>
        <p className={styles.lightboxTitle}>{lightboxPhoto.title || 'Untitled'}</p>
        <p className={styles.lightboxMeta}>
          {lightboxPhoto.width}×{lightboxPhoto.height} • {lightboxPhoto.format?.toUpperCase()}
        </p>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Photo Vault</h1>
          <div className={styles.headerActions}>
            <button 
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={() => { setShowAlbumModal(true); setNewAlbumName(''); setNewAlbumDesc(''); }}
            >
              <FolderPlus size={18} />
              <span>New Album</span>
            </button>
            <button 
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => setShowUploadModal(true)}
            >
              <Upload size={18} />
              <span>Upload</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><Images size={20} /></div>
            <div className={styles.statInfo}>
              <h4>{stats.totalPhotos}</h4>
              <p>Total Photos</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><Folder size={20} /></div>
            <div className={styles.statInfo}>
              <h4>{stats.totalAlbums}</h4>
              <p>Albums</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><Heart size={20} /></div>
            <div className={styles.statInfo}>
              <h4>{stats.favorites}</h4>
              <p>Favorites</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><HardDrive size={20} /></div>
            <div className={styles.statInfo}>
              <h4>{stats.totalStorageMB} MB</h4>
              <p>Storage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
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
          <button
            className={`${styles.btnIcon} ${favoritesOnly ? styles.btnIconActive : ''}`}
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            title="Show favorites only"
          >
            <Star size={18} />
          </button>
        </div>
        <div className={styles.toolbarRight}>
          <button
            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
            onClick={() => { setSelectMode(!selectMode); setSelectedPhotos(new Set()); }}
          >
            {selectMode ? 'Cancel' : 'Select'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Albums Sidebar */}
        <div className={styles.albumsSidebar}>
          <div className={styles.albumsSidebarHeader}>
            <span className={styles.albumsSidebarTitle}>Albums</span>
            <button 
              className={styles.btnIcon}
              onClick={() => { setShowAlbumModal(true); setNewAlbumName(''); setNewAlbumDesc(''); }}
            >
              <Plus size={16} />
            </button>
          </div>
          
          <button
            className={`${styles.albumItem} ${selectedAlbum === 'all' ? styles.albumItemActive : ''}`}
            onClick={() => setSelectedAlbum('all')}
          >
            <div className={styles.albumCoverPlaceholder}>
              <Images size={18} />
            </div>
            <div className={styles.albumInfo}>
              <span className={styles.albumName}>All Photos</span>
              <span className={styles.albumCount}>{stats.totalPhotos} photos</span>
            </div>
          </button>

          {albums.map(album => (
            <button
              key={album.id}
              className={`${styles.albumItem} ${selectedAlbum === album.id.toString() ? styles.albumItemActive : ''}`}
              onClick={() => setSelectedAlbum(album.id.toString())}
            >
              {album.cover_thumbnail ? (
                <img src={album.cover_thumbnail} alt="" className={styles.albumCover} />
              ) : (
                <div className={styles.albumCoverPlaceholder}>
                  <Folder size={18} />
                </div>
              )}
              <div className={styles.albumInfo}>
                <span className={styles.albumName}>{album.name}</span>
                <span className={styles.albumCount}>{album.photo_count || 0} photos</span>
              </div>
              {album.name !== 'Uncategorized' && (
                <div className={styles.albumActions}>
                  <button
                    className={styles.btnIcon}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAlbum(album);
                      setNewAlbumName(album.name);
                      setNewAlbumDesc(album.description || '');
                      setShowAlbumModal(true);
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className={styles.btnIcon}
                    onClick={(e) => { e.stopPropagation(); handleDeleteAlbum(album.id); }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Photos Grid */}
        <div className={styles.photosGrid} ref={gridRef}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <span>Loading photos...</span>
            </div>
          ) : photos.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Image size={32} />
              </div>
              <h3>No photos yet</h3>
              <p>Upload your first photos to get started</p>
              <button 
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => setShowUploadModal(true)}
              >
                <Upload size={18} />
                <span>Upload Photos</span>
              </button>
            </div>
          ) : (
            <>
              {photos.map((photo, index) => (
                <div 
                  key={photo.id} 
                  className={styles.photoCard}
                  onClick={() => openLightbox(photo, index)}
                >
                  <img 
                    src={photo.thumbnail_url || photo.url} 
                    alt={photo.title || 'Photo'} 
                    loading="lazy"
                  />
                  <div className={styles.photoOverlay}>
                    <span className={styles.photoTitle}>{photo.title || 'Untitled'}</span>
                  </div>
                  
                  {selectMode && (
                    <div 
                      className={`${styles.photoCheckbox} ${selectedPhotos.has(photo.id) ? styles.checked : ''}`}
                      onClick={(e) => { e.stopPropagation(); togglePhotoSelection(photo.id); }}
                    >
                      {selectedPhotos.has(photo.id) && <Check size={14} />}
                    </div>
                  )}

                  {!selectMode && (
                    <div className={styles.photoActions}>
                      <button
                        className={`${styles.photoActionBtn} ${photo.is_favorite ? styles.favoriteActive : ''}`}
                        onClick={(e) => handleToggleFavorite(photo.id, e)}
                      >
                        <Star size={14} fill={photo.is_favorite ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        className={styles.photoActionBtn}
                        onClick={(e) => handleDeletePhoto(photo.id, photo.public_id, e)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {hasMore && (
                <div className={styles.loadMore}>
                  <button 
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Selection Bar */}
      {selectMode && selectedPhotos.size > 0 && (
        <div className={styles.selectionBar}>
          <span className={styles.selectionCount}>{selectedPhotos.size} selected</span>
          <button 
            className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`}
            onClick={handleBulkDelete}
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Modals */}
      {showAlbumModal && renderAlbumModal()}
      {showUploadModal && renderUploadModal()}
      {lightboxPhoto && renderLightbox()}
    </div>
  );
};

export default PhotoVault;
