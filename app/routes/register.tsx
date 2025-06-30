import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export const meta: MetaFunction = () => {
  return [
    { title: "Register - KoalaCart" },
    { name: "description", content: "Create your account" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    return redirect('/dashboard');
  }
  
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, response } = createSupabaseServerClient(request);
  const formData = await request.formData();
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  
  if (!email || !password || !fullName) {
    return json({ error: 'All fields are required' }, { status: 400 });
  }
  
  try {
    // Sign up the user with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });
    
    if (authError) {
      console.error('Auth error:', authError);
      return json({ error: authError.message }, { status: 400 });
    }
    
    if (!authData.user) {
      return json({ error: 'Failed to create user account' }, { status: 400 });
    }
    
    console.log('User created successfully:', authData.user.id);
    console.log('Session created:', !!authData.session);
    
    // Check if we have a session (user is automatically signed in)
    if (authData.session) {
      // User is signed in, redirect to dashboard
      return redirect('/dashboard', {
        headers: response.headers,
      });
    } else {
      // No session (email confirmation might be required)
      return json({ 
        success: true,
        message: 'Account created successfully! Please check your email to confirm your account, then sign in.'
      });
    }
    
  } catch (error) {
    console.error('Unexpected error during registration:', error);
    return json({ 
      error: 'An unexpected error occurred during registration. Please try again.',
    }, { status: 500 });
  }
}

export default function Register() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  // Show success message if account was created but needs email confirmation
  if (actionData?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <span className="text-4xl">🐨</span>
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-600">Account Created!</CardTitle>
            <CardDescription>
              {actionData.message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Go to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <span className="text-4xl">🐨</span>
          </div>
          <CardTitle className="text-2xl font-bold">Join KoalaCart</CardTitle>
          <CardDescription>
            Create your account and start your journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                placeholder="Enter your full name"
              />
            </div>
            
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
                autoComplete="new-password"
                required
                placeholder="Enter your password"
                minLength={6}
              />
            </div>
            
            {actionData?.error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="text-red-800 text-sm font-medium">{actionData.error}</div>
              </div>
            )}
            
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
