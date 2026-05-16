import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="placeholder-page">
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/">Go home</Link>
    </div>
  )
}

export default NotFoundPage
