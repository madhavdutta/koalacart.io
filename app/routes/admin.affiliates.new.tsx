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
import { Textarea } from "~/components/ui/textarea";
import { ArrowLeft, UserPlus, Mail, Percent, User } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Add Affiliate - KoalaCart Admin" },
    { name: "description", content: "Add a new affiliate partner" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  return json({ user, profile });
}

export async function action({ request }: ActionFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  const { supabase } = createSupabaseServerClient(request);
  const formData = await request.formData();
  
  const email = formData.get('email') as string;
  const fullName = formData.get('fullName') as string;
  const commissionRate = parseFloat(formData.get('commissionRate') as string);
  const notes = formData.get('notes') as string;
  
  try {
    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    let affiliateProfileId: string;
    
    if (existingProfile) {
      // User exists, check if already an affiliate
      const { data: existingAffiliate } = await supabase
        .from('affiliates')
        .select('*')
        .eq('profile_id', existingProfile.id)
        .eq('admin_id', profile.id)
        .single();
      
      if (existingAffiliate) {
        return json({ error: 'This user is already your affiliate' }, { status: 400 });
      }
      
      affiliateProfileId = existingProfile.id;
    } else {
      // Create new user profile (they'll need to sign up later)
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          email,
          full_name: fullName,
          role: 'affiliate',
          user_id: crypto.randomUUID() // Temporary until they sign up
        })
        .select()
        .single();
      
      if (profileError || !newProfile) {
        console.error('Profile creation error:', profileError);
        return json({ error: 'Failed to create affiliate profile' }, { status: 400 });
      }
      
      affiliateProfileId = newProfile.id;
    }
    
    // Create affiliate relationship
    const { error: affiliateError } = await supabase
      .from('affiliates')
      .insert({
        profile_id: affiliateProfileId,
        admin_id: profile.id,
        commission_rate: commissionRate,
        notes,
        is_active: true
      });
    
    if (affiliateError) {
      console.error('Affiliate creation error:', affiliateError);
      return json({ error: 'Failed to create affiliate relationship' }, { status: 400 });
    }
    
    // TODO: Send invitation email to affiliate
    
    return redirect('/admin/affiliates');
    
  } catch (error) {
    console.error('Add affiliate error:', error);
    return json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export default function AddAffiliate() {
  const { user, profile } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link to="/admin/affiliates">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Affiliates
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Affiliate</h1>
            <p className="text-gray-600 mt-2">Invite a new partner to your affiliate program</p>
          </div>
        </div>
        
        {/* Error Message */}
        {actionData?.error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-red-800 font-medium">{actionData.error}</div>
          </div>
        )}
        
        {/* Add Affiliate Form */}
        <Card className="border-0 shadow-lg max-w-2xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-green-600" />
              Affiliate Information
            </CardTitle>
            <CardDescription>
              Enter the details for your new affiliate partner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="affiliate@example.com"
                      className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="John Doe"
                      className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="commissionRate" className="text-sm font-medium text-gray-700">
                  Commission Rate (%) *
                </Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="commissionRate"
                    name="commissionRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="10.0"
                    className="pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <p className="text-xs text-gray-600">
                  The percentage commission this affiliate will earn on each sale
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Add any notes about this affiliate partner..."
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <Link to="/admin/affiliates">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isSubmitting}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Adding Affiliate...' : 'Add Affiliate'}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
        
        {/* Information Card */}
        <Card className="border-0 shadow-lg max-w-2xl bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• The affiliate will be added to your network</li>
                  <li>• They'll receive an invitation email to join your program</li>
                  <li>• Once they sign up, they can start promoting your products</li>
                  <li>• You can track their performance in the affiliates dashboard</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
