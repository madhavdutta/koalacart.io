import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { formatCurrency } from "~/lib/utils";
import { Search, Filter, ShoppingCart } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Products - KoalaCart" },
    { name: "description", content: "Browse all products on KoalaCart" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);
  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const type = url.searchParams.get('type') || '';
  
  let query = supabase
    .from('products')
    .select('*, profiles(full_name)')
    .eq('is_active', true);
  
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }
  
  if (type && type !== 'all') {
    query = query.eq('product_type', type);
  }
  
  const { data: products, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching products:', error);
  }
  
  return json({ 
    products: products || [],
    search,
    type
  });
}

export default function Products() {
  const { products, search, type } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchValue = formData.get('search') as string;
    
    const newParams = new URLSearchParams(searchParams);
    if (searchValue) {
      newParams.set('search', searchValue);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };
  
  const handleTypeFilter = (newType: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (newType && newType !== 'all') {
      newParams.set('type', newType);
    } else {
      newParams.delete('type');
    }
    setSearchParams(newParams);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-600 mt-2">Discover amazing products from our sellers</p>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  name="search"
                  placeholder="Search products..."
                  defaultValue={search}
                  className="pl-10"
                />
              </div>
            </form>
            
            <div className="flex gap-2">
              <Button
                variant={!type || type === 'all' ? 'default' : 'outline'}
                onClick={() => handleTypeFilter('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={type === 'digital' ? 'default' : 'outline'}
                onClick={() => handleTypeFilter('digital')}
                size="sm"
              >
                Digital
              </Button>
              <Button
                variant={type === 'physical' ? 'default' : 'outline'}
                onClick={() => handleTypeFilter('physical')}
                size="sm"
              >
                Physical
              </Button>
            </div>
          </div>
        </div>
        
        {/* Products Grid */}
        {products.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-gray-600">
                {search || type ? 'Try adjusting your search or filters' : 'No products available yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.product_type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {product.pricing_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                  <CardDescription className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(product.base_price)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">
                      by {product.profiles?.full_name || 'Seller'}
                    </span>
                  </div>
                  <Link to={`/products/${product.id}`}>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      View Product
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Load More - Placeholder for pagination */}
        {products.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
