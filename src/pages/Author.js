import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

function Author() {
  const [author, setAuthor] = useState(null);
  const [authorPosts, setAuthorPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAuthor = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .single();

      if (error) throw error;
      setAuthor(data);
    } catch (err) {
      setError('获取作者信息失败：' + err.message);
      console.error(err);
    }
  }, []);

  const fetchAuthorPosts = useCallback(async (authorId) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', authorId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAuthorPosts(data);
    } catch (err) {
      console.error('获取作者文章失败：', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const loadData = async () => {
      await fetchAuthor();
      if (author) fetchAuthorPosts(author.id);
      else setLoading(false);
    };
    loadData();
  }, [fetchAuthor, fetchAuthorPosts]);

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '50px 0' }}>加载作者信息中...</div>;
  if (error) return <div className="container" style={{ textAlign: 'center', color: 'red', padding: '50px 0' }}>{error}</div>;
  if (!author) return <div className="container" style={{ textAlign: 'center', padding: '50px 0' }}>暂无作者信息</div>;

  return (
    <div className="container">
      <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
        <img
          src={author.avatar_url || 'https://via.placeholder.com/150'}
          alt={author.name}
          style={{ width: '150px', height: '150px', borderRadius: '50%', marginBottom: '20px', border: '5px solid #f0f4f8' }}
        />
        <h2>{author.name}</h2>
        <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto 20px' }}>
          {author.bio || '暂无详细简介'}
        </p>
        {author.email && (
          <p style={{ color: '#3498db', margin: '10px 0' }}>联系邮箱：{author.email}</p>
        )}
      </div>

      <h2>作者发布的文章（{authorPosts.length} 篇）</h2>
      <div className="grid">
        {authorPosts.map((post) => (
          <div key={post.id} className="card">
            <Link to={`/post/${post.id}`} style={{ textDecoration: 'none' }}>
              {post.cover_image_url && (
                <div style={{ height: '180px', overflow: 'hidden' }}>
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                </div>
              )}
              <div style={{ padding: '20px' }}>
                <h3>{post.title}</h3>
                <p style={{ fontSize: '14px', color: '#999', marginBottom: '10px' }}>
                  发布时间：{new Date(post.created_at).toLocaleDateString()}
                </p>
                <Link to={`/post/${post.id}`} className="btn btn-primary" style={{ marginTop: '10px', display: 'inline-block' }}>
                  查看全文
                </Link>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Author;