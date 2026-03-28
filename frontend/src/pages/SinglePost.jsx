import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiClock, FiCalendar, FiArrowLeft, FiHeart, FiBookmark, FiMessageSquare } from 'react-icons/fi';
import { blogApi } from '../api/blogApi';
import { formatDate } from '../utils/formatDate';
import { useAuth } from '../hooks/useAuth';
import './SinglePost.css';

const SinglePost = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentBody, setCommentBody] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchPost = async () => {
    try {
      const { data } = await blogApi.getPost(slug);
      setPost(data);
    } catch (err) {
      setError('Post not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const { data } = await blogApi.likePost(slug);
      setPost(prev => ({
        ...prev,
        is_liked: data.liked,
        likes_count: data.likes_count
      }));
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const { data } = await blogApi.bookmarkPost(slug);
      setPost(prev => ({
        ...prev,
        is_bookmarked: data.bookmarked
      }));
    } catch (err) {
      console.error('Failed to bookmark post:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!commentBody.trim()) return;

    setSubmittingComment(true);
    try {
      await blogApi.createComment(slug, { body: commentBody });
      setCommentBody('');
      // Refresh post to show new comment
      fetchPost();
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <div className="loading">Loading article...</div>;
  if (error || !post) return <div className="error">{error || 'Post not found'}</div>;

  return (
    <div className="single-post-container">
      <Link to="/" className="back-link">
        <FiArrowLeft /> Back to Feed
      </Link>

      <article className="post-full">
        <header className="post-header">
          {post.category && (
            <span className="post-category-badge">{post.category.name}</span>
          )}
          <h1>{post.title}</h1>
          <div className="post-meta-detailed">
            <div className="author-info">
              <div className="author-avatar-large">
                {post.author.username.charAt(0).toUpperCase()}
              </div>
              <div className="author-text">
                <span className="author-name">{post.author.username}</span>
                <div className="meta-sub">
                  <span><FiCalendar /> {formatDate(post.published_at || post.created_at)}</span>
                  <span><FiClock /> {post.read_time_minutes} min read</span>
                </div>
              </div>
            </div>

            <div className="post-interactions-top">
              <button 
                className={`interaction-btn ${post.is_liked ? 'active' : ''}`}
                onClick={handleLike}
                title="Like"
              >
                <FiHeart fill={post.is_liked ? "currentColor" : "none"} />
                <span>{post.likes_count}</span>
              </button>
              <button 
                className={`interaction-btn ${post.is_bookmarked ? 'active' : ''}`}
                onClick={handleBookmark}
                title="Save for later"
              >
                <FiBookmark fill={post.is_bookmarked ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </header>

        {post.featured_image && (
          <div className="post-hero-image">
            <img src={post.featured_image} alt={post.title} />
          </div>
        )}

        <div className="post-body-content" dangerouslySetInnerHTML={{ __html: post.content }} />

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags-list">
            {post.tags.map(tag => (
              <span key={tag.id} className="tag-item">#{tag.name}</span>
            ))}
          </div>
        )}

        <footer className="post-footer-actions">
           <div className="post-interactions-bottom">
              <button 
                className={`interaction-btn large ${post.is_liked ? 'active' : ''}`}
                onClick={handleLike}
              >
                <FiHeart fill={post.is_liked ? "currentColor" : "none"} />
                <span>{post.is_liked ? 'Liked' : 'Like Post'}</span>
              </button>
              <button 
                className={`interaction-btn large ${post.is_bookmarked ? 'active' : ''}`}
                onClick={handleBookmark}
              >
                <FiBookmark fill={post.is_bookmarked ? "currentColor" : "none"} />
                <span>{post.is_bookmarked ? 'Saved' : 'Save for later'}</span>
              </button>
            </div>
        </footer>
      </article>

      <section className="comments-section">
        <h3><FiMessageSquare /> Comments ({post.comments?.length || 0})</h3>
        
        {user ? (
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <textarea
              placeholder="Write a comment..."
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              required
            ></textarea>
            <button type="submit" disabled={submittingComment}>
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div className="comment-login-prompt">
            Please <Link to="/login">login</Link> to join the conversation.
          </div>
        )}

        <div className="comments-list">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map(comment => (
              <div key={comment.id} className="comment-card">
                <div className="comment-header">
                  <div className="comment-author-avatar">
                    {comment.author.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="comment-meta">
                    <span className="comment-author-name">{comment.author.username}</span>
                    <span className="comment-date">{formatDate(comment.created_at)}</span>
                  </div>
                </div>
                <div className="comment-body">
                  {comment.body}
                </div>
              </div>
            ))
          ) : (
            <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default SinglePost;
