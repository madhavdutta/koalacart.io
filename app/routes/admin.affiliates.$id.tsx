import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation, Link } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  DollarSign, 
  MousePointer, 
  ShoppingCart,
  Edit,
  Save,
  Trash2,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.affiliate?.profiles?.full_name || 'Affiliate'} - KoalaCart Admin` },
    { name: "description", content: "View and manage affiliate details" },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  const { supabase } = createSupabaseServerClient(request);
  const affiliateId = params.id;
  
  if (!affiliateId) {
    throw new Response("Affiliate ID is required", { status: 400 });
  }
  
  // Get affiliate details
  const { data: affiliate, error } = await supabase
    .from('affiliates')
    .select(`
      *,
      profiles (
        full_name,
        email,
        avatar_url,
        created_at
      )
    `)
    .eq('id', affiliateId)
    .eq('admin_id', profile.id)
    .single();
  
  if (error || !affiliate) {
    throw new Response("Affiliate not found", { status: 404 });
  }
  
  // Get affiliate links
  const { data: affiliateLinks } = await supabase
    .from('affiliate_links')
    .select(`
      *,
      products (
        name,
        base_price
      )
    `)
    .eq('affiliate_id', affiliate.id);
  
  // Get recent orders from this affiliate
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      *,
      products (
        name
      )
    `)
    .eq('affiliate_id', affiliate.id)
    .order('created_at', { ascending: false })
    .limit(10);
  
  return json({ 
    user, 
    profile, 
    affiliate,
    affiliateLinks: affiliateLinks || [],
    recentOrders: recentOrders || []
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  const { supabase } = createSupabaseServerClient(request);
  const affiliateId = params.id;
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  
  try {
    if (intent === 'update') {
      const commissionRate = parseFloat(formData.get('commissionRate') as string);
      const notes = formData.get('notes') as string;
      
      const { error } = await supabase
        .from('affiliates')
        .update({
          commission_rate: commissionRate,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', affiliateId)
        .eq('admin_id', profile.id);
      
      if (error) {
        return json({ error: 'Failed to update affiliate' }, { status: 400 });
      }
      
      return json({ success: 'Affiliate updated successfully' });
    }
    
    if (intent === 'toggle-status') {
      const isActive = formData.get('isActive') === 'true';
      
      const { error } = await supabase
        .from('affiliates')
        .update({
          is_active: !isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', affiliateId)
        .eq('admin_id', profile.id);
      
      if (error) {
        return json({ error: 'Failed to update affiliate status' }, { status: 400 });
      }
      
      return json({ success: `Affiliate ${!isActive ? 'activated' : 'deactivated'} successfully` });
    }
    
    if (intent === 'delete') {
      const { error } = await supabase
        .from('affiliates')
        .delete()
        .eq('id', affiliateId)
        .eq('admin_id', profile.id);
      
      if (error) {
        return json({ error: 'Failed to delete affiliate' }, { status: 400 });
      }
      
      return redirect('/admin/affiliates');
    }
    
    return json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Affiliate action error:', error);
    return json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export default function AffiliateDetail() {
  const { user, profile, affiliate, affiliateLinks, recentOrders } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  const totalEarnings = affiliate.total_earnings || 0;
  const totalClicks = affiliate.total_clicks || 0;
  const totalSales = affiliate.total_sales || 0;
  const conversionRate = totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0;
  
  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/admin/affiliates">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Affiliates
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {affiliate.profiles?.full_name || 'Affiliate Details'}
              </h1>
              <p className="text-gray-600 mt-2">Manage affiliate partnership</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Form method="post" className="inline">
              <input type="hidden" name="intent" value="toggle-status" />
              <input type="hidden" name="isActive" value={affiliate.is_active.toString()} />
              <Button 
                type="submit" 
                variant="outline"
                className={affiliate.is_active ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}
                disabled={isSubmitting}
              >
                {affiliate.is_active ? (
                  <>
                    <ToggleRight className="w-4 h-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
            </Form>
            
            <Form method="post" className="inline" onSubmit={(e) => {
              if (!confirm('Are you sure you want to delete this affiliate? This action cannot be undone.')) {
                e.preventDefault();
              }
            }}>
              <input type="hidden" name="intent" value="delete" />
              <Button type="submit" variant="outline" className="text-red-600 hover:bg-red-50" disabled={isSubmitting}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </Form>
          </div>
        </div>
        
        {/* Success/Error Messages */}
        {actionData?.success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-green-800 font-medium">{actionData.success}</div>
          </div>
        )}
        
        {actionData?.error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-red-800 font-medium">{actionData.error}</div>
          </div>
        )}
        
        {/* Affiliate Info & Stats */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Affiliate Profile */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Affiliate Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                  {affiliate.profiles?.full_name?.charAt(0) || affiliate.profiles?.email?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{affiliate.profiles?.full_name}</p>
                  <p className="text-sm text-gray-600">{affiliate.profiles?.email}</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={affiliate.is_active ? "default" : "secondary"} className={affiliate.is_active ? "bg-green-100 text-green-800" : ""}>
                    {affiliate.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Commission Rate</span>
                  <span className="font-semibold text-green-600">{affiliate.commission_rate}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Joined</span>
                  <span className="text-sm text-gray-900">
                    {new Date(affiliate.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Performance Stats */}
          <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-600">${totalEarnings.toFixed(2)}</p>
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
                    <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                    <p className="text-2xl font-bold text-blue-600">{totalClicks.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <MousePointer className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-purple-600">{totalSales}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-orange-600">{conversionRate.toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Edit Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-green-600" />
              Edit Affiliate Settings
            </CardTitle>
            <CardDescription>Update commission rate and notes</CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="update" />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="commissionRate" className="text-sm font-medium text-gray-700">
                    Commission Rate (%)
                  </Label>
                  <Input
                    id="commissionRate"
                    name="commissionRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    defaultValue={affiliate.commission_rate}
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={affiliate.notes || ''}
                  placeholder="Add notes about this affiliate..."
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  rows={3}
                />
              </div>
              
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isSubmitting}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </Form>
          </CardContent>
        </Card>
        
        {/* Affiliate Links */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Affiliate Links</CardTitle>
            <CardDescription>Products this affiliate is promoting</CardDescription>
          </CardHeader>
          <CardContent>
            {affiliateLinks.length === 0 ? (
              <div className="text-center py-8">
                <MousePointer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No affiliate links created yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {affiliateLinks.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">{link.products?.name}</p>
                      <p className="text-sm text-gray-600">
                        Tracking Code: <code className="bg-gray-200 px-2 py-1 rounded text-xs">{link.tracking_code}</code>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{link.clicks} clicks</p>
                      <p className="text-sm text-gray-600">{link.conversions} conversions</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Orders */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest sales from this affiliate</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders from this affiliate yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer_email}</p>
                      <p className="text-sm text-gray-600">{order.products?.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${order.amount.toFixed(2)}</p>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {order.status}
                      </Badge>
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
