import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { requireAuth } from "~/lib/auth.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { formatCurrency } from "~/lib/utils";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  ExternalLink,
  Copy,
  Package
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Affiliate Dashboard - KoalaCart" },
    { name: "description", content: "Manage your affiliate links and track your earnings." },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  const { supabase } = createSupabaseServerClient(request);
  
  // Get affiliate accounts - fix the relationship
  const { data: affiliates } = await supabase
    .from('affiliates')
    .select(`
      *,
      profiles!affiliates_admin_id_fkey(full_name, email),
      affiliate_links(*, products(name, base_price, currency, image_url))
    `)
    .eq('profile_id', profile.id);
  
  // Calculate totals
  const totalEarnings = affiliates?.reduce((sum, affiliate) => sum + affiliate.total_earnings, 0) || 0;
  const totalClicks = affiliates?.reduce((sum, affiliate) => sum + affiliate.total_clicks, 0) || 0;
  const totalSales = affiliates?.reduce((sum, affiliate) => sum + affiliate.total_sales, 0) || 0;
  
  return json({ 
    affiliates: affiliates || [], 
    totalEarnings, 
    totalClicks, 
    totalSales,
    baseUrl: new URL(request.url).origin
  });
}

export default function AffiliateDashboard() {
  const { affiliates, totalEarnings, totalClicks, totalSales, baseUrl } = useLoaderData<typeof loader>();
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Affiliate Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Track your performance and manage your affiliate links
          </p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalEarnings)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MousePointer className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                  <p className="text-2xl font-bold text-gray-900">{totalClicks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalClicks > 0 ? ((totalSales / totalClicks) * 100).toFixed(1) : '0'}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Affiliate Links */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Your Affiliate Links</h2>
            <Link to="/products">
              <Button>
                <Package className="h-4 w-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
          
          {affiliates.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Affiliate Links Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by applying to promote products and earn commissions.
                </p>
                <Link to="/products">
                  <Button>
                    Browse Products to Promote
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {affiliates.map((affiliate) => (
                <Card key={affiliate.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <Users className="h-5 w-5 mr-2" />
                          Seller: {affiliate.profiles.full_name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {affiliate.profiles.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={affiliate.is_active ? "default" : "secondary"}>
                          {affiliate.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {(affiliate.commission_rate * 100).toFixed(0)}% Commission
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-800">Earnings</span>
                        </div>
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(affiliate.total_earnings)}
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Eye className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-blue-800">Clicks</span>
                        </div>
                        <div className="text-xl font-bold text-blue-600">
                          {affiliate.total_clicks}
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                          <span className="text-sm font-medium text-purple-800">Sales</span>
                        </div>
                        <div className="text-xl font-bold text-purple-600">
                          {affiliate.total_sales}
                        </div>
                      </div>
                    </div>
                    
                    {/* Product Links */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Product Links</h4>
                      {affiliate.affiliate_links.map((link) => {
                        const affiliateUrl = `${baseUrl}/products/${link.product_id}?ref=${link.tracking_code}`;
                        
                        return (
                          <div key={link.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start space-x-3">
                                {link.products.image_url ? (
                                  <img 
                                    src={link.products.image_url} 
                                    alt={link.products.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                    <Package className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <h5 className="font-medium text-gray-900">
                                    {link.products.name}
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {formatCurrency(link.products.base_price)} • 
                                    {link.clicks} clicks • {link.conversions} sales
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(affiliateUrl)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Link to={affiliateUrl} target="_blank">
                                  <Button variant="outline" size="sm">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor={`link-${link.id}`} className="text-sm">
                                Affiliate Link
                              </Label>
                              <div className="flex mt-1">
                                <Input
                                  id={`link-${link.id}`}
                                  value={affiliateUrl}
                                  readOnly
                                  className="flex-1 text-sm"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="ml-2"
                                  onClick={() => copyToClipboard(affiliateUrl)}
                                >
                                  Copy
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
