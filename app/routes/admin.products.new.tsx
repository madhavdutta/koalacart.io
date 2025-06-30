import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { requireAuth } from "~/lib/auth.server";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export const meta: MetaFunction = () => {
  return [
    { title: "Create Product - KoalaCart" },
    { name: "description", content: "Create a new product" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { profile } = await requireAuth(request);
  
  if (profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  
  if (profile.role !== 'admin') {
    return redirect('/dashboard');
  }
  
  const { supabase } = createSupabaseServerClient(request);
  const formData = await request.formData();
  
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const productType = formData.get('productType') as 'digital' | 'physical';
  const pricingType = formData.get('pricingType') as 'one_time' | 'subscription' | 'trial';
  const basePrice = parseFloat(formData.get('basePrice') as string);
  const imageUrl = formData.get('imageUrl') as string;
  const downloadUrl = formData.get('downloadUrl') as string;
  
  if (!name || !basePrice || basePrice <= 0) {
    return json({ error: 'Name and valid price are required' }, { status: 400 });
  }
  
  try {
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        admin_id: user.id,
        name,
        description: description || null,
        product_type: productType,
        pricing_type: pricingType,
        base_price: basePrice,
        currency: 'USD',
        image_url: imageUrl || null,
        download_url: downloadUrl || null,
        is_active: true,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      return json({ error: 'Failed to create product' }, { status: 400 });
    }
    
    return redirect(`/admin/products/${product.id}/edit?created=true`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export default function NewProduct() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
          <p className="text-gray-600 mt-2">Add a new product to your store</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Fill in the information about your product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-6">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Enter product name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your product..."
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productType">Product Type</Label>
                  <select
                    id="productType"
                    name="productType"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                  >
                    <option value="digital">Digital</option>
                    <option value="physical">Physical</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="pricingType">Pricing Type</Label>
                  <select
                    id="pricingType"
                    name="pricingType"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-white shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                  >
                    <option value="one_time">One Time</option>
                    <option value="subscription">Subscription</option>
                    <option value="trial">Trial</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="basePrice">Price (USD) *</Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="imageUrl">Product Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional: Add an image URL to showcase your product
                </p>
              </div>
              
              <div>
                <Label htmlFor="downloadUrl">Download URL (for digital products)</Label>
                <Input
                  id="downloadUrl"
                  name="downloadUrl"
                  type="url"
                  placeholder="https://example.com/download"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  For digital products: URL where customers can download the product
                </p>
              </div>
              
              {actionData?.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="text-red-800 text-sm font-medium">{actionData.error}</div>
                </div>
              )}
              
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
