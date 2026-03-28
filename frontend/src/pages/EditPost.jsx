import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { blogApi } from '../api/blogApi';
import toast from 'react-hot-toast';
import './CreatePost.css';

export default function EditPost() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', status: 'draft',
    is_featured: false, meta_title: '', meta_description: '',
    category_id: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    // Fetch categories and post data in parallel
    Promise.all([
      blogApi.getCategories(),
      blogApi.getPost(slug)
    ])
    .then(([catRes, postRes]) => {
      setCategories(catRes.data.results || catRes.data);
      const post = postRes.data;
      
      setForm({
        title: post.title || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        status: post.status || 'draft',
        is_featured: post.is_featured || false,
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        category_id: post.category?.id || ''
      });
      
      if (post.featured_image) {
        setCurrentImage(post.featured_image);
      }
    })
    .catch((err) => {
      toast.error('Failed to load post data');
      navigate('/profile');
    })
    .finally(() => {
      setFetching(false);
    });
  }, [slug, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'category_id' && !val) return; // skip if empty
        formData.append(key, val);
      });
      
      if (image) {
        formData.append('featured_image', image);
      }

      await blogApi.updatePost(slug, formData);
      toast.success('Post updated successfully!');
      navigate(`/posts/${slug}`);
    } catch (err) {
      toast.error('Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="page"><div className="container loading">Loading post editor...</div></div>;
  }

  return (
    <div className="page">
      <div className="container create-post-container">
        <h1 className="section-title">Edit Post</h1>
        <p className="section-subtitle">Update your amazing article.</p>

        <form className="create-post-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input name="title" className="form-input" placeholder="An amazing title..." value={form.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Excerpt</label>
            <textarea name="excerpt" className="form-input form-textarea" style={{ minHeight: 80 }} placeholder="Brief summary..." value={form.excerpt} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea name="content" className="form-input form-textarea" style={{ minHeight: 300 }} placeholder="Write your article..." value={form.content} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Featured Image</label>
              {currentImage && !image && (
                <div style={{ marginBottom: '10px' }}>
                  <img src={currentImage} alt="Current Feature" style={{ width: '150px', borderRadius: '8px' }} />
                  <p style={{ fontSize: '0.85rem', color: '#666' }}>Current Image</p>
                </div>
              )}
              <input type="file" accept="image/*" className="form-input" onChange={(e) => setImage(e.target.files[0])} />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-input" value={form.status} onChange={handleChange}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              name="category_id" 
              className="form-input" 
              value={form.category_id} 
              onChange={handleChange}
            >
              <option value="">-- Select a Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
              Feature this post
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
