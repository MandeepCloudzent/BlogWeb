import { useState, useEffect, useCallback } from 'react';
import { blogApi } from '../api/blogApi';

export function usePosts(params = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await blogApi.getPosts(params);
      setPosts(data.results || data);
      setPagination({
        count: data.count || 0,
        next: data.next,
        previous: data.previous,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, pagination, fetchPosts };
}
