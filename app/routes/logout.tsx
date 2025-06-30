import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createSupabaseServerClient } from "~/lib/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, response } = createSupabaseServerClient(request);
  
  await supabase.auth.signOut();
  
  return redirect('/', {
    headers: response.headers,
  });
}

export async function loader() {
  return redirect('/');
}
