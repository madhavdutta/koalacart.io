import { redirect } from "@remix-run/node";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { getImpersonation } from "~/lib/impersonation.server";

export async function requireAuth(request: Request) {
  const { supabase } = createSupabaseServerClient(request);
  
  // Use getUser() instead of getSession() for security
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
  
  // Check for impersonation (only for admins)
  let impersonatedRole = null;
  try {
    impersonatedRole = await getImpersonation(request);
  } catch (error) {
    // If impersonation check fails, continue without impersonation
    console.warn('Impersonation check failed:', error);
  }
  
  if (impersonatedRole && profile.role === 'admin') {
    return { 
      user, 
      profile: { 
        ...profile, 
        role: impersonatedRole,
        isImpersonating: true,
        originalRole: profile.role 
      } 
    };
  }
  
  return { user, profile };
}

export async function getOptionalAuth(request: Request) {
  const { supabase } = createSupabaseServerClient(request);
  
  // Use getUser() instead of getSession() for security
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { user: null, profile: null };
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  // Check for impersonation (only for admins)
  let impersonatedRole = null;
  try {
    impersonatedRole = await getImpersonation(request);
  } catch (error) {
    // If impersonation check fails, continue without impersonation
    console.warn('Impersonation check failed:', error);
  }
  
  if (impersonatedRole && profile?.role === 'admin') {
    return { 
      user, 
      profile: profile ? { 
        ...profile, 
        role: impersonatedRole,
        isImpersonating: true,
        originalRole: profile.role 
      } : null
    };
  }
  
  return { user, profile };
}

export async function getProfile(request: Request) {
  const { supabase } = createSupabaseServerClient(request);
  
  // Use getUser() instead of getSession() for security
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  // Check for impersonation (only for admins)
  let impersonatedRole = null;
  try {
    impersonatedRole = await getImpersonation(request);
  } catch (error) {
    // If impersonation check fails, continue without impersonation
    console.warn('Impersonation check failed:', error);
  }
  
  if (impersonatedRole && profile?.role === 'admin') {
    return profile ? { 
      ...profile, 
      role: impersonatedRole,
      isImpersonating: true,
      originalRole: profile.role 
    } : null;
  }
  
  return profile;
}
