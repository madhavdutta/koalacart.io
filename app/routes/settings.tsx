import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation, Link } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { ArrowLeft, User, CreditCard, Shield, Bell, Save } from "lucide-react";

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
    
    if (intent === 'add-stripe') {
      const stripePublishableKey = formData.get('stripePublishableKey') as string;
      const stripeSecretKey = formData.get('stripeSecretKey') as string;
      const stripeWebhookSecret = formData.get('stripeWebhookSecret') as string;
      
      if (!stripePublishableKey || !stripeSecretKey) {
        return json({ error: 'Stripe keys are required' }, { status: 400 });
      }
      
      const { error } = await supabase
        .from('payment_gateways')
        .upsert({
          user_id: user.id,
          gateway_type: 'stripe',
          publishable_key: stripePublishableKey,
          secret_key: stripeSecretKey,
          webhook_secret: stripeWebhookSecret,
          is_active: true
        });
      
      if (error) {
        return json({ error: 'Failed to save Stripe configuration' }, { status: 400 });
      }
      
      return json({ success: 'Stripe configuration saved successfully' });
    }
    
    if (intent === 'add-paypal') {
      const paypalClientId = formData.get('paypalClientId') as string;
      const paypalClientSecret = formData.get('paypalClientSecret') as string;
      const paypalMode = formData.get('paypalMode') as string;
      
      if (!paypalClientId || !paypalClientSecret) {
        return json({ error: 'PayPal credentials are required' }, { status: 400 });
      }
      
      const { error } = await supabase
        .from('payment_gateways')
        .upsert({
          user_id: user.id,
          gateway_type: 'paypal',
          client_id: paypalClientId,
          client_secret: paypalClientSecret,
          mode: paypalMode,
          is_active: true
        });
      
      if (error) {
        return json({ error: 'Failed to save PayPal configuration' }, { status: 400 });
      }
      
      return json({ success: 'PayPal configuration saved successfully' });
    }
    
    if (intent === 'toggle-gateway') {
      const gatewayId = formData.get('gatewayId') as string;
      const isActive = formData.get('isActive') === 'true';
      
      const { error } = await supabase
        .from('payment_gateways')
        .update({ is_active: !isActive })
        .eq('id', gatewayId)
        .eq('user_id', user.id);
      
      if (error) {
        return json({ error: 'Failed to update gateway status' }, { status: 400 });
      }
      
      return json({ success: 'Gateway status updated' });
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
  const isSubmitting = navigation.state === 'submitting';
  
  const stripeGateway = paymentGateways.find(g => g.gateway_type === 'stripe');
  const paypalGateway = paymentGateways.find(g => g.gateway_type === 'paypal');
  
  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 border border-green-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-green-700 mt-1">
                Manage your account preferences and configuration
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
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="profile" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg font-semibold">Profile Information</CardTitle>
                <CardDescription className="text-gray-600">
                  Update your personal information and business details
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
          </TabsContent>
          
          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            {/* Current Payment Gateways */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg font-semibold">Connected Payment Gateways</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage your payment processing accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentGateways.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment gateways connected</h3>
                    <p className="text-gray-600">Add a payment gateway below to start accepting payments.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentGateways.map((gateway) => (
                      <div key={gateway.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            {gateway.gateway_type === 'stripe' ? '💳' : '🅿️'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 capitalize">{gateway.gateway_type}</div>
                            <div className="text-sm text-gray-600">
                              {gateway.gateway_type === 'stripe' 
                                ? `Key: ${gateway.publishable_key?.substring(0, 20)}...`
                                : `Client ID: ${gateway.client_id?.substring(0, 20)}...`
                              }
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={gateway.is_active ? "default" : "secondary"} className={gateway.is_active ? "bg-green-100 text-green-800" : ""}>
                            {gateway.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Form method="post" className="inline">
                            <input type="hidden" name="intent" value="toggle-gateway" />
                            <input type="hidden" name="gatewayId" value={gateway.id} />
                            <input type="hidden" name="isActive" value={gateway.is_active.toString()} />
                            <Button variant="outline" size="sm" type="submit" className="border-gray-300 hover:bg-gray-50">
                              {gateway.is_active ? 'Disable' : 'Enable'}
                            </Button>
                          </Form>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Add Stripe */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  💳 Stripe Configuration
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Connect your Stripe account to accept credit card payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form method="post" className="space-y-4">
                  <input type="hidden" name="intent" value="add-stripe" />
                  
                  <div className="space-y-2">
                    <Label htmlFor="stripePublishableKey" className="text-sm font-medium text-gray-700">Publishable Key</Label>
                    <Input
                      id="stripePublishableKey"
                      name="stripePublishableKey"
                      defaultValue={stripeGateway?.publishable_key || ''}
                      placeholder="pk_test_..."
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stripeSecretKey" className="text-sm font-medium text-gray-700">Secret Key</Label>
                    <Input
                      id="stripeSecretKey"
                      name="stripeSecretKey"
                      type="password"
                      defaultValue={stripeGateway?.secret_key || ''}
                      placeholder="sk_test_..."
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stripeWebhookSecret" className="text-sm font-medium text-gray-700">Webhook Secret (Optional)</Label>
                    <Input
                      id="stripeWebhookSecret"
                      name="stripeWebhookSecret"
                      type="password"
                      defaultValue={stripeGateway?.webhook_secret || ''}
                      placeholder="whsec_..."
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  
                  <Button type="submit" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    {stripeGateway ? 'Update Stripe' : 'Connect Stripe'}
                  </Button>
                </Form>
              </CardContent>
            </Card>
            
            {/* Add PayPal */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  🅿️ PayPal Configuration
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Connect your PayPal account to accept PayPal payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form method="post" className="space-y-4">
                  <input type="hidden" name="intent" value="add-paypal" />
                  
                  <div className="space-y-2">
                    <Label htmlFor="paypalClientId" className="text-sm font-medium text-gray-700">Client ID</Label>
                    <Input
                      id="paypalClientId"
                      name="paypalClientId"
                      defaultValue={paypalGateway?.client_id || ''}
                      placeholder="Your PayPal Client ID"
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paypalClientSecret" className="text-sm font-medium text-gray-700">Client Secret</Label>
                    <Input
                      id="paypalClientSecret"
                      name="paypalClientSecret"
                      type="password"
                      defaultValue={paypalGateway?.client_secret || ''}
                      placeholder="Your PayPal Client Secret"
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paypalMode" className="text-sm font-medium text-gray-700">Mode</Label>
                    <select
                      id="paypalMode"
                      name="paypalMode"
                      defaultValue={paypalGateway?.mode || 'sandbox'}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-background px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
                      required
                    >
                      <option value="sandbox">Sandbox (Testing)</option>
                      <option value="live">Live (Production)</option>
                    </select>
                  </div>
                  
                  <Button type="submit" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    {paypalGateway ? 'Update PayPal' : 'Connect PayPal'}
                  </Button>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg font-semibold">Security Settings</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-gray-900">Password</div>
                      <div className="text-sm text-gray-600">Last updated: Never</div>
                    </div>
                    <Button variant="outline" className="border-gray-300 hover:bg-gray-100">Change Password</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-gray-900">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-600">Add an extra layer of security</div>
                    </div>
                    <Button variant="outline" className="border-gray-300 hover:bg-gray-100">Enable 2FA</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-gray-900">Active Sessions</div>
                      <div className="text-sm text-gray-600">Manage your active login sessions</div>
                    </div>
                    <Button variant="outline" className="border-gray-300 hover:bg-gray-100">View Sessions</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="text-lg font-semibold">Notification Preferences</CardTitle>
                <CardDescription className="text-gray-600">
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-gray-900">Order Notifications</div>
                      <div className="text-sm text-gray-600">Get notified when you receive new orders</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-gray-900">Payment Notifications</div>
                      <div className="text-sm text-gray-600">Get notified about payment updates</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-gray-900">Affiliate Notifications</div>
                      <div className="text-sm text-gray-600">Get notified about affiliate activities</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-gray-900">Marketing Emails</div>
                      <div className="text-sm text-gray-600">Receive updates about new features and tips</div>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    <Save className="w-4 h-4 mr-2" />
                    Save Notification Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
