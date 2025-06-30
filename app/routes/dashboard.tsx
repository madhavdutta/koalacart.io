import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

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
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <span className="text-4xl">🐨</span>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to KoalaCart!</CardTitle>
            <CardDescription>
              Let's set up your account. What would you like to do?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-3">
                  Choose your account type
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      className="mr-3"
                      required
                    />
                    <div>
                      <div className="font-medium">Seller</div>
                      <div className="text-sm text-gray-600">Create and sell products</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="role"
                      value="affiliate"
                      className="mr-3"
                      required
                    />
                    <div>
                      <div className="font-medium">Affiliate</div>
                      <div className="text-sm text-gray-600">Promote products and earn commissions</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="role"
                      value="buyer"
                      className="mr-3"
                      required
                    />
                    <div>
                      <div className="font-medium">Buyer</div>
                      <div className="text-sm text-gray-600">Purchase products</div>
                    </div>
                  </label>
                </div>
              </div>
              
              {actionData?.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="text-red-800 text-sm font-medium">{actionData.error}</div>
                </div>
              )}
              
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                {isSubmitting ? 'Setting up...' : 'Continue'}
              </Button>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.user_metadata?.full_name || user.email}! 🐨
          </h1>
          <p className="text-gray-600 mt-2">Role: {profile?.role}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
          
          {profile?.role === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>Manage your products</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Manage Products
                </Button>
              </CardContent>
            </Card>
          )}
          
          {profile?.role === 'affiliate' && (
            <Card>
              <CardHeader>
                <CardTitle>Affiliate Links</CardTitle>
                <CardDescription>Track your performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  View Links
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
