import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Trash2, 
  Eye, 
  EyeOff, 
  Clock, 
  User, 
  AtSign,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  X,
  ChevronDown
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import styles from './MessagesManager.module.css';

const MessagesManager = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getMessages();
      if (response.success) {
        setMessages(response.messages || []);
      }
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const response = await adminAPI.markMessageRead(id);
      if (response.success) {
        setMessages(messages.map(msg => 
          msg.id === id ? { ...msg, is_read: true } : msg
        ));
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, is_read: true });
        }
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await adminAPI.deleteMessage(id);
      if (response.success) {
        setMessages(messages.filter(msg => msg.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const openMessage = (message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      handleMarkAsRead(message.id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
      }
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const filteredMessages = messages.filter(msg => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !msg.is_read) || 
      (filter === 'read' && msg.is_read);
    
    const matchesSearch = searchTerm === '' || 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleWrapper}>
            <Mail className={styles.titleIcon} />
            <h1 className={styles.title}>Messages</h1>
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>{unreadCount} new</span>
            )}
          </div>
          <p className={styles.subtitle}>
            {messages.length} total message{messages.length !== 1 ? 's' : ''} from visitors
          </p>
        </div>
        <button onClick={fetchMessages} className={styles.refreshBtn}>
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterTabs}>
          <button 
            className={`${styles.filterTab} ${filter === 'all' ? styles.filterTabActive : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`${styles.filterTab} ${filter === 'unread' ? styles.filterTabActive : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button 
            className={`${styles.filterTab} ${filter === 'read' ? styles.filterTabActive : ''}`}
            onClick={() => setFilter('read')}
          >
            Read
          </button>
        </div>
      </div>

      {/* Messages List & Detail View */}
      <div className={styles.content}>
        {/* Messages List */}
        <div className={styles.messagesList}>
          {filteredMessages.length === 0 ? (
            <div className={styles.emptyState}>
              <MessageSquare size={48} />
              <h3>No messages found</h3>
              <p>
                {filter !== 'all' 
                  ? 'Try changing the filter or search term'
                  : 'Messages from visitors will appear here'
                }
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${styles.messageItem} ${!message.is_read ? styles.messageUnread : ''} ${selectedMessage?.id === message.id ? styles.messageSelected : ''}`}
                  onClick={() => openMessage(message)}
                >
                  <div className={styles.messageStatus}>
                    {message.is_read ? (
                      <Eye size={16} className={styles.readIcon} />
                    ) : (
                      <div className={styles.unreadDot} />
                    )}
                  </div>
                  <div className={styles.messagePreview}>
                    <div className={styles.messageHeader}>
                      <span className={styles.messageSender}>{message.name}</span>
                      <span className={styles.messageTime}>{formatDate(message.created_at)}</span>
                    </div>
                    <div className={styles.messageSubject}>
                      {message.subject || 'No Subject'}
                    </div>
                    <div className={styles.messageSnippet}>
                      {message.message.substring(0, 80)}
                      {message.message.length > 80 ? '...' : ''}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Message Detail */}
        <div className={styles.messageDetail}>
          {selectedMessage ? (
            <motion.div
              key={selectedMessage.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={styles.detailContent}
            >
              <div className={styles.detailHeader}>
                <h2 className={styles.detailSubject}>
                  {selectedMessage.subject || 'No Subject'}
                </h2>
                <div className={styles.detailActions}>
                  {!selectedMessage.is_read && (
                    <button 
                      onClick={() => handleMarkAsRead(selectedMessage.id)}
                      className={styles.actionBtn}
                      title="Mark as read"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => setDeleteConfirm(selectedMessage.id)}
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    title="Delete message"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className={styles.senderInfo}>
                <div className={styles.senderAvatar}>
                  {selectedMessage.name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.senderDetails}>
                  <div className={styles.senderName}>
                    <User size={14} />
                    {selectedMessage.name}
                  </div>
                  <a href={`mailto:${selectedMessage.email}`} className={styles.senderEmail}>
                    <AtSign size={14} />
                    {selectedMessage.email}
                  </a>
                  <div className={styles.messageDate}>
                    <Clock size={14} />
                    {new Date(selectedMessage.created_at).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              <div className={styles.messageBody}>
                {selectedMessage.message}
              </div>

              <div className={styles.replySection}>
                <a 
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your message'}`}
                  className={styles.replyBtn}
                >
                  <Mail size={18} />
                  Reply via Email
                </a>
              </div>
            </motion.div>
          ) : (
            <div className={styles.noSelection}>
              <Mail size={64} />
              <h3>Select a message</h3>
              <p>Choose a message from the list to view its contents</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalIcon}>
                <Trash2 size={32} />
              </div>
              <h3>Delete Message?</h3>
              <p>This action cannot be undone. The message will be permanently deleted.</p>
              <div className={styles.modalActions}>
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(deleteConfirm)}
                  className={styles.confirmDeleteBtn}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessagesManager;
