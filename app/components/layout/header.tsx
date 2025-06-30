import { Link, Form } from '@remix-run/react'
import { Button } from '~/components/ui/button'
import { ShoppingCart, User, LogOut } from 'lucide-react'

interface HeaderProps {
  user?: {
    email: string
    role: 'admin' | 'affiliate' | 'buyer'
  } | null
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-emerald-600">
          <span className="text-3xl">🐨</span>
          <span>KoalaCart</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/products" className="text-gray-600 hover:text-gray-900">
            Products
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link to="/admin/products" className="text-gray-600 hover:text-gray-900">
                My Products
              </Link>
              <Link to="/admin/affiliates" className="text-gray-600 hover:text-gray-900">
                Affiliates
              </Link>
              <Link to="/admin/payments" className="text-gray-600 hover:text-gray-900">
                Payment Settings
              </Link>
            </>
          )}
          {user?.role === 'affiliate' && (
            <>
              <Link to="/affiliate/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link to="/affiliate/links" className="text-gray-600 hover:text-gray-900">
                My Links
              </Link>
            </>
          )}
        </nav>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Form method="post" action="/logout">
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                </Button>
              </Form>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
