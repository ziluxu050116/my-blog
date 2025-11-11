import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Author from './pages/Author';
import PostDetail from './pages/PostDetail';
import './index.css';

function App() {
  return (
    <Router>
      <div className="nav">
        <div className="container nav-container">
          <Link to="/" className="nav-logo">我的个人博客</Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">首页</Link>
            <Link to="/author" className="nav-link">关于作者</Link>
          </div>
        </div>
      </div>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/author" element={<Author />} />
          <Route path="/post/:id" element={<PostDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;