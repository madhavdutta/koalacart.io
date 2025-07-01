import { redirect } from "@remix-run/node";
import { createSupabaseServerClient } from "~/lib/supabase.server";

export async function requireAuth(request: Request) {
  const { supabase } = createSupabaseServerClient(request);
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw redirect('/login');
  }
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (!profile) {
    throw redirect('/onboarding');
  }
  
  return { user, profile };
}

export async function getOptionalAuth(request: Request) {
  const { supabase } = createSupabaseServerClient(request);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { user: null, profile: null };
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  return { user, profile };
}

export async function getProfile(request: Request) {
  const { supabase } = createSupabaseServerClient(request);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  return profile;
}
