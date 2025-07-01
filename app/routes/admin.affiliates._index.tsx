import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { requireAuth } from "~/lib/auth.server";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Plus, Eye, Users, DollarSign, TrendingUp, MousePointer } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Affiliates - KoalaCart Admin" },
    { name: "description", content: "Manage your affiliate partners" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  const { supabase } = createSupabaseServerClient(request);
  
  const { data: affiliates, error } = await supabase
    .from('affiliates')
    .select(`
      *,
      profiles (
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('admin_id', profile.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching affiliates:', error);
  }
  
  // Calculate stats
  const totalAffiliates = affiliates?.length || 0;
  const activeAffiliates = affiliates?.filter(a => a.is_active).length || 0;
  const totalEarnings = affiliates?.reduce((sum, a) => sum + a.total_earnings, 0) || 0;
  const totalClicks = affiliates?.reduce((sum, a) => sum + a.total_clicks, 0) || 0;
  
  return json({ 
    user, 
    profile, 
    affiliates: affiliates || [],
    stats: {
      totalAffiliates,
      activeAffiliates,
      totalEarnings,
      totalClicks
    }
  });
}

export default function AffiliatesIndex() {
  const { user, profile, affiliates, stats } = useLoaderData<typeof loader>();
  
  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Affiliates</h1>
            <p className="text-gray-600 mt-2">Manage your affiliate partners</p>
          </div>
          <Link to="/admin/affiliates/new">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Affiliate
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Affiliates</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAffiliates}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Affiliates</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeAffiliates}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MousePointer className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClicks.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Affiliates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Affiliate Partners</CardTitle>
            <CardDescription>Manage your affiliate relationships</CardDescription>
          </CardHeader>
          <CardContent>
            {affiliates.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No affiliates yet</h3>
                <p className="text-gray-500 mb-6">Start building your affiliate network</p>
                <Link to="/admin/affiliates/new">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Affiliate
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Affiliate</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Commission Rate</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Total Earnings</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Clicks</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Sales</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliates.map((affiliate) => (
                      <tr key={affiliate.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {affiliate.profiles?.full_name?.charAt(0) || affiliate.profiles?.email?.charAt(0) || 'A'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {affiliate.profiles?.full_name || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500">{affiliate.profiles?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-green-600">
                            {affiliate.commission_rate}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-green-600">
                            ${affiliate.total_earnings.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-900">
                            {affiliate.total_clicks.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-900">
                            {affiliate.total_sales}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={affiliate.is_active ? "default" : "secondary"}>
                            {affiliate.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {new Date(affiliate.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Link to={`/admin/affiliates/${affiliate.id}`}>
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
