import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Feed from './pages/Feed.tsx'
import CreatePost from './pages/CreatePost.tsx'
import PostDetail from './pages/PostDetail.tsx'
import UserProfile from './pages/UserProfile.tsx'
import Library from './pages/Library.tsx'
import Stories from './pages/Stories.tsx'
import Stats from './pages/Stats.tsx'
import Following from './pages/Following.tsx'
import MainLayout from './layouts/MainLayout.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page without sidebar */}
          <Route path="/" element={<App />} />

          {/* Pages with MainLayout (header + sidebar) */}
          <Route path="/feed" element={<MainLayout><Feed /></MainLayout>} />
          <Route path="/create-post" element={<MainLayout><CreatePost /></MainLayout>} />
          <Route path="/posts/:slug" element={<MainLayout><PostDetail /></MainLayout>} />
          <Route path="/user/:username" element={<MainLayout><UserProfile /></MainLayout>} />
          <Route path="/library" element={<MainLayout><Library /></MainLayout>} />
          <Route path="/stories" element={<MainLayout><Stories /></MainLayout>} />
          <Route path="/stats" element={<MainLayout><Stats /></MainLayout>} />
          <Route path="/following" element={<MainLayout><Following /></MainLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
