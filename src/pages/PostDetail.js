import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabase'
import { useParams, useNavigate } from 'react-router-dom'

function PostDetail() {
  const { id } = useParams()  // 获取 URL 中的文章 ID（如 /post/1）
  const navigate = useNavigate()  // 跳转工具
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentForm, setCommentForm] = useState({ user_name: '', content: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [commentLoading, setCommentLoading] = useState(false)

  // 用 useCallback 稳定 fetchPost 函数（避免每次渲染重新创建）
  const fetchPost = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          authors (name, bio, avatar_url)  // 关联作者完整信息
        `)
        .eq('id', id)
        .single()  // 只返回一条数据

      if (error) throw error
      setPost(data)
    } catch (err) {
      setError('获取文章失败：' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id])  // 依赖：路由参数 id（id 变化时重新执行）

  // 用 useCallback 稳定 fetchComments 函数
  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: true })  // 旧评论在前

      if (error) throw error
      setComments(data)
    } catch (err) {
      console.error('获取评论失败：', err)
    }
  }, [id])  // 依赖：路由参数 id

  // 提交评论
  const submitComment = async (e) => {
    e.preventDefault()
    if (!commentForm.user_name.trim() || !commentForm.content.trim()) {
      alert('请填写姓名和评论内容！')
      return
    }

    try {
      setCommentLoading(true)
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          post_id: parseInt(id),  // 关联当前文章 ID
          user_name: commentForm.user_name,
          content: commentForm.content,
          email: commentForm.email
        }])
        .select()

      if (error) throw error
      setComments([...comments, ...data])  // 刷新评论列表
      setCommentForm({ user_name: '', content: '', email: '' })  // 清空表单
      alert('评论提交成功！')
    } catch (err) {
      alert('评论提交失败：' + err.message)
      console.error(err)
    } finally {
      setCommentLoading(false)
    }
  }

  // 加载文章和评论 - 补充稳定后的函数到依赖数组
  useEffect(() => {
    if (!id) {
      navigate('/')  // 无 ID 跳回首页
      return
    }
    fetchPost()
    fetchComments()
  }, [id, navigate, fetchPost, fetchComments])  // 关键修复：添加缺失的 fetchPost 和 fetchComments

  // 加载中/错误状态
  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>加载文章中...</div>
  if (error || !post) return (
    <div style={{ textAlign: 'center', color: 'red', padding: '50px' }}>
      {error || '文章不存在！'}
      <button 
        style={{ marginTop: '20px', padding: '8px 16px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        返回首页
      </button>
    </div>
  )

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
      {/* 文章详情 */}
      <div>
        <h1 style={{ textAlign: 'center', color: '#2c3e50', margin: '20px 0' }}>{post.title}</h1>

        {/* 作者信息 */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
          <img 
            src={post.authors?.avatar_url || 'https://via.placeholder.com/60'}
            alt={post.authors?.name}
            style={{ width: '60px', height: '60px', borderRadius: '50%', marginRight: '15px' }}
          />
          <div>
            <h3 style={{ margin: '0 0 5px 0' }}>{post.authors?.name || '未知作者'}</h3>
            <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>{post.authors?.bio || '暂无简介'}</p>
          </div>
          <div style={{ marginLeft: 'auto', color: '#999', fontSize: '14px' }}>
            <p>发布时间：{new Date(post.created_at).toLocaleString()}</p>
          </div>
        </div>

        {/* 文章封面图 */}
        {post.cover_image_url && (
          <img 
            src={post.cover_image_url} 
            alt={post.title}
            style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '30px' }}
          />
        )}

        {/* 文章正文（保留换行） */}
        <div style={{ lineHeight: '1.8', color: '#333', fontSize: '16px' }}>
          {post.content.split('\n').map((para, idx) => (
            <p key={idx} style={{ margin: '15px 0' }}>{para}</p>
          ))}
        </div>
      </div>

      {/* 评论区 */}
      <div style={{ marginTop: '60px', paddingTop: '30px', borderTop: '1px solid #eee' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '30px' }}>评论区（{comments.length} 条）</h2>

        {/* 评论表单 */}
        <form onSubmit={submitComment} style={{ marginBottom: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 20px 0' }}>发表评论</h3>
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
            style={{ padding: '10px 20px', border: 'none', borderRadius: '4px', background: '#2ecc71', color: 'white', cursor: 'pointer' }}
            disabled={commentLoading}
          >
            {commentLoading ? '提交中...' : '提交评论'}
          </button>
        </form>

        {/* 评论列表 */}
        <div style={{ display: 'grid', gap: '20px' }}>
          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>暂无评论，快来抢沙发～</div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4 style={{ margin: '0', color: '#333' }}>{comment.user_name}</h4>
                  <span style={{ color: '#999', fontSize: '12px' }}>{new Date(comment.created_at).toLocaleString()}</span>
                </div>
                <p style={{ margin: '0', color: '#666', lineHeight: '1.6' }}>{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default PostDetail