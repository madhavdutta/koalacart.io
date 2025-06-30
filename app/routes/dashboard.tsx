import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { Package, Users, CreditCard, TrendingUp, Plus, Eye, ArrowUpRight, ArrowDownRight } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard - KoalaCart" },
    { name: "description", content: "Your KoalaCart dashboard" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);
  
  // Check if user is authenticated
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.log('No session found, redirecting to login');
    return redirect('/login');
  }
  
  console.log('Session found for user:', session.user.id);
  
  // Try to get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();
  
  if (profileError) {
    console.log('Profile error:', profileError);
  }
  
  return json({
    user: session.user,
    profile,
    needsSetup: !profile
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return redirect('/login');
  }
  
  const formData = await request.formData();
  const role = formData.get('role') as 'admin' | 'affiliate' | 'buyer';
  
  if (!role) {
    return json({ error: 'Please select an account type' }, { status: 400 });
  }
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        user_id: session.user.id,
        email: session.user.email!,
        full_name: session.user.user_metadata?.full_name || '',
        role,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Profile creation error:', error);
      return json({ error: 'Failed to create profile' }, { status: 400 });
    }
    
    console.log('Profile created successfully:', profile);
    
    // Redirect based on role
    if (role === 'admin') {
      return redirect('/admin/dashboard');
    } else if (role === 'affiliate') {
      return redirect('/affiliate/dashboard');
    } else {
      return redirect('/dashboard');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export default function Dashboard() {
  const { user, profile, needsSetup } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  if (needsSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-sm border">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🐨</span>
              </div>
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">Welcome to KoalaCart</CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Choose your account type to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Form method="post" className="space-y-4">
              <div>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:border-green-300 hover:bg-green-50 transition-colors group">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      className="mr-3 w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      required
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 group-hover:text-green-700">Seller</div>
                      <div className="text-sm text-gray-600 mt-0.5">Create and sell products</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:border-green-300 hover:bg-green-50 transition-colors group">
                    <input
                      type="radio"
                      name="role"
                      value="affiliate"
                      className="mr-3 w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      required
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 group-hover:text-green-700">Affiliate</div>
                      <div className="text-sm text-gray-600 mt-0.5">Promote products and earn commissions</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:border-green-300 hover:bg-green-50 transition-colors group">
                    <input
                      type="radio"
                      name="role"
                      value="buyer"
                      className="mr-3 w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      required
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 group-hover:text-green-700">Buyer</div>
                      <div className="text-sm text-gray-600 mt-0.5">Purchase products</div>
                    </div>
                  </label>
                </div>
              </div>
              
              {actionData?.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="text-red-800 text-sm">{actionData.error}</div>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-md transition-colors" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Setting up...' : 'Continue'}
              </Button>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, {profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0]}
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your {profile?.role === 'admin' ? 'store' : profile?.role === 'affiliate' ? 'affiliate account' : 'account'} today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {profile?.role === 'admin' && (
            <>
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Products</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">12</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 ml-1">+2 this month</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Sales</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">$2,847</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 ml-1">+12% this month</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Affiliates</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">8</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 ml-1">+3 new</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Conversion Rate</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">3.2%</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 ml-1">+0.5%</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {profile?.role === 'affiliate' && (
            <>
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Earnings</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">$1,247</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 ml-1">+8% this month</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Links</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">15</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 ml-1">+3 new</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Clicks</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">1,284</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 ml-1">+15% this month</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Conversion Rate</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">2.8%</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 ml-1">+0.3%</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {profile?.role === 'buyer' && (
            <>
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">23</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 ml-1">+5 this month</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">$847</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 ml-1">+$120 this month</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Wishlist Items</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">7</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 ml-1">2 new this week</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Saved</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">$127</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 ml-1">From discounts</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Common tasks to get you started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {profile?.role === 'admin' && (
                <>
                  <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-md text-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Product
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50 py-2 rounded-md text-sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Orders
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50 py-2 rounded-md text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Affiliates
                  </Button>
                </>
              )}
              
              {profile?.role === 'affiliate' && (
                <>
                  <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-md text-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Link
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50 py-2 rounded-md text-sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50 py-2 rounded-md text-sm">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Check Earnings
                  </Button>
                </>
              )}
              
              {profile?.role === 'buyer' && (
                <>
                  <Button className="w-full justify-start bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-md text-sm">
                    <Package className="w-4 h-4 mr-2" />
                    Browse Products
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50 py-2 rounded-md text-sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Track Orders
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50 py-2 rounded-md text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    View Wishlist
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Your latest actions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Account created successfully</p>
                    <p className="text-xs text-gray-500 mt-0.5">Welcome to KoalaCart!</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">Just now</span>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Profile setup completed</p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">Role: {profile?.role}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">1 min ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
