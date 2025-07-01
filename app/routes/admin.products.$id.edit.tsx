import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation, Link } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { requireAuth } from "~/lib/auth.server";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `Edit ${data?.product?.name || 'Product'} - KoalaCart Admin` },
    { name: "description", content: "Edit product details" },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  const { supabase } = createSupabaseServerClient(request);
  
  const [productResult, categoriesResult] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('id', params.id!)
      .eq('admin_id', profile.id)
      .single(),
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
  ]);
  
  if (productResult.error || !productResult.data) {
    throw new Response("Product not found", { status: 404 });
  }
  
  return json({ 
    user, 
    profile, 
    product: productResult.data,
    categories: categoriesResult.data || []
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  const { supabase } = createSupabaseServerClient(request);
  const formData = await request.formData();
  const intent = formData.get('intent');
  
  if (intent === 'delete') {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id!)
      .eq('admin_id', profile.id);
    
    if (error) {
      return json({ error: error.message }, { status: 400 });
    }
    
    return redirect('/admin/products');
  }
  
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const short_description = formData.get('short_description') as string;
  const category_id = formData.get('category_id') as string;
  const product_type = formData.get('product_type') as string;
  const pricing_type = formData.get('pricing_type') as string;
  const base_price = parseFloat(formData.get('base_price') as string);
  const sale_price = formData.get('sale_price') ? parseFloat(formData.get('sale_price') as string) : null;
  const image_url = formData.get('image_url') as string;
  const download_url = formData.get('download_url') as string;
  const tags = formData.get('tags') as string;
  const is_active = formData.get('is_active') === 'on';
  const featured = formData.get('featured') === 'on';
  
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const { error } = await supabase
    .from('products')
    .update({
      name,
      slug,
      description,
      short_description,
      category_id: category_id || null,
      product_type,
      pricing_type,
      base_price,
      sale_price,
      image_url: image_url || null,
      download_url: download_url || null,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      is_active,
      featured
    })
    .eq('id', params.id!)
    .eq('admin_id', profile.id);
  
  if (error) {
    return json({ error: error.message }, { status: 400 });
  }
  
  return redirect(`/admin/products/${params.id}`);
}

export default function EditProduct() {
  const { user, profile, product, categories } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to={`/admin/products/${product.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Product
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 mt-1">{product.name}</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Update your product information</CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    defaultValue={product.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    id="short_description"
                    name="short_description"
                    defaultValue={product.short_description || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    defaultValue={product.description || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    defaultValue={product.category_id || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="product_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type
                  </label>
                  <select
                    id="product_type"
                    name="product_type"
                    defaultValue={product.product_type}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="digital">Digital</option>
                    <option value="physical">Physical</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="pricing_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Pricing Type
                  </label>
                  <select
                    id="pricing_type"
                    name="pricing_type"
                    defaultValue={product.pricing_type}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="one_time">One Time</option>
                    <option value="subscription">Subscription</option>
                    <option value="trial">Trial</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price (USD) *
                  </label>
                  <input
                    type="number"
                    id="base_price"
                    name="base_price"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={product.base_price}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700 mb-1">
                    Sale Price (USD)
                  </label>
                  <input
                    type="number"
                    id="sale_price"
                    name="sale_price"
                    step="0.01"
                    min="0"
                    defaultValue={product.sale_price || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image URL
                  </label>
                  <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    defaultValue={product.image_url || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="download_url" className="block text-sm font-medium text-gray-700 mb-1">
                    Download URL (for digital products)
                  </label>
                  <input
                    type="url"
                    id="download_url"
                    name="download_url"
                    defaultValue={product.download_url || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    defaultValue={product.tags?.join(', ') || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      defaultChecked={product.is_active}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                      Product is active
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      name="featured"
                      defaultChecked={product.featured}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                      Featured product
                    </label>
                  </div>
                </div>
              </div>
              
              {actionData?.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="text-red-800 text-sm font-medium">{actionData.error}</div>
                </div>
              )}
              
              <div className="flex justify-between">
                <Form method="post">
                  <input type="hidden" name="intent" value="delete" />
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isSubmitting}
                    onClick={(e) => {
                      if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Product
                  </Button>
                </Form>
                
                <div className="flex space-x-4">
                  <Link to={`/admin/products/${product.id}`}>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
