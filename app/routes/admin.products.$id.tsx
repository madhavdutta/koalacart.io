import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { requireAuth } from "~/lib/auth.server";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, Edit, Package, ExternalLink, Eye, ShoppingCart } from "lucide-react";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.product?.name || 'Product'} - KoalaCart Admin` },
    { name: "description", content: "View product details" },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.originalRole !== 'admin' && profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  const { supabase } = createSupabaseServerClient(request);
  
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        name
      )
    `)
    .eq('id', params.id!)
    .eq('admin_id', profile.id)
    .single();
  
  if (error || !product) {
    throw new Response("Product not found", { status: 404 });
  }
  
  return json({ user, profile, product });
}

export default function ProductView() {
  const { user, profile, product } = useLoaderData<typeof loader>();
  
  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/admin/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600 mt-1">Product Details</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to={`/checkout/${product.id}`} target="_blank">
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                <Eye className="w-4 h-4 mr-2" />
                View Checkout
              </Button>
            </Link>
            <Link to={`/products/${product.id}`} target="_blank">
              <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                <ShoppingCart className="w-4 h-4 mr-2" />
                View Product Page
              </Button>
            </Link>
            <Link to={`/admin/products/${product.id}/edit`}>
              <Button className="bg-green-600 hover:bg-green-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Testing Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">Testing Your Product</p>
                <p className="text-sm text-blue-700">
                  Use the buttons above to test your product page and checkout flow. 
                  Switch to different user roles in your dashboard to test different experiences.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{product.name}</p>
                </div>
                
                {product.short_description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Short Description</label>
                    <p className="text-gray-900">{product.short_description}</p>
                  </div>
                )}
                
                {product.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{product.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Product Type</label>
                    <p className="text-gray-900 capitalize">{product.product_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Pricing Type</label>
                    <p className="text-gray-900 capitalize">{product.pricing_type.replace('_', ' ')}</p>
                  </div>
                </div>
                
                {product.categories && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <p className="text-gray-900">{product.categories.name}</p>
                  </div>
                )}
                
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {product.download_url && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Download URL</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-900 truncate flex-1">{product.download_url}</p>
                      <a href={product.download_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Base Price</label>
                  <p className="text-2xl font-bold text-green-600">${product.base_price}</p>
                </div>
                
                {product.sale_price && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Sale Price</label>
                    <p className="text-2xl font-bold text-red-600">${product.sale_price}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Currency</label>
                  <p className="text-gray-900">{product.currency}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Active</span>
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? "Yes" : "No"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                  <Badge variant={product.featured ? "default" : "secondary"}>
                    {product.featured ? "Yes" : "No"}
                  </Badge>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="text-gray-900 text-sm">
                    {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-gray-900 text-sm">
                    {new Date(product.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
