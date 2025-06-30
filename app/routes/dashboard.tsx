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
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🐨</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome to KoalaCart!</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Let's set up your account. What would you like to do?
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Form method="post" className="space-y-6">
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-900 mb-4">
                  Choose your account type
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      className="mr-4 w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      required
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-green-700">Seller</div>
                      <div className="text-sm text-gray-600 mt-1">Create and sell products with full control</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                    <input
                      type="radio"
                      name="role"
                      value="affiliate"
                      className="mr-4 w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      required
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-green-700">Affiliate</div>
                      <div className="text-sm text-gray-600 mt-1">Promote products and earn commissions</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                    <input
                      type="radio"
                      name="role"
                      value="buyer"
                      className="mr-4 w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      required
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-green-700">Buyer</div>
                      <div className="text-sm text-gray-600 mt-1">Purchase products and manage orders</div>
                    </div>
                  </label>
                </div>
              </div>
              
              {actionData?.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-800 text-sm font-medium">{actionData.error}</div>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
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
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🐨</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {profile?.full_name || user.user_metadata?.full_name || user.email}!
              </h1>
              <p className="text-green-700 mt-1">
                Here's what's happening with your {profile?.role === 'admin' ? 'store' : profile?.role === 'affiliate' ? 'affiliate account' : 'account'} today.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {profile?.role === 'admin' && (
            <>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Products</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
                      <div className="flex items-center mt-2">
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">+2 from last month</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sales</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">$2,847</p>
                      <div className="flex items-center mt-2">
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">+12% from last month</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Affiliates</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">8</p>
                      <div className="flex items-center mt-2">
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">+3 new this month</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">3.2%</p>
                      <div className="flex items-center mt-2">
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">+0.5% from last month</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {profile?.role === 'affiliate' && (
            <>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">$1,247</p>
                      <div className="flex items-center mt-2">
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">+8% from last month</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Links</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">15</p>
                      <div className="flex items-center mt-2">
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">+3 new this month</span>
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
                      <p className="text-sm font-medium text-gray-600">Clicks</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">1,284</p>
                      <div className="flex items-center mt-2">
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">+15% from last month</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Eye className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">2.8%</p>
                      <div className="flex items-center mt-2">
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">+0.3% from last month</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {profile?.role === 'buyer' && (
            <>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">23</p>
                      <div className="flex items-center mt-2">
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">+5 this month</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">$847</p>
                      <div className="flex items-center mt-2">
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">+$120 this month</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Wishlist Items</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">7</p>
                      <div className="flex items-center mt-2">
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">2 new this week</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Saved</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">$127</p>
                      <div className="flex items-center mt-2">
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">From discounts</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              <CardDescription className="text-gray-600">
                Common tasks to get you started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile?.role === 'admin' && (
                <>
                  <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Product
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50 py-3 rounded-lg transition-colors">
                    <Eye className="w-4 h-4 mr-2" />
                    View Orders
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50 py-3 rounded-lg transition-colors">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Affiliates
                  </Button>
                </>
              )}
              
              {profile?.role === 'affiliate' && (
                <>
                  <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Link
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50 py-3 rounded-lg transition-colors">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50 py-3 rounded-lg transition-colors">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Check Earnings
                  </Button>
                </>
              )}
              
              {profile?.role === 'buyer' && (
                <>
                  <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                    <Package className="w-4 h-4 mr-2" />
                    Browse Products
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50 py-3 rounded-lg transition-colors">
                    <Eye className="w-4 h-4 mr-2" />
                    Track Orders
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50 py-3 rounded-lg transition-colors">
                    <Users className="w-4 h-4 mr-2" />
                    View Wishlist
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              <CardDescription className="text-gray-600">
                Your latest actions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Account created successfully</p>
                    <p className="text-xs text-gray-500 mt-1">Welcome to KoalaCart!</p>
                  </div>
                  <span className="text-xs text-gray-400">Just now</span>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Profile setup completed</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">Role: {profile?.role}</p>
                  </div>
                  <span className="text-xs text-gray-400">1 min ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
