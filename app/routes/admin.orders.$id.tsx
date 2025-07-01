import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link, Form, useActionData, useNavigation } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { requireAuth } from "~/lib/auth.server";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, Edit, Package, User, CreditCard, MapPin } from "lucide-react";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `Order ${data?.order?.order_number || ''} - KoalaCart Admin` },
    { name: "description", content: "View order details" },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  const { supabase } = createSupabaseServerClient(request);
  
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      products (
        name,
        admin_id,
        image_url
      )
    `)
    .eq('id', params.id!)
    .single();
  
  if (error || !order || order.products?.admin_id !== profile.id) {
    throw new Response("Order not found", { status: 404 });
  }
  
  return json({ user, profile, order });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  const { supabase } = createSupabaseServerClient(request);
  const formData = await request.formData();
  const status = formData.get('status') as string;
  const payment_status = formData.get('payment_status') as string;
  const fulfillment_status = formData.get('fulfillment_status') as string;
  const notes = formData.get('notes') as string;
  
  const { error } = await supabase
    .from('orders')
    .update({
      status,
      payment_status,
      fulfillment_status,
      notes
    })
    .eq('id', params.id!);
  
  if (error) {
    return json({ error: error.message }, { status: 400 });
  }
  
  return json({ success: true });
}

export default function OrderView() {
  const { user, profile, order } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'fulfilled': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/admin/orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.order_number}</h1>
              <p className="text-gray-600 mt-1">Order Details</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {order.products?.image_url ? (
                      <img
                        src={order.products.image_url}
                        alt={order.products.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {order.products?.name || 'Product Deleted'}
                    </h3>
                    <p className="text-sm text-gray-500">Quantity: {order.quantity}</p>
                    <p className="text-sm text-gray-500">Unit Price: ${order.unit_price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${order.total_amount.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{order.customer_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{order.customer_email}</p>
                </div>
                {order.customer_phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{order.customer_phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Addresses */}
            {(order.billing_address || order.shipping_address) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {order.billing_address && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Billing Address</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{order.billing_address.line1}</p>
                          {order.billing_address.line2 && <p>{order.billing_address.line2}</p>}
                          <p>{order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}</p>
                          <p>{order.billing_address.country}</p>
                        </div>
                      </div>
                    )}
                    {order.shipping_address && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{order.shipping_address.line1}</p>
                          {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                          <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                          <p>{order.shipping_address.country}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Update Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Update Order</CardTitle>
                <CardDescription>Change order status and add notes</CardDescription>
              </CardHeader>
              <CardContent>
                <Form method="post" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        Order Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        defaultValue={order.status}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="payment_status" className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Status
                      </label>
                      <select
                        id="payment_status"
                        name="payment_status"
                        defaultValue={order.payment_status}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="fulfillment_status" className="block text-sm font-medium text-gray-700 mb-1">
                        Fulfillment Status
                      </label>
                      <select
                        id="fulfillment_status"
                        name="fulfillment_status"
                        defaultValue={order.fulfillment_status}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="fulfilled">Fulfilled</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      defaultValue={order.notes || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Add notes about this order..."
                    />
                  </div>
                  
                  {actionData?.error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="text-red-800 text-sm font-medium">{actionData.error}</div>
                    </div>
                  )}
                  
                  {actionData?.success && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <div className="text-green-800 text-sm font-medium">Order updated successfully</div>
                    </div>
                  )}
                  
                  <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update Order'}
                  </Button>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${order.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-4">
                  <span>Total</span>
                  <span>${order.total_amount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Order Status</span>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Payment Status</span>
                  <Badge className={getStatusColor(order.payment_status)}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Fulfillment Status</span>
                  <Badge className={getStatusColor(order.fulfillment_status)}>
                    {order.fulfillment_status.charAt(0).toUpperCase() + order.fulfillment_status.slice(1)}
                  </Badge>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Created</label>
                      <p className="text-sm text-gray-900">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Updated</label>
                      <p className="text-sm text-gray-900">
                        {new Date(order.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Currency</label>
                  <p className="text-gray-900">{order.currency}</p>
                </div>
                {order.stripe_payment_intent_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Payment Intent ID</label>
                    <p className="text-gray-900 font-mono text-xs break-all">
                      {order.stripe_payment_intent_id}
                    </p>
                  </div>
                )}
                {order.stripe_session_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Session ID</label>
                    <p className="text-gray-900 font-mono text-xs break-all">
                      {order.stripe_session_id}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
