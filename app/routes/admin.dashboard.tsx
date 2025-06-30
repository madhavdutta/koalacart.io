import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { requireAuth } from "~/lib/auth.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { formatCurrency } from "~/lib/utils";
import { 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  DollarSign,
  Package,
  UserCheck,
  Eye,
  Plus
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
  const { stats, recentOrders } = useLoaderData<typeof loader>();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your products, affiliates, and track your sales</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(stats.totalRevenue)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Affiliates</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAffiliates}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to="/admin/products/new">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Plus className="h-8 w-8 text-emerald-600 mb-2" />
                <CardTitle>Create Product</CardTitle>
                <CardDescription>Add a new product to sell</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link to="/admin/products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Package className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Manage Products</CardTitle>
                <CardDescription>View and edit your products</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link to="/admin/affiliates">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Affiliates</CardTitle>
                <CardDescription>Manage your affiliate network</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link to="/admin/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle>Analytics</CardTitle>
                <CardDescription>View detailed reports</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
        
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest sales activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No orders yet. Create your first product to start selling!</p>
                <Link to="/admin/products/new" className="mt-4 inline-block">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Create Product
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{order.customer_email}</p>
                      <p className="text-sm text-gray-600">{order.products?.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">
                        {formatCurrency(order.amount)}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <Link to="/admin/orders">
                    <Button variant="outline">View All Orders</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
