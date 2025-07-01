import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link, Form, useActionData, useNavigation } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { requireAuth } from "~/lib/auth.server";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Plus, Edit, Trash2, Folder, Package } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Categories - KoalaCart Admin" },
    { name: "description", content: "Manage product categories" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  const { supabase } = createSupabaseServerClient(request);
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      *,
      products (count)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching categories:', error);
  }
  
  return json({ user, profile, categories: categories || [] });
}

export async function action({ request }: ActionFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  const { supabase } = createSupabaseServerClient(request);
  const formData = await request.formData();
  const intent = formData.get('intent');
  
  if (intent === 'create') {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const image_url = formData.get('image_url') as string;
    
    if (!name) {
      return json({ error: 'Category name is required' }, { status: 400 });
    }
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const { error } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        description: description || null,
        image_url: image_url || null,
        is_active: true
      });
    
    if (error) {
      return json({ error: error.message }, { status: 400 });
    }
    
    return json({ success: true });
  }
  
  if (intent === 'delete') {
    const categoryId = formData.get('categoryId') as string;
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);
    
    if (error) {
      return json({ error: error.message }, { status: 400 });
    }
    
    return json({ success: true });
  }
  
  if (intent === 'toggle') {
    const categoryId = formData.get('categoryId') as string;
    const isActive = formData.get('isActive') === 'true';
    
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !isActive })
      .eq('id', categoryId);
    
    if (error) {
      return json({ error: error.message }, { status: 400 });
    }
    
    return json({ success: true });
  }
  
  return json({ error: 'Invalid action' }, { status: 400 });
}

export default function CategoriesIndex() {
  const { user, profile, categories } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-2">Organize your products with categories</p>
          </div>
        </div>

        {/* Quick Add Category Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
            <CardDescription>Create a new product category</CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="create" />
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="e.g., Digital Courses"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    placeholder="Brief description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              
              {actionData?.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="text-red-800 text-sm font-medium">{actionData.error}</div>
                </div>
              )}
              
              {actionData?.success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="text-green-800 text-sm font-medium">Category created successfully</div>
                </div>
              )}
              
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                <Plus className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Creating...' : 'Create Category'}
              </Button>
            </Form>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Folder className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={category.is_active ? "default" : "secondary"}>
                    {category.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <Package className="w-4 h-4 mr-1" />
                    {category.products?.[0]?.count || 0} products
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link to={`/admin/categories/${category.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Form method="post" className="flex-1">
                    <input type="hidden" name="intent" value="toggle" />
                    <input type="hidden" name="categoryId" value={category.id} />
                    <input type="hidden" name="isActive" value={category.is_active.toString()} />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {category.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </Form>
                  <Form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="categoryId" value={category.id} />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={(e) => {
                        if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </Form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Folder className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-500 text-center">
                Create your first category to organize your products
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
