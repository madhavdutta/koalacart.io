import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { requireAuth } from "~/lib/auth.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { formatCurrency } from "~/lib/utils";
import { 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  DollarSign,
  Package,
  UserCheck,
  Eye,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Admin Dashboard - KoalaCart" },
    { name: "description", content: "Manage your products and sales" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  const { supabase } = createSupabaseServerClient(request);
  
  // Get dashboard stats
  const [
    { data: products },
    { data: orders },
    { data: affiliates },
    { data: recentOrders }
  ] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('admin_id', user.id),
    supabase
      .from('orders')
      .select('*')
      .eq('status', 'paid')
      .in('product_id', 
        await supabase
          .from('products')
          .select('id')
          .eq('admin_id', user.id)
          .then(res => res.data?.map(p => p.id) || [])
      ),
    supabase
      .from('affiliates')
      .select('*')
      .eq('admin_id', user.id),
    supabase
      .from('orders')
      .select('*, products(name)')
      .in('product_id', 
        await supabase
          .from('products')
          .select('id')
          .eq('admin_id', user.id)
          .then(res => res.data?.map(p => p.id) || [])
      )
      .order('created_at', { ascending: false })
      .limit(5)
  ]);
  
  const totalRevenue = orders?.reduce((sum, order) => sum + order.amount, 0) || 0;
  const totalProducts = products?.length || 0;
  const totalAffiliates = affiliates?.length || 0;
  const totalOrders = orders?.length || 0;
  
  return json({
    user,
    profile,
    stats: {
      totalRevenue,
      totalProducts,
      totalAffiliates,
      totalOrders
    },
    recentOrders: recentOrders || []
  });
}

export default function AdminDashboard() {
  const { user, profile, stats, recentOrders } = useLoaderData<typeof loader>();
  
  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🐨</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-green-700 mt-1">
                  Manage your products, affiliates, and track your sales performance.
                </p>
              </div>
            </div>
            <Link to="/admin/products/new">
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
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
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">+12% from last month</span>
                  </div>
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
                  <p className="text-sm font-medium text-gray-600">Products</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">+2 new this month</span>
                  </div>
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
                  <p className="text-sm font-medium text-gray-600">Affiliates</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAffiliates}</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">+3 new this month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">+8% from last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/admin/products/new">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Plus className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Create Product</h3>
                    <p className="text-sm text-gray-600">Add a new product to sell</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/products">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Manage Products</h3>
                    <p className="text-sm text-gray-600">View and edit your products</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/affiliates">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Affiliates</h3>
                    <p className="text-sm text-gray-600">Manage your affiliate network</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/analytics">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Analytics</h3>
                    <p className="text-sm text-gray-600">View detailed reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
        
        {/* Recent Orders */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
                <CardDescription className="text-gray-600">
                  Your latest sales activity
                </CardDescription>
              </div>
              <Link to="/admin/orders">
                <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                  View All Orders
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-6">Create your first product to start selling!</p>
                <Link to="/admin/products/new">
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Product
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <ShoppingCart className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{order.customer_email}</p>
                        <p className="text-sm text-gray-600">{order.products?.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-lg">
                        {formatCurrency(order.amount)}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
