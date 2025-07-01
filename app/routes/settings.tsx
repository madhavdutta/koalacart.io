import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation, Link, Outlet, useLocation } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  Shield, 
  Bell, 
  Save,
  Settings as SettingsIcon,
  ChevronRight
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Settings - KoalaCart" },
    { name: "description", content: "Manage your KoalaCart account settings" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  const { supabase } = createSupabaseServerClient(request);
  
  // Get payment gateways
  const { data: paymentGateways } = await supabase
    .from('payment_gateways')
    .select('*')
    .eq('user_id', user.id);
  
  return json({
    user,
    profile,
    paymentGateways: paymentGateways || []
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  const { supabase } = createSupabaseServerClient(request);
  
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  
  try {
    if (intent === 'update-profile') {
      const fullName = formData.get('fullName') as string;
      const phone = formData.get('phone') as string;
      const company = formData.get('company') as string;
      const website = formData.get('website') as string;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone,
          company,
          website,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (error) {
        return json({ error: 'Failed to update profile' }, { status: 400 });
      }
      
      return json({ success: 'Profile updated successfully' });
    }
    
    return json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Settings action error:', error);
    return json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export default function Settings() {
  const { user, profile, paymentGateways } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const location = useLocation();
  const isSubmitting = navigation.state === 'submitting';
  
  const isRootSettings = location.pathname === '/settings';
  
  const settingsNavigation = [
    {
      name: 'Profile',
      href: '/settings',
      icon: User,
      description: 'Personal information and account details'
    },
    {
      name: 'Payment Gateways',
      href: '/settings/payments',
      icon: CreditCard,
      description: 'Manage Stripe, PayPal and other payment methods'
    },
    {
      name: 'Security',
      href: '/settings/security',
      icon: Shield,
      description: 'Password, 2FA and security preferences'
    },
    {
      name: 'Notifications',
      href: '/settings/notifications',
      icon: Bell,
      description: 'Email and push notification settings'
    }
  ];
  
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email?.slice(0, 2).toUpperCase() || 'U'
  }
  
  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-8">
          {/* Settings Sidebar */}
          <div className="w-80 flex-shrink-0">
            {/* Profile Card */}
            <Card className="border-0 shadow-lg mb-6">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                    {getInitials(profile.full_name || user.user_metadata?.full_name, user.email)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {profile.full_name || user.user_metadata?.full_name || 'User'}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800 capitalize">
                      {profile.role}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-gray-900">
                      {paymentGateways.filter(g => g.is_active).length}
                    </div>
                    <div className="text-xs text-gray-600">Active Gateways</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-gray-900">24</div>
                    <div className="text-xs text-gray-600">Days Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Settings Navigation */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <SettingsIcon className="w-5 h-5" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {settingsNavigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center justify-between px-6 py-4 text-sm transition-colors hover:bg-gray-50 ${
                          isActive ? 'bg-green-50 border-r-2 border-green-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                          <div>
                            <div className={`font-medium ${isActive ? 'text-green-900' : 'text-gray-900'}`}>
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {item.description}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                      </Link>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {isRootSettings ? (
              <div className="space-y-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                      <p className="text-green-700 mt-1">
                        Manage your personal information and account details
                      </p>
                    </div>
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
                
                {/* Profile Form */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-lg font-semibold">Personal Information</CardTitle>
                    <CardDescription className="text-gray-600">
                      Update your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form method="post" className="space-y-6">
                      <input type="hidden" name="intent" value="update-profile" />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            defaultValue={profile.full_name || ''}
                            placeholder="Enter your full name"
                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                          <Input
                            id="email"
                            value={user.email}
                            disabled
                            className="bg-gray-50 border-gray-200"
                          />
                          <p className="text-xs text-gray-500">Email cannot be changed</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            defaultValue={profile.phone || ''}
                            placeholder="Enter your phone number"
                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="company" className="text-sm font-medium text-gray-700">Company</Label>
                          <Input
                            id="company"
                            name="company"
                            defaultValue={profile.company || ''}
                            placeholder="Enter your company name"
                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="website" className="text-sm font-medium text-gray-700">Website</Label>
                          <Input
                            id="website"
                            name="website"
                            type="url"
                            defaultValue={profile.website || ''}
                            placeholder="https://your-website.com"
                            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-4 border-t border-gray-200">
                        <Button 
                          type="submit" 
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                          disabled={isSubmitting}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </Form>
                  </CardContent>
                </Card>
                
                {/* Account Stats */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-lg font-semibold">Account Overview</CardTitle>
                    <CardDescription className="text-gray-600">
                      Your account statistics and activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-600 text-sm font-medium">Account Created</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">
                              {new Date(profile.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-600 text-sm font-medium">Payment Gateways</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">
                              {paymentGateways.filter(g => g.is_active).length} Active
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-600 text-sm font-medium">Account Status</p>
                            <p className="text-2xl font-bold text-purple-900 mt-1 capitalize">
                              {profile.role}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
