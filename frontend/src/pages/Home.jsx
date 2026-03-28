import { Link } from 'react-router-dom';
import { FiArrowRight, FiEdit3, FiUsers, FiZap } from 'react-icons/fi';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/blog/PostCard';
import Loader from '../components/common/Loader';
import { APP_NAME } from '../utils/constants';
import './Home.css';

export default function Home() {
  const { posts, loading } = usePosts({ page_size: 6 });

  return (
    <div className="home-page">
      {/* ─── Hero Section ─── */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content animate-slide-up">
            <span className="hero-badge">✦ Welcome to {APP_NAME}</span>
            <h1 className="hero-title">
              Where Ideas Come <br />
              <span className="gradient-text">To Life</span>
            </h1>
            <p className="hero-subtitle">
              A premium blogging platform for writers, thinkers, and creators.
              Share your stories, build your audience, and grow your brand.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Start Writing <FiArrowRight />
              </Link>
              <Link to="/blog" className="btn btn-secondary btn-lg">
                Explore Blog
              </Link>
            </div>
          </div>
          <div className="hero-decoration">
            <div className="hero-glow"></div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="features-section">
        <div className="container">
          <div className="page-header">
            <h2 className="section-title">Why BlogVerse?</h2>
            <p className="section-subtitle">Everything you need to create, publish, and grow.</p>
          </div>
          <div className="grid grid-3">
            <div className="feature-card card">
              <div className="card-body">
                <div className="feature-icon"><FiEdit3 size={28} /></div>
                <h3>Rich Editor</h3>
                <p>Write beautiful articles with our powerful rich text editor, image uploads, and code highlighting.</p>
              </div>
            </div>
            <div className="feature-card card">
              <div className="card-body">
                <div className="feature-icon"><FiUsers size={28} /></div>
                <h3>Community Driven</h3>
                <p>Join a community of readers and creators building the future of blogging together.</p>
              </div>
            </div>
            <div className="feature-card card">
              <div className="card-body">
                <div className="feature-icon"><FiZap size={28} /></div>
                <h3>Lightning Fast</h3>
                <p>Built with modern tech for blazing performance, SEO optimization, and a delightful reading experience.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Latest Posts ─── */}
      <section className="latest-posts-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Latest Articles</h2>
              <p className="section-subtitle">Fresh perspectives from our community of writers.</p>
            </div>
            <Link to="/blog" className="btn btn-ghost">
              View all <FiArrowRight />
            </Link>
          </div>
          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-3">
              {posts.slice(0, 6).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to Start Writing?</h2>
            <p>Join thousands of creators sharing their stories on BlogVerse.</p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
