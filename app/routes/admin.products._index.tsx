import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { requireAuth } from "~/lib/auth.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { formatCurrency } from "~/lib/utils";
import { Plus, Package, Edit, Eye, MoreHorizontal } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "My Products - KoalaCart" },
    { name: "description", content: "Manage your products" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  const { supabase } = createSupabaseServerClient(request);
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('admin_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching products:', error);
  }
  
  return json({ products: products || [] });
}

export default function AdminProducts() {
  const { products } = useLoaderData<typeof loader>();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
            <p className="text-gray-600 mt-2">Create and manage your products</p>
          </div>
          <Link to="/admin/products/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Product
            </Button>
          </Link>
        </div>
        
        {products.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No products yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first product to start selling on KoalaCart
              </p>
              <Link to="/admin/products/new">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                      <CardDescription className="text-2xl font-bold text-emerald-600 mt-1">
                        {formatCurrency(product.base_price)}
                      </CardDescription>
                    </div>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="capitalize">{product.product_type}</span>
                    <span className="capitalize">{product.pricing_type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Link to={`/admin/products/${product.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link to={`/products/${product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
