import { redirect } from "@remix-run/node";
import { createSupabaseServerClient } from "~/lib/supabase.server";

export async function requireAuth(request: Request) {
  const { supabase } = createSupabaseServerClient(request);
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    throw redirect('/login');
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();
  
  if (profileError || !profile) {
    throw redirect('/dashboard');
  }
  
  return {
    user: session.user,
    profile,
    session
  };
}

export async function getProfile(request: Request) {
  const { supabase } = createSupabaseServerClient(request);
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();
  
  return profile;
}
