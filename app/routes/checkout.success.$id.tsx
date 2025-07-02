import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatCurrency } from "~/lib/utils";
import { CheckCircle, Download, Package, ArrowRight } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Purchase Successful - KoalaCart" },
    { name: "description", content: "Your purchase has been completed successfully." },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { supabase } = createSupabaseServerClient();
  const orderId = params.id;
  
  if (!orderId) {
    throw new Response("Order ID is required", { status: 400 });
  }
  
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, products(*)')
    .eq('id', orderId)
    .single();
  
  if (error || !order) {
    throw new Response("Order not found", { status: 404 });
  }
  
  return json({ order });
}

export default function CheckoutSuccess() {
  const { order } = useLoaderData<typeof loader>();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Purchase Successful!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-sm">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span>{order.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span>{order.customer_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span>{order.products.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(order.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="capitalize text-green-600 font-semibold">
                  {order.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {order.products.product_type === 'digital' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Download Your Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Your digital product is ready for download. Click the button below to access your files.
              </p>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Download className="h-4 w-4 mr-2" />
                Download Now
              </Button>
            </CardContent>
          </Card>
        )}
        
        {order.products.product_type === 'physical' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your physical product will be shipped to the address provided during checkout. 
                You will receive a tracking number via email once your order ships.
              </p>
            </CardContent>
          </Card>
        )}
        
        <div className="text-center">
          <Link to="/products">
            <Button variant="outline" className="mr-4">
              Continue Shopping
            </Button>
          </Link>
          <Link to="/">
            <Button>
              Go to Homepage
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
