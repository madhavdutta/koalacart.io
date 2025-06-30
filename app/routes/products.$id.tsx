import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { formatCurrency } from "~/lib/utils";
import { ArrowLeft, ShoppingCart, Download, Package, Clock, User } from "lucide-react";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.product) {
    return [
      { title: "Product Not Found - KoalaCart" },
      { name: "description", content: "The product you're looking for doesn't exist." },
    ];
  }
  
  return [
    { title: `${data.product.name} - KoalaCart` },
    { name: "description", content: data.product.description || `Buy ${data.product.name} on KoalaCart` },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { supabase } = createSupabaseServerClient();
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
  
  return json({ product });
}

export default function ProductDetail() {
  const { product } = useLoaderData<typeof loader>();
  
  const handlePurchase = () => {
    // This will be implemented with Stripe checkout
    alert('Checkout functionality will be implemented with Stripe integration');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/products" className="inline-flex items-center text-emerald-600 hover:text-emerald-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <Package className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div>
            <div className="flex gap-2 mb-4">
              <Badge variant="secondary">
                {product.product_type}
              </Badge>
              <Badge variant="outline">
                {product.pricing_type.replace('_', ' ')}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="text-4xl font-bold text-emerald-600 mb-6">
              {formatCurrency(product.base_price)}
            </div>
            
            <div className="prose max-w-none mb-8">
              <p className="text-gray-700 text-lg leading-relaxed">
                {product.description || 'No description available.'}
              </p>
            </div>
            
            {/* Product Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center text-gray-600">
                {product.product_type === 'digital' ? (
                  <Download className="h-5 w-5 mr-3" />
                ) : (
                  <Package className="h-5 w-5 mr-3" />
                )}
                <span>
                  {product.product_type === 'digital' 
                    ? 'Instant digital download' 
                    : 'Physical product shipping'
                  }
                </span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-3" />
                <span>
                  {product.pricing_type === 'one_time' && 'One-time payment'}
                  {product.pricing_type === 'subscription' && 'Recurring subscription'}
                  {product.pricing_type === 'trial' && 'Free trial available'}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <User className="h-5 w-5 mr-3" />
                <span>Sold by {product.profiles?.full_name || 'Seller'}</span>
              </div>
            </div>
            
            {/* Purchase Button */}
            <Card className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  Ready to purchase?
                </div>
                <p className="text-gray-600 mb-6">
                  Secure checkout powered by Stripe
                </p>
                <Button 
                  onClick={handlePurchase}
                  size="lg" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Buy Now - {formatCurrency(product.base_price)}
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  30-day money-back guarantee
                </p>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Product Type</h4>
                  <p className="text-gray-600 capitalize">{product.product_type}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Pricing Model</h4>
                  <p className="text-gray-600 capitalize">{product.pricing_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Currency</h4>
                  <p className="text-gray-600">{product.currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
