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
import { CreditCard, Shield, ArrowLeft, Lock, CheckCircle } from "lucide-react";
import { Link } from "@remix-run/react";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.order) {
    return [
      { title: "Payment - Order Not Found - KoalaCart" },
    ];
  }
  
  return [
    { title: `Payment - ${data.order.products?.name} - KoalaCart` },
    { name: "description", content: `Complete payment for ${data.order.products?.name}` },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);
  const orderId = params.id;
  
  if (!orderId) {
    throw new Response("Order ID is required", { status: 400 });
  }
  
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      products(*, profiles(full_name, email)),
      affiliates(*, profiles!affiliates_profile_id_fkey(full_name))
    `)
    .eq('id', orderId)
    .eq('status', 'pending')
    .single();
  
  if (error || !order) {
    throw new Response("Order not found or already processed", { status: 404 });
  }
  
  return json({ order });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);
  const formData = await request.formData();
  const orderId = params.id;
  
  const cardNumber = formData.get('cardNumber') as string;
  const expiryDate = formData.get('expiryDate') as string;
  const cvv = formData.get('cvv') as string;
  const cardholderName = formData.get('cardholderName') as string;
  
  if (!cardNumber || !expiryDate || !cvv || !cardholderName || !orderId) {
    return json({ error: 'Missing required payment information' }, { status: 400 });
  }
  
  // Get order details
  const { data: order } = await supabase
    .from('orders')
    .select('*, products(*), affiliates(*)')
    .eq('id', orderId)
    .single();
  
  if (!order) {
    return json({ error: 'Order not found' }, { status: 404 });
  }
  
  // Simulate payment processing (in real app, integrate with Stripe)
  const isPaymentSuccessful = Math.random() > 0.1; // 90% success rate for demo
  
  if (!isPaymentSuccessful) {
    return json({ error: 'Payment failed. Please try again.' }, { status: 400 });
  }
  
  // Update order status
  await supabase
    .from('orders')
    .update({ 
      status: 'paid',
      stripe_payment_intent_id: `pi_demo_${Date.now()}` // Demo payment intent
    })
    .eq('id', orderId);
  
  // Update affiliate stats if applicable
  if (order.affiliate_id) {
    const commission = order.amount * (order.affiliates?.commission_rate || 0.15);
    
    await supabase
      .from('affiliates')
      .update({
        total_earnings: (order.affiliates?.total_earnings || 0) + commission,
        total_sales: (order.affiliates?.total_sales || 0) + 1
      })
      .eq('id', order.affiliate_id);
    
    // Update affiliate link conversions
    await supabase
      .from('affiliate_links')
      .update({
        conversions: supabase.raw('conversions + 1')
      })
      .eq('affiliate_id', order.affiliate_id)
      .eq('product_id', order.product_id);
  }
  
  return redirect(`/checkout/success/${orderId}`);
}

export default function Payment() {
  const { order } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to={`/checkout/${order.product_id}`} className="inline-flex items-center text-emerald-600 hover:text-emerald-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Checkout
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    {order.products?.image_url ? (
                      <img 
                        src={order.products.image_url} 
                        alt={order.products.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{order.products?.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">{order.products?.product_type}</Badge>
                        <Badge variant="outline">{order.products?.pricing_type?.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Sold by {order.products?.profiles?.full_name || 'Seller'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(order.amount)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Customer:</span>
                        <span className="font-medium">{order.customer_name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Email:</span>
                        <span className="font-medium">{order.customer_email}</span>
                      </div>
                      {order.affiliates && (
                        <div className="flex justify-between text-sm">
                          <span>Referred by:</span>
                          <span className="font-medium text-blue-600">
                            {order.affiliates.profiles?.full_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount</span>
                      <span className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(order.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form method="post" className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardholderName">Cardholder Name</Label>
                      <Input
                        id="cardholderName"
                        name="cardholderName"
                        type="text"
                        required
                        placeholder="John Doe"
                        className="mt-1"
                        defaultValue={order.customer_name || ''}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        type="text"
                        required
                        placeholder="1234 5678 9012 3456"
                        className="mt-1"
                        maxLength={19}
                        onChange={(e) => {
                          // Format card number with spaces
                          let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                          value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                          e.target.value = value;
                        }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          type="text"
                          required
                          placeholder="MM/YY"
                          className="mt-1"
                          maxLength={5}
                          onChange={(e) => {
                            // Format expiry date
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length >= 2) {
                              value = value.substring(0, 2) + '/' + value.substring(2, 4);
                            }
                            e.target.value = value;
                          }}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          type="text"
                          required
                          placeholder="123"
                          className="mt-1"
                          maxLength={4}
                          onChange={(e) => {
                            // Only allow numbers
                            e.target.value = e.target.value.replace(/\D/g, '');
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {actionData?.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm">{actionData.error}</p>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Shield className="h-4 w-4 mr-2" />
                      <span>Your payment is secured with 256-bit SSL encryption</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Lock className="h-4 w-4 mr-2" />
                      <span>We never store your card details</span>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Processing Payment..."
                    ) : (
                      <>
                        <Lock className="h-5 w-5 mr-2" />
                        Pay {formatCurrency(order.amount)} Securely
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    By clicking "Pay Securely", you agree to our Terms of Service and Privacy Policy.
                    This is a demo payment system.
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
