import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { requireAuth } from "~/lib/auth.server";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { formatCurrency } from "~/lib/utils";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Eye,
  MousePointer,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Analytics - KoalaCart Admin" },
    { name: "description", content: "View detailed analytics and performance metrics" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  const { supabase } = createSupabaseServerClient(request);
  
  // Get current date ranges
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  
  // Get admin's product IDs
  const { data: adminProducts } = await supabase
    .from('products')
    .select('id')
    .eq('admin_id', profile.id);
  
  const productIds = adminProducts?.map(p => p.id) || [];
  
  // If no products, return empty analytics
  if (productIds.length === 0) {
    return json({
      user,
      profile,
      metrics: {
        currentRevenue: 0,
        revenueGrowth: 0,
        currentOrderCount: 0,
        orderGrowth: 0,
        totalRevenue: 0,
        totalOrderCount: 0,
        averageOrderValue: 0,
        totalClicks: 0,
        totalConversions: 0,
        conversionRate: 0,
        affiliateCount: 0,
        activeAffiliates: 0
      },
      recentOrders: [],
      topProducts: [],
      monthlyData: Array.from({ length: 12 }, (_, i) => {
        const month = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        return {
          month: month.toLocaleDateString('en-US', { month: 'short' }),
          revenue: 0,
          orders: 0
        };
      }),
      affiliateLinks: []
    });
  }
  
  // Get analytics data
  const [
    { data: currentOrders },
    { data: previousOrders },
    { data: totalOrders },
    { data: affiliates },
    { data: affiliateLinks },
    { data: recentOrders },
    { data: monthlyRevenue }
  ] = await Promise.all([
    // Current period orders (last 30 days)
    supabase
      .from('orders')
      .select('*')
      .in('product_id', productIds)
      .eq('status', 'paid')
      .gte('created_at', thirtyDaysAgo.toISOString()),
    
    // Previous period orders (30-60 days ago)
    supabase
      .from('orders')
      .select('*')
      .in('product_id', productIds)
      .eq('status', 'paid')
      .gte('created_at', sixtyDaysAgo.toISOString())
      .lt('created_at', thirtyDaysAgo.toISOString()),
    
    // Total orders
    supabase
      .from('orders')
      .select('*')
      .in('product_id', productIds)
      .eq('status', 'paid'),
    
    // Affiliates data
    supabase
      .from('affiliates')
      .select('*')
      .eq('admin_id', profile.id),
    
    // Affiliate links with clicks
    supabase
      .from('affiliate_links')
      .select('*, products(name)')
      .in('product_id', productIds),
    
    // Recent orders with product info
    supabase
      .from('orders')
      .select('*, products(name)')
      .in('product_id', productIds)
      .order('created_at', { ascending: false })
      .limit(10),
    
    // Monthly revenue for chart
    supabase
      .from('orders')
      .select('created_at, amount, product_id')
      .in('product_id', productIds)
      .eq('status', 'paid')
      .gte('created_at', new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString())
  ]);
  
  // Calculate metrics
  const currentRevenue = currentOrders?.reduce((sum, order) => sum + order.amount, 0) || 0;
  const previousRevenue = previousOrders?.reduce((sum, order) => sum + order.amount, 0) || 0;
  const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  
  const currentOrderCount = currentOrders?.length || 0;
  const previousOrderCount = previousOrders?.length || 0;
  const orderGrowth = previousOrderCount > 0 ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 : 0;
  
  const totalRevenue = totalOrders?.reduce((sum, order) => sum + order.amount, 0) || 0;
  const totalOrderCount = totalOrders?.length || 0;
  const averageOrderValue = totalOrderCount > 0 ? totalRevenue / totalOrderCount : 0;
  
  const totalClicks = affiliateLinks?.reduce((sum, link) => sum + link.clicks, 0) || 0;
  const totalConversions = affiliateLinks?.reduce((sum, link) => sum + link.conversions, 0) || 0;
  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  
  // Calculate top products manually from orders
  const productSales = new Map();
  totalOrders?.forEach(order => {
    if (order.product_id) {
      const current = productSales.get(order.product_id) || { count: 0, product_id: order.product_id };
      current.count += 1;
      productSales.set(order.product_id, current);
    }
  });
  
  // Get product names for top products
  const topProductIds = Array.from(productSales.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(p => p.product_id);
  
  const { data: topProductsData } = await supabase
    .from('products')
    .select('id, name')
    .in('id', topProductIds);
  
  const topProducts = topProductIds.map(id => {
    const product = topProductsData?.find(p => p.id === id);
    const sales = productSales.get(id);
    return {
      product_id: id,
      products: { name: product?.name || 'Unknown Product' },
      count: sales?.count || 0
    };
  });
  
  // Process monthly revenue data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const monthOrders = monthlyRevenue?.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate.getMonth() === month.getMonth() && orderDate.getFullYear() === month.getFullYear();
    }) || [];
    
    return {
      month: month.toLocaleDateString('en-US', { month: 'short' }),
      revenue: monthOrders.reduce((sum, order) => sum + order.amount, 0),
      orders: monthOrders.length
    };
  });
  
  return json({
    user,
    profile,
    metrics: {
      currentRevenue,
      revenueGrowth,
      currentOrderCount,
      orderGrowth,
      totalRevenue,
      totalOrderCount,
      averageOrderValue,
      totalClicks,
      totalConversions,
      conversionRate,
      affiliateCount: affiliates?.length || 0,
      activeAffiliates: affiliates?.filter(a => a.is_active).length || 0
    },
    recentOrders: recentOrders || [],
    topProducts,
    monthlyData,
    affiliateLinks: affiliateLinks || []
  });
}

export default function AdminAnalytics() {
  const { user, profile, metrics, recentOrders, topProducts, monthlyData, affiliateLinks } = useLoaderData<typeof loader>();
  
  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your sales performance and affiliate metrics</p>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue (30 days)</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(metrics.currentRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    {metrics.revenueGrowth >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(metrics.revenueGrowth).toFixed(1)}% vs last period
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Orders (30 days)</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.currentOrderCount}</p>
                  <div className="flex items-center mt-2">
                    {metrics.orderGrowth >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${metrics.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(metrics.orderGrowth).toFixed(1)}% vs last period
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(metrics.averageOrderValue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-600">
                      From {metrics.totalOrderCount} total orders
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.conversionRate.toFixed(1)}%</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-600">
                      {metrics.totalConversions} / {metrics.totalClicks} clicks
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <MousePointer className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Revenue Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Revenue Trend (Last 12 Months)</CardTitle>
            <CardDescription>Monthly revenue and order volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-end justify-between space-x-2">
              {monthlyData.map((data, index) => {
                const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));
                const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-gray-100 rounded-t-md relative" style={{ height: '240px' }}>
                      <div 
                        className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-md absolute bottom-0 transition-all duration-500"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-xs font-medium text-gray-900">{data.month}</p>
                      <p className="text-xs text-gray-600">{formatCurrency(data.revenue)}</p>
                      <p className="text-xs text-gray-500">{data.orders} orders</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performing products by sales volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No sales data available</p>
                  </div>
                ) : (
                  topProducts.map((product, index) => (
                    <div key={product.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.products?.name}</p>
                          <p className="text-sm text-gray-600">{product.count} sales</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Affiliate Performance */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Affiliate Performance</CardTitle>
              <CardDescription>Top performing affiliate links</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {affiliateLinks.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No affiliate links created yet</p>
                  </div>
                ) : (
                  affiliateLinks
                    .sort((a, b) => b.clicks - a.clicks)
                    .slice(0, 5)
                    .map((link) => (
                      <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{link.products?.name}</p>
                          <p className="text-sm text-gray-600">
                            {link.clicks} clicks • {link.conversions} conversions
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            {link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(1) : 0}%
                          </p>
                          <p className="text-xs text-gray-500">conversion rate</p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest sales activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent orders</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <ShoppingCart className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{order.customer_email}</p>
                        <p className="text-sm text-gray-600">{order.products?.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
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
