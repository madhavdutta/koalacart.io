import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, Link, useLocation } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { Card, CardContent } from "~/components/ui/card";
import { 
  Settings as SettingsIcon, 
  User, 
  CreditCard, 
  Bell, 
  Shield,
  Palette,
  Globe
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Settings - KoalaCart" },
    { name: "description", content: "Manage your account settings and preferences" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, profile } = await requireAuth(request);
  return json({ user, profile });
}

export default function Settings() {
  const { user, profile } = useLoaderData<typeof loader>();
  const location = useLocation();
  
  const settingsNavigation = [
    {
      name: 'Profile',
      href: '/settings',
      icon: User,
      description: 'Manage your personal information'
    },
    {
      name: 'Payment Gateways',
      href: '/settings/payments',
      icon: CreditCard,
      description: 'Configure payment processing'
    },
    {
      name: 'Notifications',
      href: '/settings/notifications',
      icon: Bell,
      description: 'Email and push notification preferences'
    },
    {
      name: 'Security',
      href: '/settings/security',
      icon: Shield,
      description: 'Password and two-factor authentication'
    },
    {
      name: 'Appearance',
      href: '/settings/appearance',
      icon: Palette,
      description: 'Theme and display preferences'
    },
    {
      name: 'API & Integrations',
      href: '/settings/integrations',
      icon: Globe,
      description: 'Third-party integrations and API keys'
    }
  ];
  
  const isActive = (path: string) => {
    if (path === '/settings') {
      return location.pathname === '/settings';
    }
    return location.pathname.startsWith(path);
  };
  
  // If we're on a sub-route, show the outlet
  if (location.pathname !== '/settings') {
    return (
      <DashboardLayout user={user} profile={profile}>
        <Outlet />
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout user={user} profile={profile}>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-700 mt-1">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>
        
        {/* Settings Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {settingsNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link key={item.name} to={item.href}>
                <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer ${
                  active ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        active 
                          ? 'bg-green-100' 
                          : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          active ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          active ? 'text-green-900' : 'text-gray-900'
                        }`}>
                          {item.name}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          active ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
