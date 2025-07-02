import { createCookieSessionStorage } from "@remix-run/node";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__impersonation",
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
    sameSite: "lax",
    secrets: ["your-secret-key"], // In production, use environment variable
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getImpersonationSession(cookieHeader: string | null) {
  return sessionStorage.getSession(cookieHeader);
}

export async function commitImpersonationSession(session: any) {
  return sessionStorage.commitSession(session);
}

export async function destroyImpersonationSession(session: any) {
  return sessionStorage.destroySession(session);
}

export async function setImpersonation(request: Request, role: 'admin' | 'affiliate' | 'user') {
  const session = await getImpersonationSession(request.headers.get("Cookie"));
  session.set("impersonatedRole", role);
  return session;
}

export async function getImpersonation(request: Request) {
  const session = await getImpersonationSession(request.headers.get("Cookie"));
  return session.get("impersonatedRole") as 'admin' | 'affiliate' | 'user' | null;
}

export async function clearImpersonation(request: Request) {
  const session = await getImpersonationSession(request.headers.get("Cookie"));
  session.unset("impersonatedRole");
  return session;
}
