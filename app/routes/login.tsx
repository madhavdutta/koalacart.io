import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { getProfile } from "~/lib/auth.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export const meta: MetaFunction = () => {
  return [
    { title: "Login - KoalaCart" },
    { name: "description", content: "Sign in to your account" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // Get user profile to determine redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
    
    if (profile?.role === 'admin') {
      return redirect('/admin/dashboard');
    } else if (profile?.role === 'affiliate') {
      return redirect('/affiliate/dashboard');
    } else {
      return redirect('/dashboard');
    }
  }
  
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, response } = createSupabaseServerClient(request);
  const formData = await request.formData();
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  if (!email || !password) {
    return json({ error: 'Email and password are required' }, { status: 400 });
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Login error:', error);
      return json({ error: error.message }, { status: 400 });
    }
    
    if (!data.user || !data.session) {
      return json({ error: 'Login failed - no session created' }, { status: 400 });
    }
    
    console.log('User logged in successfully:', data.user.id);
    
    // Get user profile to determine redirect
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', data.user.id)
      .single();
    
    if (profileError) {
      console.log('No profile found, redirecting to dashboard for setup:', profileError);
      // No profile exists, redirect to dashboard for setup
      return redirect('/dashboard', {
        headers: response.headers,
      });
    }
    
    // Redirect based on role
    let redirectTo = '/dashboard';
    if (profile?.role === 'admin') {
      redirectTo = '/admin/dashboard';
    } else if (profile?.role === 'affiliate') {
      redirectTo = '/affiliate/dashboard';
    }
    
    return redirect(redirectTo, {
      headers: response.headers,
    });
    
  } catch (error) {
    console.error('Unexpected login error:', error);
    return json({ 
      error: 'An unexpected error occurred during login. Please try again.',
    }, { status: 500 });
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <span className="text-4xl">🐨</span>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your KoalaCart account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
              />
            </div>
            
            {actionData?.error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="text-red-800 text-sm">{actionData.error}</div>
              </div>
            )}
            
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-500">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
