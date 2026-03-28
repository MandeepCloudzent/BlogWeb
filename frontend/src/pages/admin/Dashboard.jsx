import { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { FiUsers, FiFileText, FiMessageSquare, FiTrendingUp } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import './Dashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, msgsRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getMessages(),
        ]);
        setStats(statsRes.data);
        setMessages(msgsRes.data.results || msgsRes.data);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleModerate = async (postId, status) => {
    try {
      await adminApi.moderatePost(postId, status);
    } catch {
      // handled
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="section-subtitle">Platform overview and management.</p>

        {/* ─── Stats Grid ─── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}><FiUsers /></div>
            <div className="stat-info">
              <span className="stat-value">{stats?.total_users || 0}</span>
              <span className="stat-label">Total Users</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}><FiFileText /></div>
            <div className="stat-info">
              <span className="stat-value">{stats?.published_posts || 0}</span>
              <span className="stat-label">Published Posts</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}><FiMessageSquare /></div>
            <div className="stat-info">
              <span className="stat-value">{stats?.total_comments || 0}</span>
              <span className="stat-label">Comments</span>
            </div>
          </div>
        </div>

        {/* ─── Recent Messages ─── */}
        <section className="admin-section">
          <h2>Unread Messages ({stats?.unread_messages || 0})</h2>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {messages.slice(0, 10).map((msg) => (
                  <tr key={msg.id}>
                    <td>{msg.name}</td>
                    <td>{msg.email}</td>
                    <td>{msg.subject}</td>
                    <td>
                      <span className={`badge ${msg.is_read ? 'badge-success' : 'badge-warning'}`}>
                        {msg.is_read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
