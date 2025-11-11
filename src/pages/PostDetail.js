import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { useParams, useNavigate, Link } from 'react-router-dom'; // 新增 Link 导入

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({ user_name: '', content: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          authors (name, bio, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (err) {
      setError('获取文章失败：' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data);
    } catch (err) {
      console.error('获取评论失败：', err);
    }
  }, [id]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentForm.user_name.trim() || !commentForm.content.trim()) {
      alert('请填写姓名和评论内容！');
      return;
    }

    try {
      setCommentLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          post_id: parseInt(id),
          user_name: commentForm.user_name,
          content: commentForm.content,
          email: commentForm.email
        }])
        .select();

      if (error) throw error;
      setComments([...comments, ...data]);
      setCommentForm({ user_name: '', content: '', email: '' });
      alert('评论提交成功！');
    } catch (err) {
      alert('评论提交失败：' + err.message);
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    fetchPost();
    fetchComments();
  }, [id, navigate, fetchPost, fetchComments]);

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '50px 0' }}>加载文章中...</div>;
  if (error || !post) return (
    <div className="container" style={{ textAlign: 'center', color: 'red', padding: '50px 0' }}>
      {error || '文章不存在！'}
      <button
        className="btn btn-primary"
        style={{ marginTop: '20px' }}
        onClick={() => navigate('/')}
      >
        返回首页
      </button>
    </div>
  );

  return (
    <div className="container">
      <Link to="/" className="btn" style={{ margin: '20px 0', backgroundColor: '#f0f4f8', color: '#333' }}>
        ← 返回首页
      </Link>

      <div className="card" style={{ padding: '30px' }}>
        <h1>{post.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', color: '#999' }}>
          <img
            src={post.authors?.avatar_url || 'https://via.placeholder.com/40'}
            alt={post.authors?.name}
            style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
          />
          <span>{post.authors?.name || '未知作者'}</span>
          <span style={{ margin: '0 10px', color: '#ddd' }}>·</span>
          <span>{new Date(post.created_at).toLocaleString()}</span>
        </div>

        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.title}
            style={{ width: '100%', borderRadius: '8px', marginBottom: '30px' }}
          />
        )}

        <div style={{ lineHeight: '1.8', fontSize: '16px', whiteSpace: 'pre-line' }}>
          {post.content}
        </div>
      </div>

      <div style={{ marginTop: '60px' }}>
        <h2>评论区（{comments.length} 条）</h2>
        <form onSubmit={submitComment} className="card" style={{ padding: '20px' }}>
          <h3>发表评论</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>姓名 *</label>
            <input
              type="text"
              value={commentForm.user_name}
              onChange={(e) => setCommentForm({ ...commentForm, user_name: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              disabled={commentLoading}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>邮箱（可选）</label>
            <input
              type="email"
              value={commentForm.email}
              onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              disabled={commentLoading}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>评论内容 *</label>
            <textarea
              value={commentForm.content}
              onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px' }}
              disabled={commentLoading}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={commentLoading}
          >
            {commentLoading ? '提交中...' : '提交评论'}
          </button>
        </form>

        <div style={{ marginTop: '30px' }}>
          {comments.length === 0 ? (
            <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
              暂无评论，快来抢沙发～
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="card" style={{ padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4 style={{ margin: '0' }}>{comment.user_name}</h4>
                  <span style={{ color: '#999', fontSize: '12px' }}>{new Date(comment.created_at).toLocaleString()}</span>
                </div>
                <p style={{ margin: '0' }}>{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default PostDetail;