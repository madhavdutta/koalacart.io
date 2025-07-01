import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { requireAuth } from "~/lib/auth.server";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Plus, Edit, Eye, Trash2, Package } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Products - KoalaCart Admin" },
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
    .select(`
      *,
      categories (
        name
      )
    `)
    .eq('admin_id', profile.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching products:', error);
  }
  
  return json({ user, profile, products: products || [] });
}

export default function ProductsIndex() {
  const { user, profile, products } = useLoaderData<typeof loader>();
  
  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-2">Manage your product catalog</p>
          </div>
          <Link to="/admin/products/new">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500 text-center mb-6">
                Get started by creating your first product
              </p>
              <Link to="/admin/products/new">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {product.featured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Featured
                      </Badge>
                    )}
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                    {product.categories && (
                      <Badge variant="outline" className="text-xs">
                        {product.categories.name}
                      </Badge>
                    )}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.short_description || product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-green-600">
                          ${product.base_price}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {product.product_type} • {product.pricing_type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link to={`/admin/products/${product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link to={`/admin/products/${product.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
