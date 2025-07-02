import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { requireAuth } from "~/lib/auth.server";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { formatCurrency } from "~/lib/utils";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Download,
  Filter
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Payments - KoalaCart Admin" },
    { name: "description", content: "Manage payments and transactions" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  const { supabase } = createSupabaseServerClient(request);
  
  // Get all orders for admin's products
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      products (
        name,
        admin_id
      ),
      affiliates (
        id,
        profiles!affiliates_profile_id_fkey(full_name)
      )
    `)
    .eq('products.admin_id', profile.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching payments:', error);
  }
  
  // Calculate payment stats
  const allOrders = orders || [];
  const paidOrders = allOrders.filter(order => order.status === 'paid');
  const pendingOrders = allOrders.filter(order => order.status === 'pending');
  const failedOrders = allOrders.filter(order => order.status === 'failed');
  
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.amount, 0);
  const pendingAmount = pendingOrders.reduce((sum, order) => sum + order.amount, 0);
  const thisMonthRevenue = paidOrders
    .filter(order => {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, order) => sum + order.amount, 0);
  
  return json({ 
    user, 
    profile, 
    orders: allOrders,
    stats: {
      totalRevenue,
      pendingAmount,
      thisMonthRevenue,
      totalTransactions: allOrders.length,
      paidCount: paidOrders.length,
      pendingCount: pendingOrders.length,
      failedCount: failedOrders.length
    }
  });
}

export default function AdminPayments() {
  const { user, profile, orders, stats } = useLoaderData<typeof loader>();
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'refunded': return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Payment Management
                </h1>
                <p className="text-blue-700 mt-1">
                  Track and manage all payment transactions for your products.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
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
                  <p className="text-sm text-green-600 font-medium mt-1">
                    {stats.paidCount} paid transactions
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(stats.thisMonthRevenue)}
                  </p>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    Current month revenue
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(stats.pendingAmount)}
                  </p>
                  <p className="text-sm text-yellow-600 font-medium mt-1">
                    {stats.pendingCount} pending payments
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.failedCount}
                  </p>
                  <p className="text-sm text-red-600 font-medium mt-1">
                    Failed transactions
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Payments Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
                <CardDescription className="text-gray-600">
                  All payment transactions for your products
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
                <p className="text-gray-600 mb-6">Transactions will appear here when customers make purchases.</p>
                <Link to="/admin/products/new">
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    Create Your First Product
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Transaction</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(order.status)}
                            <div>
                              <p className="font-mono text-sm font-medium">{order.order_number}</p>
                              {order.stripe_payment_intent_id && (
                                <p className="text-xs text-gray-500">
                                  {order.stripe_payment_intent_id}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{order.customer_name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{order.customer_email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.products?.name || 'Product Deleted'}
                            </p>
                            {order.affiliates && (
                              <p className="text-xs text-blue-600">
                                via {order.affiliates.profiles?.full_name}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <span className="font-bold text-lg">
                              {formatCurrency(order.amount)}
                            </span>
                            <p className="text-xs text-gray-500">Qty: {order.quantity}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                            <p className="text-xs text-gray-500">
                              {new Date(order.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Link to={`/admin/orders/${order.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
