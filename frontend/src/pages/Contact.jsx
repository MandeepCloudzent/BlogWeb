import { useState } from 'react';
import { contactApi } from '../api/contactApi';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactApi.submit(form);
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">Contact Us</h1>
          <p className="section-subtitle">Have a question or feedback? We'd love to hear from you.</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info animate-fade-in">
            <div className="contact-info-card">
              <FiMail size={24} />
              <div>
                <h4>Email</h4>
                <p>hello@blogverse.com</p>
              </div>
            </div>
            <div className="contact-info-card">
              <FiMapPin size={24} />
              <div>
                <h4>Address</h4>
                <p>123 Blog Street, Writer's Block, CA 94043</p>
              </div>
            </div>
            <div className="contact-info-card">
              <FiPhone size={24} />
              <div>
                <h4>Phone</h4>
                <p>+91 72068-59892</p>
              </div>
            </div>
          </div>

          <form className="contact-form card animate-fade-in" onSubmit={handleSubmit}>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input name="name" className="form-input" placeholder="Your name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input name="email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input name="subject" className="form-input" placeholder="What's this about?" value={form.subject} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea name="message" className="form-input form-textarea" placeholder="Tell us more..." value={form.message} onChange={handleChange} required />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
