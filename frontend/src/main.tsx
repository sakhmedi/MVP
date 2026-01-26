import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Feed from './pages/Feed.tsx'
import CreatePost from './pages/CreatePost.tsx'
import PostDetail from './pages/PostDetail.tsx'
import UserProfile from './pages/UserProfile.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/posts/:slug" element={<PostDetail />} />
          <Route path="/user/:username" element={<UserProfile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
