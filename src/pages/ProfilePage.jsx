import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="app">
      <h1>Profile</h1>
      <dl className="profile-details">
        <dt>Name</dt>
        <dd>{user.name}</dd>
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Member since</dt>
        <dd>{new Date(user.created_at).toLocaleDateString()}</dd>
      </dl>
      <button type="button" onClick={handleLogout}>Logout</button>
    </div>
  )
}
