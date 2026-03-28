import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import './SearchBar.css';

export default function SearchBar({ onSearch, placeholder = 'Search articles...' }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <FiSearch className="search-icon" size={18} />
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className="btn btn-primary btn-sm">Search</button>
    </form>
  );
}
