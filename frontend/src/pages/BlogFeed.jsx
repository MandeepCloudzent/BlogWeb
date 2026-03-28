import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import { blogApi } from '../api/blogApi';
import { formatDate } from '../utils/formatDate';
import { truncateText } from '../utils/truncateText';
import './BlogFeed.css';

const BlogFeed = () => {
  const [params, setParams] = useState({
    page: 1,
    category: '',
    tag: '',
    search: '',
  });

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const { posts, loading, error, pagination } = usePosts(params);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          blogApi.getCategories(),
          blogApi.getTags(),
        ]);
        setCategories(catRes.data.results || catRes.data);
        setTags(tagRes.data.results || tagRes.data);
      } catch (err) {
        console.error('Failed to fetch categories/tags:', err);
      }
    };
    fetchMetadata();
  }, []);

  const handleParamChange = (name, value) => {
    setParams((prev) => ({
      ...prev,
      [name]: value,
      page: name === 'page' ? value : 1, // Reset to page 1 for new filters
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.elements.search.value;
    handleParamChange('search', query);
  };

  if (error) return <div className="error">Error loading posts: {error}</div>;

  return (
    <div className="blog-feed-container">
      <header className="feed-header">
        <h1>Explore Stories</h1>
        <p>Insights, tutorials, and inspiration from our community.</p>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            name="search"
            type="text"
            placeholder="Search for articles..."
            defaultValue={params.search}
          />
          <button type="submit">Search</button>
        </form>

        <div className="filters">
          <select
            value={params.category}
            onChange={(e) => handleParamChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>

          <select
            value={params.tag}
            onChange={(e) => handleParamChange('tag', e.target.value)}
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.slug}>{tag.name}</option>
            ))}
          </select>
        </div>
      </header>

      {loading ? (
        <div className="loading">Fetching posts...</div>
      ) : (
        <>
          <div className="posts-grid">
            {posts.length > 0 ? (
              posts.map((post) => (
                <article key={post.id} className="post-card">
                  {post.featured_image && (
                    <div className="post-image">
                      <img src={post.featured_image} alt={post.title} />
                    </div>
                  )}
                  <div className="post-content">
                    <div className="post-meta">
                      <span className="post-category">{post.category?.name || 'Uncategorized'}</span>
                      <span className="post-date">{formatDate(post.published_at || post.created_at)}</span>
                    </div>
                    <Link to={`/posts/${post.slug}`}>
                      <h3>{post.title}</h3>
                    </Link>
                    <p>{truncateText(post.excerpt || post.content, 120)}</p>
                    <div className="post-footer">
                      <span className="post-author">By {post.author.username}</span>
                      <Link to={`/posts/${post.slug}`} className="read-more">Read More →</Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="no-posts">No posts found matching your criteria.</p>
            )}
          </div>

          <div className="pagination">
            <button
              disabled={!pagination.previous}
              onClick={() => handleParamChange('page', params.page - 1)}
            >
              Previous
            </button>
            <span className="page-info">Page {params.page}</span>
            <button
              disabled={!pagination.next}
              onClick={() => handleParamChange('page', params.page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BlogFeed;
