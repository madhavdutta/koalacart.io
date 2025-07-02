import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireAuth } from "~/lib/auth.server";
import { 
  setImpersonation, 
  clearImpersonation, 
  commitImpersonationSession 
} from "~/lib/impersonation.server";

export async function action({ request }: ActionFunctionArgs) {
  const { profile } = await requireAuth(request);
  
  // Only admins can impersonate
  if (profile.originalRole !== 'admin' && profile.role !== 'admin') {
    throw new Response("Unauthorized", { status: 403 });
  }
  
  const formData = await request.formData();
  const action = formData.get("action");
  const role = formData.get("role") as 'admin' | 'affiliate' | 'user';
  
  if (action === "clear") {
    const session = await clearImpersonation(request);
    return redirect("/admin/dashboard", {
      headers: {
        "Set-Cookie": await commitImpersonationSession(session),
      },
    });
  }
  
  if (!role || !['admin', 'affiliate', 'user'].includes(role)) {
    throw new Response("Invalid role", { status: 400 });
  }
  
  const session = await setImpersonation(request, role);
  
  // Redirect based on the impersonated role
  let redirectPath = "/admin/dashboard";
  if (role === 'affiliate') {
    redirectPath = "/affiliate/dashboard";
  } else if (role === 'user') {
    redirectPath = "/";
  }
  
  return redirect(redirectPath, {
    headers: {
      "Set-Cookie": await commitImpersonationSession(session),
    },
  });
}
