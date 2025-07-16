import { Routes, Route, Link } from 'react-router-dom'
import './index.css'
import ChannelsPage from './pages/ChannelsPage'
import DashboardPage from './pages/DashboardPage'
import MessagesPage from './pages/MessagesPage'

// Layout Components
const Sidebar = () => (
  <div className="w-64 bg-white shadow h-full fixed left-0 top-0 pt-16">
    <div className="px-4 py-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Collections</h2>
      <nav className="space-y-2">
        <Link to="/" className="flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100">
          Dashboard
        </Link>
        <Link to="/channels" className="flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100">
          Channels
        </Link>
        <Link to="/messages" className="flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100">
          Messages
        </Link>
        <Link to="/showcase" className="flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100">
          Showcase
        </Link>
        <Link to="/hackathons" className="flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100">
          Hackathons
        </Link>
        <Link to="/submissions" className="flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100">
          Submissions
        </Link>
        <Link to="/user-status" className="flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100">
          User Status
        </Link>
        <Link to="/user-roles" className="flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100">
          User Roles
        </Link>
      </nav>
    </div>
  </div>
)

const Header = () => (
  <header className="bg-white shadow fixed top-0 left-0 right-0 z-10">
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-900">Arena Admin Dashboard</h1>
    </div>
  </header>
)

const NotFound = () => (
  <div className="text-center">
    <h2 className="text-2xl font-bold mb-4">404 - Page Not Found</h2>
    <p className="mb-4">The page you are looking for does not exist.</p>
    <Link to="/" className="text-blue-600 hover:underline">Go back to Dashboard</Link>
  </div>
)

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <main className="ml-64 pt-16">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/channels" element={<ChannelsPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/showcase" element={<div>Showcase Management</div>} />
              <Route path="/hackathons" element={<div>Hackathons Management</div>} />
              <Route path="/submissions" element={<div>Submissions Management</div>} />
              <Route path="/user-status" element={<div>User Status Management</div>} />
              <Route path="/user-roles" element={<div>User Roles Management</div>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
