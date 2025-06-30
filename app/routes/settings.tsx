import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { User, CreditCard, Shield, Bell } from "lucide-react";

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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
        
        {/* Success/Error Messages */}
        {actionData?.success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4">
            <div className="text-emerald-800 font-medium">{actionData.success}</div>
          </div>
        )}
        
        {actionData?.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800 font-medium">{actionData.error}</div>
          </div>
        )}
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and business details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form method="post" className="space-y-6">
                  <input type="hidden" name="intent" value="update-profile" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        defaultValue={profile.full_name || ''}
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={profile.phone || ''}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        defaultValue={profile.company || ''}
                        placeholder="Enter your company name"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        defaultValue={profile.website || ''}
                        placeholder="https://your-website.com"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={isSubmitting}
                    >
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
            <Card>
              <CardHeader>
                <CardTitle>Connected Payment Gateways</CardTitle>
                <CardDescription>
                  Manage your payment processing accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentGateways.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No payment gateways connected yet. Add one below to start accepting payments.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {paymentGateways.map((gateway) => (
                      <div key={gateway.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            {gateway.gateway_type === 'stripe' ? '💳' : '🅿️'}
                          </div>
                          <div>
                            <div className="font-medium capitalize">{gateway.gateway_type}</div>
                            <div className="text-sm text-gray-500">
                              {gateway.gateway_type === 'stripe' 
                                ? `Key: ${gateway.publishable_key?.substring(0, 20)}...`
                                : `Client ID: ${gateway.client_id?.substring(0, 20)}...`
                              }
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={gateway.is_active ? "default" : "secondary"}>
                            {gateway.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Form method="post" className="inline">
                            <input type="hidden" name="intent" value="toggle-gateway" />
                            <input type="hidden" name="gatewayId" value={gateway.id} />
                            <input type="hidden" name="isActive" value={gateway.is_active.toString()} />
                            <Button variant="outline" size="sm" type="submit">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💳 Stripe Configuration
                </CardTitle>
                <CardDescription>
                  Connect your Stripe account to accept credit card payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form method="post" className="space-y-4">
                  <input type="hidden" name="intent" value="add-stripe" />
                  
                  <div className="space-y-2">
                    <Label htmlFor="stripePublishableKey">Publishable Key</Label>
                    <Input
                      id="stripePublishableKey"
                      name="stripePublishableKey"
                      defaultValue={stripeGateway?.publishable_key || ''}
                      placeholder="pk_test_..."
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stripeSecretKey">Secret Key</Label>
                    <Input
                      id="stripeSecretKey"
                      name="stripeSecretKey"
                      type="password"
                      defaultValue={stripeGateway?.secret_key || ''}
                      placeholder="sk_test_..."
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stripeWebhookSecret">Webhook Secret (Optional)</Label>
                    <Input
                      id="stripeWebhookSecret"
                      name="stripeWebhookSecret"
                      type="password"
                      defaultValue={stripeGateway?.webhook_secret || ''}
                      placeholder="whsec_..."
                    />
                  </div>
                  
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    {stripeGateway ? 'Update Stripe' : 'Connect Stripe'}
                  </Button>
                </Form>
              </CardContent>
            </Card>
            
            {/* Add PayPal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🅿️ PayPal Configuration
                </CardTitle>
                <CardDescription>
                  Connect your PayPal account to accept PayPal payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form method="post" className="space-y-4">
                  <input type="hidden" name="intent" value="add-paypal" />
                  
                  <div className="space-y-2">
                    <Label htmlFor="paypalClientId">Client ID</Label>
                    <Input
                      id="paypalClientId"
                      name="paypalClientId"
                      defaultValue={paypalGateway?.client_id || ''}
                      placeholder="Your PayPal Client ID"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paypalClientSecret">Client Secret</Label>
                    <Input
                      id="paypalClientSecret"
                      name="paypalClientSecret"
                      type="password"
                      defaultValue={paypalGateway?.client_secret || ''}
                      placeholder="Your PayPal Client Secret"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paypalMode">Mode</Label>
                    <select
                      id="paypalMode"
                      name="paypalMode"
                      defaultValue={paypalGateway?.mode || 'sandbox'}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="sandbox">Sandbox (Testing)</option>
                      <option value="live">Live (Production)</option>
                    </select>
                  </div>
                  
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    {paypalGateway ? 'Update PayPal' : 'Connect PayPal'}
                  </Button>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Password</div>
                      <div className="text-sm text-gray-500">Last updated: Never</div>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-500">Add an extra layer of security</div>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Active Sessions</div>
                      <div className="text-sm text-gray-500">Manage your active login sessions</div>
                    </div>
                    <Button variant="outline">View Sessions</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Order Notifications</div>
                      <div className="text-sm text-gray-500">Get notified when you receive new orders</div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Payment Notifications</div>
                      <div className="text-sm text-gray-500">Get notified about payment updates</div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Affiliate Notifications</div>
                      <div className="text-sm text-gray-500">Get notified about affiliate activities</div>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Marketing Emails</div>
                      <div className="text-sm text-gray-500">Receive updates about new features and tips</div>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
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
