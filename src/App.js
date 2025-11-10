import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import Author from './pages/Author'

function App() {
  return (
    <Router>
      {/* 全局导航栏（所有页面共用） */}
      <nav style={{ padding: '20px', background: '#f5f5f5', marginBottom: '30px' }}>
        <Link to="/" style={{ marginRight: '30px', textDecoration: 'none', color: '#333', fontSize: '16px' }}>首页</Link>
        <Link to="/author" style={{ marginRight: '30px', textDecoration: 'none', color: '#333', fontSize: '16px' }}>关于作者</Link>
      </nav>

      {/* 页面路由匹配 */}
      <Routes>
        <Route path="/" element={<Home />} />  {/* 首页 */}
        <Route path="/post/:id" element={<PostDetail />} />  {/* 文章详情页（带 ID 参数） */}
        <Route path="/author" element={<Author />} />  {/* 作者页 */}
      </Routes>
    </Router>
  )
}

export default App