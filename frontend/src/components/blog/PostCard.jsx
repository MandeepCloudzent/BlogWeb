import { Link } from 'react-router-dom';
import { FiClock, FiMessageCircle } from 'react-icons/fi';
import { formatDate } from '../../utils/formatDate';
import { truncateText } from '../../utils/truncateText';
import './PostCard.css';

export default function PostCard({ post }) {
  return (
    <article className="post-card card animate-fade-in">
      {post.featured_image && (
        <Link to={`/blog/${post.slug}`}>
          <img src={post.featured_image} alt={post.title} className="card-image" />
        </Link>
      )}
      <div className="card-body">
        <div className="post-card-meta">
          {post.categories?.map((cat) => (
            <Link key={cat.id} to={`/blog?category=${cat.slug}`} className="badge badge-primary">
              {cat.name}
            </Link>
          ))}
        </div>

        <h3 className="post-card-title">
          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        <p className="post-card-excerpt">{truncateText(post.excerpt, 120)}</p>

        <div className="post-card-footer">
          <div className="post-card-author">
            <div className="author-avatar">
              {post.author?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="author-name">{post.author?.username}</span>
              <span className="post-date">{formatDate(post.published_at)}</span>
            </div>
          </div>

          <div className="post-card-stats">
            <span><FiClock size={14} /> {post.read_time_minutes} min</span>
            <span><FiMessageCircle size={14} /> {post.comment_count || 0}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
