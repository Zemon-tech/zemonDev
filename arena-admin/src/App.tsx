import { Routes, Route } from 'react-router-dom'
import './index.css'

// Layout Components
const Sidebar = () => (
  <div className="w-64 bg-white shadow h-full fixed left-0 top-0 pt-16">
    <div className="px-4 py-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Collections</h2>
      <nav className="space-y-2">
        <a href="/" className="flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100">
          Dashboard
        </a>
        <a href="/channels" className="flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100">
          Channels
        </a>
        <a href="/messages" className="flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100">
          Messages
        </a>
        <a href="/showcase" className="flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100">
          Showcase
        </a>
        <a href="/hackathons" className="flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100">
          Hackathons
        </a>
        <a href="/submissions" className="flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100">
          Submissions
        </a>
        <a href="/user-status" className="flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100">
          User Status
        </a>
        <a href="/user-roles" className="flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-gray-100">
          User Roles
        </a>
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

// Page Components (Placeholders)
const Dashboard = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium text-gray-700">Channels</h3>
        <p className="text-3xl font-bold mt-2">0</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium text-gray-700">Messages</h3>
        <p className="text-3xl font-bold mt-2">0</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium text-gray-700">Hackathons</h3>
        <p className="text-3xl font-bold mt-2">0</p>
      </div>
    </div>
  </div>
)

const NotFound = () => (
  <div className="text-center">
    <h2 className="text-2xl font-bold mb-4">404 - Page Not Found</h2>
    <p className="mb-4">The page you are looking for does not exist.</p>
    <a href="/" className="text-blue-600 hover:underline">Go back to Dashboard</a>
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
              <Route path="/" element={<Dashboard />} />
              <Route path="/channels" element={<div>Channels Management</div>} />
              <Route path="/messages" element={<div>Messages Management</div>} />
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
