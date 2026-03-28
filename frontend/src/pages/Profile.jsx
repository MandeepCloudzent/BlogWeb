import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { blogApi } from '../api/blogApi';
import { authApi } from '../api/authApi';
import { formatDate } from '../utils/formatDate';
import { FiSettings, FiFileText, FiBookmark, FiEdit, FiTrash2, FiPlus, FiLink, FiTwitter, FiGithub, FiCalendar, FiImage, FiEye, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useRef } from 'react';
import './Profile.css';

const Profile = () => {
  const { user, profile, fetchProfile } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'bookmarks', 'settings-profile', 'settings-password'
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  
  // Avatar states
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const avatarInputRef = useRef(null);

  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Profile Settings State
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    bio: '',
    website: '',
    social_twitter: '',
    social_github: '',
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Settings State
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === 'settings-profile' && profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        website: profile.website || '',
        social_twitter: profile.social_twitter || '',
        social_github: profile.social_github || '',
      });
    }
  }, [activeTab, profile]);

  // Handle clicking outside the settings & avatar dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.settings-dropdown-wrapper')) {
        setShowSettingsMenu(false);
      }
      if (!e.target.closest('.avatar-wrapper')) {
        setShowAvatarMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    const toastId = toast.loading('Uploading new avatar...');
    try {
      await authApi.updateProfile(formData);
      toast.success('Avatar updated successfully!', { id: toastId });
      await fetchProfile();
    } catch (err) {
      toast.error('Failed to update avatar', { id: toastId });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await authApi.updateProfile(profileForm);
      toast.success('Profile updated successfully!');
      await fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    setUpdatingPassword(true);
    try {
      await authApi.changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.old_password?.[0] || 'Failed to change password';
      toast.error(errorMsg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'posts') {
        const { data } = await blogApi.getPosts({ author: user.username });
        setMyPosts(data.results || data);
      } else if (activeTab === 'bookmarks') {
        const { data } = await blogApi.getBookmarks();
        setSavedPosts(data.results || data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (slug) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await blogApi.deletePost(slug);
        setMyPosts(myPosts.filter(p => p.slug !== slug));
      } catch (err) {
        alert('Failed to delete post');
      }
    }
  };

  const renderPosts = (posts, isOwner = false) => (
    <div className="dashboard-grid">
      {posts.length > 0 ? (
        posts.map(post => (
          <div key={post.id} className="dashboard-card">
            {post.featured_image && (
              <img src={post.featured_image} alt={post.title} className="card-thumb" />
            )}
            <div className="card-content">
              <span className={`status-badge ${post.status}`}>{post.status}</span>
              <Link to={`/posts/${post.slug}`}>
                <h4>{post.title}</h4>
              </Link>
              <p className="card-date">{formatDate(post.created_at)}</p>
              
              {isOwner && (
                <div className="card-actions">
                  <Link to={`/edit-post/${post.slug}`} className="action-btn edit">
                    <FiEdit /> Edit
                  </Link>
                  <button 
                    onClick={() => handleDeletePost(post.slug)} 
                    className="action-btn delete"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="empty-dashboard">
          <p>No posts found.</p>
          {isOwner && (
            <Link to="/create-post" className="create-btn">
              <FiPlus /> Create Your First Post
            </Link>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="profile-hero">
          <div className="avatar-wrapper" style={{ position: 'relative' }}>
            <div 
              className="user-avatar-huge" 
              onClick={() => setShowAvatarMenu(!showAvatarMenu)}
              style={{ cursor: 'pointer' }}
              title="Click to manage avatar"
            >
              {profile?.avatar ? (
                <img src={profile.avatar} alt={user?.username} className="avatar-image" />
              ) : (
                user?.username?.charAt(0).toUpperCase()
              )}
            </div>

            {/* Hidden file input for Avatar upload */}
            <input 
              type="file" 
              accept="image/*" 
              ref={avatarInputRef} 
              style={{ display: 'none' }} 
              onChange={handleAvatarFileChange} 
            />

            {/* Avatar Menu Dropdown */}
            {showAvatarMenu && (
              <div className="avatar-dropdown-menu">
                <button onClick={() => { setShowAvatarModal(true); setShowAvatarMenu(false); }}>
                  <FiEye /> See Avatar
                </button>
                <button onClick={() => { avatarInputRef.current.click(); setShowAvatarMenu(false); }}>
                  <FiImage /> Edit Avatar
                </button>
              </div>
            )}
          </div>
          
          <div className="profile-hero-content">
            <div className="profile-title-row">
              <h2>{profile?.full_name || user?.username}</h2>
              {profile?.full_name && <span className="username-badge">@{user?.username}</span>}
            </div>
            
            {profile?.bio ? (
              <p className="profile-bio">{profile.bio}</p>
            ) : (
              <p className="profile-bio empty-bio">Tell the world about yourself in the settings tab.</p>
            )}
            
            <div className="profile-meta">
              <span className="meta-item"><FiCalendar /> Joined {formatDate(user?.date_joined || new Date())}</span>
              {profile?.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="meta-item link">
                  <FiLink /> Website
                </a>
              )}
              {profile?.social_twitter && (
                <a href={`https://twitter.com/${profile.social_twitter}`} target="_blank" rel="noopener noreferrer" className="meta-item link">
                  <FiTwitter /> Twitter
                </a>
              )}
              {profile?.social_github && (
                <a href={`https://github.com/${profile.social_github}`} target="_blank" rel="noopener noreferrer" className="meta-item link">
                  <FiGithub /> GitHub
                </a>
              )}
            </div>
          </div>
          
          <div className="profile-stats">
            <div className="stat-box">
              <span className="stat-number">{myPosts.length}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{savedPosts.length}</span>
              <span className="stat-label">Saved</span>
            </div>
          </div>
        </div>

        <nav className="dashboard-tabs">
          <button 
            className={activeTab === 'posts' ? 'active' : ''} 
            onClick={() => setActiveTab('posts')}
          >
            <FiFileText /> My Posts
          </button>
          <button 
            className={activeTab === 'bookmarks' ? 'active' : ''} 
            onClick={() => setActiveTab('bookmarks')}
          >
            <FiBookmark /> Saved Posts
          </button>
          <div className="settings-dropdown-wrapper" style={{ position: 'relative' }}>
            <button 
              className={activeTab.startsWith('settings') ? 'active' : ''} 
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            >
              <FiSettings /> Settings
            </button>
            {showSettingsMenu && (
              <div className="settings-dropdown-menu">
                <button onClick={() => { setActiveTab('settings-profile'); setShowSettingsMenu(false); }}>
                  Edit Profile
                </button>
                <button onClick={() => { setActiveTab('settings-password'); setShowSettingsMenu(false); }}>
                  Change Password
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="dashboard-content">
        {loading ? (
          <div className="loading">Loading dashboard...</div>
        ) : (
          <>
            {activeTab === 'posts' && renderPosts(myPosts, true)}
            {activeTab === 'bookmarks' && renderPosts(savedPosts, false)}
            
            {activeTab === 'settings-profile' && (
              <div className="settings-container">
                <div className="settings-section">
                  <h3>Edit Profile</h3>
                  <form className="settings-form" onSubmit={handleUpdateProfile}>
                     <div className="form-group-row">
                       <div className="form-group">
                         <label>Username (Read Only)</label>
                         <input type="text" value={user?.username} disabled className="readonly-input" />
                       </div>
                       <div className="form-group">
                         <label>Email (Read Only)</label>
                         <input type="text" value={user?.email} disabled className="readonly-input" />
                       </div>
                     </div>
                     <div className="form-group">
                       <label>Full Name</label>
                       <input 
                         type="text" 
                         value={profileForm.full_name} 
                         onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})} 
                         placeholder="Your full name"
                       />
                     </div>
                     <div className="form-group">
                       <label>Bio</label>
                       <textarea 
                         value={profileForm.bio} 
                         onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})} 
                         placeholder="Tell us about yourself..."
                         rows="4"
                       />
                     </div>
                     <div className="form-group-row">
                       <div className="form-group">
                         <label>Website</label>
                         <input 
                           type="url" 
                           value={profileForm.website} 
                           onChange={(e) => setProfileForm({...profileForm, website: e.target.value})} 
                           placeholder="https://yourwebsite.com"
                         />
                       </div>
                       <div className="form-group">
                         <label>Twitter Handle</label>
                         <input 
                           type="text" 
                           value={profileForm.social_twitter} 
                           onChange={(e) => setProfileForm({...profileForm, social_twitter: e.target.value})} 
                           placeholder="@username"
                         />
                       </div>
                     </div>
                     <div className="form-buttons mt-4">
                       <button type="submit" className="btn btn-primary" disabled={updatingProfile}>
                         {updatingProfile ? 'Saving...' : 'Update Profile'}
                       </button>
                     </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'settings-password' && (
              <div className="settings-container">
                <div className="settings-section">
                  <h3>Change Password</h3>
                  <form className="settings-form" onSubmit={handleChangePassword}>
                     <div className="form-group">
                       <label>Current Password</label>
                       <input 
                         type="password" 
                         required
                         value={passwordForm.old_password} 
                         onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})} 
                       />
                     </div>
                     <div className="form-group">
                       <label>New Password</label>
                       <input 
                         type="password"
                         required 
                         minLength="8"
                         value={passwordForm.new_password} 
                         onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})} 
                       />
                     </div>
                     <div className="form-group">
                       <label>Confirm New Password</label>
                       <input 
                         type="password"
                         required 
                         minLength="8"
                         value={passwordForm.confirm_password} 
                         onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})} 
                       />
                     </div>
                     <div className="form-buttons mt-4">
                       <button type="submit" className="btn btn-secondary" disabled={updatingPassword}>
                         {updatingPassword ? 'Updating...' : 'Change Password'}
                       </button>
                     </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Avatar Fullscreen Modal */}
      {showAvatarModal && (
        <div className="avatar-modal-overlay" onClick={() => setShowAvatarModal(false)}>
          <button className="close-modal-btn" onClick={() => setShowAvatarModal(false)}>
            <FiX />
          </button>
          <div className="avatar-modal-content" onClick={(e) => e.stopPropagation()}>
            {profile?.avatar ? (
              <img src={profile.avatar} alt={user?.username} className="modal-avatar-image" />
            ) : (
              <div className="modal-avatar-fallback">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="modal-avatar-username">@{user?.username}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
