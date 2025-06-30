import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { requireAuth } from "~/lib/auth.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { formatCurrency } from "~/lib/utils";
import { 
  DollarSign, 
  MousePointer, 
  ShoppingCart, 
  TrendingUp,
  Link as LinkIcon,
  Users,
  Eye,
  Plus
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Affiliate Dashboard - KoalaCart" },
    { name: "description", content: "Track your affiliate performance" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.role !== 'affiliate') {
    return redirect('/dashboard');
  }
  
  const { supabase } = createSupabaseServerClient(request);
  
  // Get affiliate data
  const { data: affiliateData } = await supabase
    .from('affiliates')
    .select('*')
    .eq('profile_id', profile.id)
    .single();
  
  // Get affiliate links with product info
  const { data: affiliateLinks } = await supabase
    .from('affiliate_links')
    .select('*, products(name, base_price, image_url)')
    .eq('affiliate_id', affiliateData?.id || '')
    .order('created_at', { ascending: false })
    .limit(5);
  
  const stats = {
    totalEarnings: affiliateData?.total_earnings || 0,
    totalClicks: affiliateData?.total_clicks || 0,
    totalSales: affiliateData?.total_sales || 0,
    commissionRate: affiliateData?.commission_rate || 0,
  };
  
  return json({
    stats,
    affiliateLinks: affiliateLinks || [],
    hasAffiliateAccount: !!affiliateData
  });
}

export default function AffiliateDashboard() {
  const { stats, affiliateLinks, hasAffiliateAccount } = useLoaderData<typeof loader>();
  
  if (!hasAffiliateAccount) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Welcome to Affiliate Program</h3>
              <p className="text-gray-600 mb-6">
                You're not yet part of any affiliate programs. Browse products and request to become an affiliate.
              </p>
              <Link to="/products">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Affiliate Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your performance and manage your affiliate links</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(stats.totalEarnings)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.commissionRate * 100).toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/affiliate/links">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <LinkIcon className="h-8 w-8 text-emerald-600 mb-2" />
                <CardTitle>My Links</CardTitle>
                <CardDescription>Manage your affiliate links</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link to="/products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Plus className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Find Products</CardTitle>
                <CardDescription>Browse products to promote</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link to="/affiliate/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Analytics</CardTitle>
                <CardDescription>View detailed performance</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
        
        {/* Recent Links */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Affiliate Links</CardTitle>
            <CardDescription>Your latest promotional links</CardDescription>
          </CardHeader>
          <CardContent>
            {affiliateLinks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No affiliate links yet. Start by browsing products to promote!</p>
                <Link to="/products" className="mt-4 inline-block">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Browse Products
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {affiliateLinks.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {link.products?.image_url && (
                        <img 
                          src={link.products.image_url} 
                          alt={link.products.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{link.products?.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(link.products?.base_price || 0)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Code: {link.tracking_code}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex space-x-4 text-sm text-gray-600">
                        <span>{link.clicks} clicks</span>
                        <span>{link.conversions} sales</span>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <Link to="/affiliate/links">
                    <Button variant="outline">View All Links</Button>
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
