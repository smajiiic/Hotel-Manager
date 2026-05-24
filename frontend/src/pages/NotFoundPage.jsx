import { Link } from 'react-router-dom'
import '../styles/notfound.css'

function NotFoundPage() {
  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <p className="notfound-code">404</p>
        <h1 className="notfound-title">Page not found</h1>
        <p className="notfound-message">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to="/" className="notfound-home">Back to home</Link>
      </div>
    </div>
  )
}

export default NotFoundPage
