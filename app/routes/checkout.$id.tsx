import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { formatCurrency } from "~/lib/utils";
import { ShoppingCart, CreditCard, Shield, ArrowLeft } from "lucide-react";
import { Link } from "@remix-run/react";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.product) {
    return [
      { title: "Checkout - Product Not Found - KoalaCart" },
    ];
  }
  
  return [
    { title: `Checkout - ${data.product.name} - KoalaCart` },
    { name: "description", content: `Complete your purchase of ${data.product.name}` },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);
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
  
  // Check for affiliate tracking
  const url = new URL(request.url);
  const affiliateCode = url.searchParams.get('ref');
  let affiliate = null;
  
  if (affiliateCode) {
    const { data: affiliateLink } = await supabase
      .from('affiliate_links')
      .select('*, affiliates(*, profiles!affiliates_profile_id_fkey(full_name))')
      .eq('tracking_code', affiliateCode)
      .eq('product_id', productId)
      .single();
    
    if (affiliateLink) {
      affiliate = affiliateLink;
      // Track the click
      await supabase
        .from('affiliate_links')
        .update({ clicks: affiliateLink.clicks + 1 })
        .eq('id', affiliateLink.id);
    }
  }
  
  return json({ product, affiliate });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);
  const formData = await request.formData();
  const productId = params.id;
  
  const customerEmail = formData.get('email') as string;
  const customerName = formData.get('name') as string;
  const affiliateId = formData.get('affiliateId') as string;
  
  if (!customerEmail || !customerName || !productId) {
    return json({ error: 'Missing required fields' }, { status: 400 });
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
  
  // Create order
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_email: customerEmail,
      customer_name: customerName,
      product_id: productId,
      affiliate_id: affiliateId || null,
      amount: product.base_price,
      currency: product.currency,
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) {
    return json({ error: 'Failed to create order' }, { status: 500 });
  }
  
  // Redirect to payment page instead of simulating payment
  return redirect(`/payment/${order.id}`);
}

export default function Checkout() {
  const { product, affiliate } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
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
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Order Summary
                </CardTitle>
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
                        <ShoppingCart className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">{product.product_type}</Badge>
                        <Badge variant="outline">{product.pricing_type.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Sold by {product.profiles?.full_name || 'Seller'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(product.base_price)}
                      </div>
                    </div>
                  </div>
                  
                  {affiliate && (
                    <div className="border-t pt-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Referred by:</strong> {affiliate.affiliates.profiles.full_name}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          This purchase will earn them a commission
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(product.base_price)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Checkout Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form method="post" className="space-y-6">
                  {affiliate && (
                    <input type="hidden" name="affiliateId" value={affiliate.affiliate_id} />
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
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
                        placeholder="Enter your email address"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  {actionData?.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">{actionData.error}</p>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="h-4 w-4 mr-2" />
                      <span>Secure checkout powered by Stripe</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Processing..."
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Continue to Payment - {formatCurrency(product.base_price)}
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                    30-day money-back guarantee.
                  </p>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
