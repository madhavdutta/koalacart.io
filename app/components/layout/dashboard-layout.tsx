import { Link, Form, useLocation } from '@remix-run/react'
import { Button } from '~/components/ui/button'
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Home,
  ShoppingCart,
  Heart,
  DollarSign
} from 'lucide-react'
import { useState } from 'react'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    email: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
    }
  }
  profile: {
    role: 'admin' | 'affiliate' | 'buyer'
    full_name?: string
  }
}

export function DashboardLayout({ children, user, profile }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email?.slice(0, 2).toUpperCase() || 'U'
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ]

    if (profile.role === 'admin') {
      return [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Affiliates', href: '/admin/affiliates', icon: Users },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { name: 'Payments', href: '/admin/payments', icon: CreditCard },
      ]
    }

    if (profile.role === 'affiliate') {
      return [
        { name: 'Dashboard', href: '/affiliate/dashboard', icon: LayoutDashboard },
        { name: 'My Links', href: '/affiliate/links', icon: Package },
        { name: 'Earnings', href: '/affiliate/earnings', icon: DollarSign },
        { name: 'Analytics', href: '/affiliate/analytics', icon: BarChart3 },
      ]
    }

    // Buyer role
    return [
      ...baseItems,
      { name: 'My Orders', href: '/orders', icon: ShoppingCart },
      { name: 'Wishlist', href: '/wishlist', icon: Heart },
    ]
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-green-600 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-bold">🐨</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">KoalaCart</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${active
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`w-5 h-5 mr-3 ${active ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-3 border-t border-gray-200">
            <Link
              to="/settings"
              className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors mb-2 ${
                isActive('/settings') 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className={`w-5 h-5 mr-3 ${isActive('/settings') ? 'text-green-600' : 'text-gray-400'}`} />
              Settings
            </Link>
            
            <Form method="post" action="/logout">
              <button
                type="submit"
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3 text-gray-400" />
                Sign out
              </button>
            </Form>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-1.5 w-80 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-green-500 focus:border-green-500 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-gray-50"
              >
                <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {getInitials(profile.full_name || user.user_metadata?.full_name, user.email)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {profile.full_name || user.user_metadata?.full_name || user.email}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profile.full_name || user.user_metadata?.full_name || user.email}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {profile.role}
                    </p>
                  </div>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-3 text-gray-400" />
                    Settings
                  </Link>
                  <Form method="post" action="/logout">
                    <button
                      type="submit"
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4 mr-3 text-gray-400" />
                      Sign out
                    </button>
                  </Form>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
