import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Link } from 'react-router-dom'

function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 从 Supabase 获取文章列表（关联作者姓名）
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          authors (name)  // 关联 authors 表，只取作者姓名
        `)
        .eq('status', 'published')  // 只显示已发布的文章
        .order('created_at', { ascending: false })  // 最新文章在前

      if (error) throw error
      setPosts(data)
    } catch (err) {
      setError('获取文章失败：' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 组件加载时自动获取数据
  useEffect(() => {
    fetchPosts()
  }, [])

  // 加载中/错误状态展示
  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>加载文章中...</div>
  if (error) return <div style={{ textAlign: 'center', color: 'red', padding: '50px' }}>{error}</div>

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
      <h1 style={{ textAlign: 'center', margin: '40px 0' }}>我的个人博客</h1>

      {/* 文章列表卡片 */}
      <div style={{ display: 'grid', gap: '30px' }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>暂无已发布文章</div>
        ) : (
          posts.map(post => (
            <div 
              key={post.id} 
              style={{ 
                border: '1px solid #eee', 
                borderRadius: '8px', 
                padding: '20px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
              }}
            >
              <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: '#2c3e50' }}>
                <h2 style={{ margin: '0 0 15px 0' }}>{post.title}</h2>
              </Link>

              {/* 文章封面图（有则显示） */}
              {post.cover_image_url && (
                <img 
                  src={post.cover_image_url} 
                  alt={post.title}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '15px' }}
                />
              )}

              {/* 文章摘要 */}
              <p style={{ color: '#666', lineHeight: '1.6', margin: '0 0 15px 0' }}>
                {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
              </p>

              {/* 作者+发布时间 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: '14px' }}>
                <span>作者：{post.authors?.name || '未知作者'}</span>
                <span>发布时间：{new Date(post.created_at).toLocaleDateString()}</span>
              </div>

              {/* 查看全文按钮 */}
              <Link to={`/post/${post.id}`}>
                <button style={{ 
                  marginTop: '15px', 
                  padding: '8px 16px', 
                  border: 'none', 
                  borderRadius: '4px', 
                  background: '#3498db', 
                  color: 'white', 
                  cursor: 'pointer' 
                }}>
                  查看全文
                </button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Home