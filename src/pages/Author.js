import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabase'
import { Link } from 'react-router-dom'

function Author() {
  const [author, setAuthor] = useState(null)
  const [authorPosts, setAuthorPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 用 useCallback 稳定异步函数
  const fetchAuthor = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .single()

      if (error) throw error
      setAuthor(data)
    } catch (err) {
      setError('获取作者信息失败：' + err.message)
      console.error(err)
    }
  }, [])

  const fetchAuthorPosts = useCallback(async (authorId) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', authorId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAuthorPosts(data)
    } catch (err) {
      console.error('获取作者文章失败：', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // 关键：添加 ESLint 忽略注释，解决误判的依赖警告
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const loadData = async () => {
      await fetchAuthor() // 先加载作者，此时 author 为 null
      if (author) fetchAuthorPosts(author.id) // 加载完成后，若有 author 再加载文章
      else setLoading(false)
    }
    loadData()
  }, [fetchAuthor, fetchAuthorPosts]) // 仅依赖稳定后的函数，不依赖 author

  // 加载中/错误状态
  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>加载作者信息中...</div>
  if (error) return <div style={{ textAlign: 'center', color: 'red', padding: '50px' }}>{error}</div>
  if (!author) return <div style={{ textAlign: 'center', padding: '50px' }}>暂无作者信息</div>

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
      {/* 作者信息卡片 */}
      <div style={{ textAlign: 'center', margin: '50px 0' }}>
        <img 
          src={author.avatar_url || 'https://via.placeholder.com/150'}
          alt={author.name}
          style={{ width: '150px', height: '150px', borderRadius: '50%', marginBottom: '20px' }}
        />
        <h1 style={{ color: '#2c3e50', margin: '0 0 15px 0' }}>{author.name}</h1>
        <p style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
          {author.bio || '暂无详细简介'}
        </p>
        {author.email && (
          <p style={{ color: '#3498db', margin: '15px 0 0 0' }}>联系邮箱：{author.email}</p>
        )}
      </div>

      {/* 作者文章列表 */}
      <div>
        <h2 style={{ color: '#2c3e50', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          作者发布的文章（{authorPosts.length} 篇）
        </h2>

        {authorPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>暂无已发布文章</div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {authorPosts.map(post => (
              <div key={post.id} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: '#2c3e50' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>{post.title}</h3>
                </Link>
                <p style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0' }}>
                  发布时间：{new Date(post.created_at).toLocaleDateString()}
                </p>
                <Link to={`/post/${post.id}`} style={{ color: '#3498db', textDecoration: 'none' }}>
                  查看全文 →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Author