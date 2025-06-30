import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { formatCurrency } from "~/lib/utils";
import { ShoppingCart, Users, TrendingUp, CreditCard, Shield, Zap } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "KoalaCart - Your Own Online Selling Platform" },
    { name: "description", content: "Create, sell, and manage your digital products with your own payment gateway. Complete control, maximum profits." },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);
  
  // Get featured products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .limit(6);
  
  return json({ products: products || [] });
}

export default function Index() {
  const { products } = useLoaderData<typeof loader>();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="text-6xl">🐨</div>
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Your Products, Your Payment Gateway, Your Success
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Connect your own Stripe account to KoalaCart and keep 100% control over your payments. No middleman, no hidden fees, just pure profit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
                Start Selling Today
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose KoalaCart?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Unlike other platforms, you connect your own payment gateway and keep complete control over your business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <CreditCard className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                <CardTitle>Your Own Stripe Account</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect your own Stripe account. You control the payments, fees, and have direct access to your funds.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>100% Profit Control</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  No platform fees on transactions. You only pay Stripe's standard rates directly to them.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <ShoppingCart className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Easy Product Creation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create digital and physical products with custom pricing, descriptions, and branded checkout pages.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Affiliate Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Build a network of affiliates to promote your products and track their performance with built-in analytics.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get detailed insights into your sales, affiliate performance, and customer behavior with comprehensive reports.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Zap className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle>Lightning Fast Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get started in minutes. Connect your Stripe account, create your first product, and start selling immediately.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How KoalaCart Works</h2>
            <p className="text-gray-600">Simple steps to start selling with your own payment gateway</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Your Stripe</h3>
              <p className="text-gray-600">
                Link your existing Stripe account or create a new one. You maintain full control over your payment processing.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Products</h3>
              <p className="text-gray-600">
                Add your digital or physical products with custom pricing, descriptions, and beautiful checkout pages.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Selling</h3>
              <p className="text-gray-600">
                Share your product links, manage affiliates, and watch your sales grow while keeping 100% control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
              <p className="text-gray-600">Discover amazing products from our sellers</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {product.image_url && (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(product.base_price)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {product.description}
                    </p>
                    <Link to={`/products/${product.id}`}>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">View Product</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link to="/products">
                <Button variant="outline" size="lg" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="text-4xl">🐨</div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Sales?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join entrepreneurs who choose KoalaCart for complete payment control and maximum profits.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
