import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { requireAuth } from "~/lib/auth.server";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { ImpersonationControls } from "~/components/ui/impersonation-controls";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { formatCurrency } from "~/lib/utils";
import { 
  Package, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Plus,
  Eye,
  BarChart3,
  ShoppingCart,
  UserCheck
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Admin Dashboard - KoalaCart" },
    { name: "description", content: "Manage your products, sales, and affiliates" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.originalRole !== 'admin' && profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  const { supabase } = createSupabaseServerClient(request);
  
  // Get products count
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('admin_id', profile.id);
  
  // Get orders and calculate revenue
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      products!inner (
        admin_id
      )
    `)
    .eq('products.admin_id', profile.id);
  
  const totalRevenue = orders?.filter(order => order.status === 'paid')
    .reduce((sum, order) => sum + order.amount, 0) || 0;
  
  const totalOrders = orders?.length || 0;
  
  // Get affiliates count
  const { count: affiliatesCount } = await supabase
    .from('affiliates')
    .select('*', { count: 'exact', head: true })
    .eq('admin_id', profile.id);
  
  // Get recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      *,
      products!inner (
        name,
        admin_id
      )
    `)
    .eq('products.admin_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5);
  
  // Get recent products
  const { data: recentProducts } = await supabase
    .from('products')
    .select('*')
    .eq('admin_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5);
  
  return json({ 
    user, 
    profile, 
    stats: {
      productsCount: productsCount || 0,
      totalRevenue,
      totalOrders,
      affiliatesCount: affiliatesCount || 0
    },
    recentOrders: recentOrders || [],
    recentProducts: recentProducts || []
  });
}

export default function AdminDashboard() {
  const { user, profile, stats, recentOrders, recentProducts } = useLoaderData<typeof loader>();
  
  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-8">
        {/* Impersonation Controls - Only show for real admins */}
        {(profile.originalRole === 'admin' || profile.role === 'admin') && (
          <ImpersonationControls 
            currentRole={profile.role}
            isImpersonating={profile.isImpersonating}
            originalRole={profile.originalRole}
          />
        )}
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.isImpersonating ? (
                    <>Admin Dashboard <Badge className="ml-2 bg-orange-100 text-orange-800">Testing as {profile.role}</Badge></>
                  ) : (
                    'Admin Dashboard'
                  )}
                </h1>
                <p className="text-green-700 mt-1">
                  Welcome back! Here's what's happening with your business.
                </p>
              </div>
            </div>
            <Link to="/admin/products/new">
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="w-4 h-4 mr-2" />
                New Product
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Products</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.productsCount}</p>
                  <Link to="/admin/products" className="text-sm text-green-600 hover:text-green-700 font-medium mt-1 inline-block">
                    View all products →
                  </Link>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats.totalRevenue)}</p>
                  <Link to="/admin/payments" className="text-sm text-green-600 hover:text-green-700 font-medium mt-1 inline-block">
                    View payments →
                  </Link>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                  <Link to="/admin/orders" className="text-sm text-green-600 hover:text-green-700 font-medium mt-1 inline-block">
                    View orders →
                  </Link>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Affiliates</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.affiliatesCount}</p>
                  <Link to="/admin/affiliates" className="text-sm text-green-600 hover:text-green-700 font-medium mt-1 inline-block">
                    Manage affiliates →
                  </Link>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
                  <CardDescription className="text-gray-600">Latest customer purchases</CardDescription>
                </div>
                <Link to="/admin/payments">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                  <p className="text-sm text-gray-400">Orders will appear here when customers make purchases</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{order.products?.name}</p>
                        <p className="text-sm text-gray-600">{order.customer_email}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(order.amount)}</p>
                        <Badge 
                          variant={order.status === 'paid' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Products */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Recent Products</CardTitle>
                  <CardDescription className="text-gray-600">Your latest product listings</CardDescription>
                </div>
                <Link to="/admin/products">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No products yet</p>
                  <Link to="/admin/products/new">
                    <Button className="mt-4 bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Product
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600 capitalize">{product.product_type}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(product.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(product.base_price)}</p>
                        <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-xs">
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
