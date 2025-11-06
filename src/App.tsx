import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PinDetailPage from './pages/PinDetailPage'
import ProfilePage from './pages/ProfilePage'
import MyProfilePage from './pages/MyProfilePage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/my-profile" element={<MyProfilePage />} />
      <Route path="/pin/:pinId" element={<PinDetailPage />} />
      <Route path="/profile/:userId" element={<ProfilePage />} />
    </Routes>
  )
}

export default App

