import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getProfile } from "~/lib/auth.server";
import { Header } from "~/components/layout/header";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  let profile = null;
  
  try {
    profile = await getProfile(request);
  } catch (error) {
    // If profile loading fails, continue without user data
    console.warn('Profile loading failed:', error);
  }
  
  return json({
    user: profile ? {
      email: profile.email,
      role: profile.role,
      isImpersonating: profile.isImpersonating || false,
      originalRole: profile.originalRole || profile.role,
    } : null,
    ENV: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY!,
    },
  });
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>KoalaCart - Your Own Online Selling Platform</title>
        <meta name="description" content="Connect your own payment gateway and sell with complete control. No platform fees, maximum profits." />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-gray-50">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  const location = useLocation();
  
  // Don't show header on dashboard pages - they have their own layout
  const isDashboardPage = location.pathname.startsWith('/dashboard') || 
                          location.pathname.startsWith('/admin/') || 
                          location.pathname.startsWith('/affiliate/') || 
                          location.pathname.startsWith('/settings');
  
  return (
    <>
      {!isDashboardPage && <Header user={data?.user} />}
      <Outlet />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(data?.ENV)}`,
        }}
      />
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  return (
    <html lang="en" className="h-full">
      <head>
        <title>Error - KoalaCart</title>
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-gray-50">
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : 'Something went wrong'}
              </h1>
              <p className="text-gray-600 mb-6">
                {isRouteErrorResponse(error) 
                  ? error.data || 'The page you are looking for does not exist.'
                  : 'An unexpected error occurred. Please try again later.'
                }
              </p>
              <a 
                href="/" 
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
