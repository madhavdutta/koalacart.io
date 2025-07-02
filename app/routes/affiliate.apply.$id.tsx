import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { getOptionalAuth } from "~/lib/auth.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { formatCurrency } from "~/lib/utils";
import { Users, DollarSign, TrendingUp, ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "@remix-run/react";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.product) {
    return [
      { title: "Affiliate Application - Product Not Found - KoalaCart" },
    ];
  }
  
  return [
    { title: `Become an Affiliate - ${data.product.name} - KoalaCart` },
    { name: "description", content: `Apply to promote ${data.product.name} and earn commissions` },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);
  const { user, profile } = await getOptionalAuth(request);
  const productId = params.id;
  
  if (!productId) {
    throw new Response("Product ID is required", { status: 400 });
  }
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*, profiles(full_name, email)')
    .eq('id', productId)
    .eq('is_active', true)
    .single();
  
  if (error || !product) {
    throw new Response("Product not found", { status: 404 });
  }
  
  // Check if user is already an affiliate for this product
  let existingAffiliate = null;
  if (user && profile) {
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('*, affiliate_links(*)')
      .eq('profile_id', profile.id)
      .eq('admin_id', product.admin_id)
      .single();
    
    if (affiliate) {
      existingAffiliate = affiliate;
    }
  }
  
  return json({ product, user, profile, existingAffiliate });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);
  const { user, profile } = await getOptionalAuth(request);
  const formData = await request.formData();
  const productId = params.id;
  
  if (!user || !profile) {
    return json({ error: 'You must be logged in to apply as an affiliate' }, { status: 401 });
  }
  
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const website = formData.get('website') as string;
  const experience = formData.get('experience') as string;
  const motivation = formData.get('motivation') as string;
  
  if (!name || !email || !experience || !motivation) {
    return json({ error: 'Please fill in all required fields' }, { status: 400 });
  }
  
  // Get product details
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();
  
  if (!product) {
    return json({ error: 'Product not found' }, { status: 404 });
  }
  
  // Check if already an affiliate
  const { data: existingAffiliate } = await supabase
    .from('affiliates')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('admin_id', product.admin_id)
    .single();
  
  if (existingAffiliate) {
    return json({ error: 'You are already an affiliate for this seller' }, { status: 400 });
  }
  
  // Create affiliate record
  const { data: affiliate, error: affiliateError } = await supabase
    .from('affiliates')
    .insert({
      profile_id: profile.id,
      admin_id: product.admin_id,
      commission_rate: 0.15, // 15% default commission
      notes: `Application: Website: ${website || 'N/A'}, Experience: ${experience}, Motivation: ${motivation}`,
      is_active: true
    })
    .select()
    .single();
  
  if (affiliateError) {
    return json({ error: 'Failed to create affiliate account' }, { status: 500 });
  }
  
  // Generate unique tracking code
  const trackingCode = `${profile.id.slice(0, 8)}-${productId.slice(0, 8)}-${Date.now().toString(36)}`;
  
  // Create affiliate link
  const { error: linkError } = await supabase
    .from('affiliate_links')
    .insert({
      affiliate_id: affiliate.id,
      product_id: productId,
      tracking_code: trackingCode
    });
  
  if (linkError) {
    return json({ error: 'Failed to create affiliate link' }, { status: 500 });
  }
  
  return redirect(`/affiliate/dashboard`);
}

export default function AffiliateApplication() {
  const { product, user, profile, existingAffiliate } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  // Calculate potential earnings (example)
  const estimatedCommission = product.base_price * 0.15; // 15% commission
  
  if (existingAffiliate) {
    const affiliateLink = existingAffiliate.affiliate_links?.[0];
    const affiliateUrl = affiliateLink 
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/products/${product.id}?ref=${affiliateLink.tracking_code}`
      : '';
    
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link to={`/products/${product.id}`} className="inline-flex items-center text-emerald-600 hover:text-emerald-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Product
            </Link>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <Users className="h-6 w-6 mr-2" />
                You're Already an Affiliate!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-gray-600">
                  You're already promoting products from this seller. Here's your affiliate information:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800">Commission Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {(existingAffiliate.commission_rate * 100).toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">Total Earnings</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(existingAffiliate.total_earnings)}
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-purple-800">Total Sales</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {existingAffiliate.total_sales}
                    </div>
                  </div>
                </div>
                
                {affiliateUrl && (
                  <div>
                    <Label htmlFor="affiliate-url">Your Affiliate Link for this Product</Label>
                    <div className="flex mt-2">
                      <Input
                        id="affiliate-url"
                        value={affiliateUrl}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="ml-2"
                        onClick={() => navigator.clipboard.writeText(affiliateUrl)}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <Link to="/affiliate/dashboard">
                    <Button>
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link to={affiliateUrl} target="_blank">
                    <Button variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Test Your Link
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to={`/products/${product.id}`} className="inline-flex items-center text-emerald-600 hover:text-emerald-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Product
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Info & Benefits */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Promote This Product</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">{product.product_type}</Badge>
                        <Badge variant="outline">{product.pricing_type.replace('_', ' ')}</Badge>
                      </div>
                      <div className="text-2xl font-bold text-emerald-600 mt-2">
                        {formatCurrency(product.base_price)}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600">
                    {product.description || 'No description available.'}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Earning Potential
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(estimatedCommission)}
                      </div>
                      <p className="text-green-800 font-medium">Per Sale Commission</p>
                      <p className="text-sm text-green-600">15% commission rate</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(estimatedCommission * 10)}
                      </div>
                      <p className="text-sm text-gray-600">10 sales/month</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(estimatedCommission * 50)}
                      </div>
                      <p className="text-sm text-gray-600">50 sales/month</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Application Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Affiliate Application
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Login Required
                    </h3>
                    <p className="text-gray-600 mb-6">
                      You need to be logged in to apply as an affiliate.
                    </p>
                    <div className="space-x-4">
                      <Link to="/login">
                        <Button>Login</Button>
                      </Link>
                      <Link to="/register">
                        <Button variant="outline">Sign Up</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Form method="post" className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          defaultValue={profile?.full_name || ''}
                          placeholder="Enter your full name"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          defaultValue={profile?.email || ''}
                          placeholder="Enter your email address"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="website">Website/Social Media (Optional)</Label>
                        <Input
                          id="website"
                          name="website"
                          type="url"
                          placeholder="https://yourwebsite.com or social media profile"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="experience">Marketing Experience</Label>
                        <Textarea
                          id="experience"
                          name="experience"
                          required
                          placeholder="Describe your experience with affiliate marketing, social media, or promoting products..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="motivation">Why do you want to promote this product?</Label>
                        <Textarea
                          id="motivation"
                          name="motivation"
                          required
                          placeholder="Tell us why you're interested in promoting this product and how you plan to market it..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    {actionData?.error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 text-sm">{actionData.error}</p>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Submitting Application..."
                      ) : (
                        <>
                          <Users className="h-5 w-5 mr-2" />
                          Apply to Become an Affiliate
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      By applying, you agree to our Affiliate Terms and Conditions.
                      Applications are typically reviewed within 24-48 hours.
                    </p>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
