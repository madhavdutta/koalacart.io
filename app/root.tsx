import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
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
  const profile = await getProfile(request);
  
  return json({
    user: profile ? {
      email: profile.email,
      role: profile.role,
    } : null,
    ENV: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY!,
    },
  });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  
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
        <Header user={data?.user} />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data?.ENV)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
