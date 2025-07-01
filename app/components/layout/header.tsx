import { Link, Form } from '@remix-run/react'
import { Button } from '~/components/ui/button'
import { ShoppingCart, User, LogOut, Menu, X, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  user?: {
    email: string
    role: 'admin' | 'affiliate' | 'buyer'
  } | null
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 text-2xl font-bold text-green-600 hover:text-green-700 transition-colors">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🐨</span>
            </div>
            <span className="text-gray-900">KoalaCart</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <div className="relative">
              <button 
                className="flex items-center text-gray-700 hover:text-green-600 font-medium transition-colors"
                onMouseEnter={() => setProductsDropdownOpen(true)}
                onMouseLeave={() => setProductsDropdownOpen(false)}
              >
                Products
                <ChevronDown className="ml-1 w-4 h-4" />
              </button>
              
              {productsDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-4 z-50"
                  onMouseEnter={() => setProductsDropdownOpen(true)}
                  onMouseLeave={() => setProductsDropdownOpen(false)}
                >
                  <Link to="/products" className="block px-6 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors">
                    All Products
                  </Link>
                  <Link to="/digital-products" className="block px-6 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors">
                    Digital Products
                  </Link>
                  <Link to="/courses" className="block px-6 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors">
                    Online Courses
                  </Link>
                </div>
              )}
            </div>
            
            <Link to="/pricing" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
              Pricing
            </Link>
            <Link to="/affiliates" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
              Affiliates
            </Link>
            <Link to="/resources" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
              Resources
            </Link>
            
            {user?.role === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                  Dashboard
                </Link>
                <Link to="/admin/products" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                  My Products
                </Link>
              </>
            )}
            {user?.role === 'affiliate' && (
              <>
                <Link to="/affiliate/dashboard" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                  Dashboard
                </Link>
                <Link to="/affiliate/links" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                  My Links
                </Link>
              </>
            )}
          </nav>
          
          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-4 py-2 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{user.email}</span>
                </div>
                <Form method="post" action="/logout">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </Form>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-green-600 font-medium">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                    Start free trial
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              <Link 
                to="/products" 
                className="block text-gray-700 hover:text-green-600 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                to="/pricing" 
                className="block text-gray-700 hover:text-green-600 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/affiliates" 
                className="block text-gray-700 hover:text-green-600 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Affiliates
              </Link>
              
              {user?.role === 'admin' && (
                <>
                  <Link 
                    to="/admin/dashboard" 
                    className="block text-gray-700 hover:text-green-600 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/admin/products" 
                    className="block text-gray-700 hover:text-green-600 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Products
                  </Link>
                </>
              )}
              
              {user?.role === 'affiliate' && (
                <>
                  <Link 
                    to="/affiliate/dashboard" 
                    className="block text-gray-700 hover:text-green-600 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/affiliate/links" 
                    className="block text-gray-700 hover:text-green-600 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Links
                  </Link>
                </>
              )}
              
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 px-4 py-2 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.email}</span>
                    </div>
                    <Form method="post" action="/logout">
                      <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </Button>
                    </Form>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-green-600">
                        Sign in
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold">
                        Start free trial
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
