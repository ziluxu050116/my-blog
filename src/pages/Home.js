import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data);
      } catch (err) {
        setError('获取文章列表失败：' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '50px 0' }}>加载文章列表中...</div>;
  if (error) return <div className="container" style={{ textAlign: 'center', color: 'red', padding: '50px 0' }}>{error}</div>;

  return (
    <div className="container">
      <header style={{ textAlign: 'center', margin: '50px 0' }}>
        <h1>我的个人博客</h1>
        <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
          分享技术、生活与思考的角落
        </p>
      </header>

      <div className="grid">
        {posts.map((post) => (
          <div key={post.id} className="card">
            <Link to={`/post/${post.id}`} style={{ textDecoration: 'none' }}>
              {post.cover_image_url && (
                <div style={{ height: '200px', overflow: 'hidden' }}>
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
                  作者：{post.author_name || '匿名'} · 发布时间：{new Date(post.created_at).toLocaleDateString()}
                </p>
                <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {post.excerpt || post.content.substring(0, 100) + '...'}
                </p>
                <Link to={`/post/${post.id}`} className="btn btn-primary" style={{ marginTop: '15px', display: 'inline-block' }}>
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

export default Home;