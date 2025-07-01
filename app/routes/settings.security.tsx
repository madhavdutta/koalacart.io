import type { MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Shield, Key, Smartphone, Monitor } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Security Settings - KoalaCart" },
    { name: "description", content: "Manage your account security and authentication settings" },
  ];
};

export default function SecuritySettings() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-8 border border-red-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
            <p className="text-red-700 mt-1">
              Manage your account security and authentication preferences
            </p>
          </div>
        </div>
      </div>
      
      {/* Password Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Key className="w-5 h-5" />
            Password & Authentication
          </CardTitle>
          <CardDescription className="text-gray-600">
            Manage your login credentials and authentication methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-semibold text-gray-900">Password</div>
                <div className="text-sm text-gray-600">Last updated: Never</div>
              </div>
              <Button variant="outline" className="border-gray-300 hover:bg-gray-100">
                Change Password
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-semibold text-gray-900">Two-Factor Authentication</div>
                <div className="text-sm text-gray-600">Add an extra layer of security to your account</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-600 font-medium">Disabled</span>
                <Button variant="outline" className="border-gray-300 hover:bg-gray-100">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Enable 2FA
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Login Sessions */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Monitor className="w-5 h-5" />
            Active Sessions
          </CardTitle>
          <CardDescription className="text-gray-600">
            Monitor and manage your active login sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Current Session</div>
                  <div className="text-sm text-gray-600">Chrome on macOS • Last active: Now</div>
                  <div className="text-xs text-green-600 font-medium">This device</div>
                </div>
              </div>
              <div className="text-sm text-green-600 font-medium">Active</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-400 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Mobile Session</div>
                  <div className="text-sm text-gray-600">Safari on iPhone • Last active: 2 hours ago</div>
                  <div className="text-xs text-gray-500">IP: 192.168.1.100</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-100 text-red-600 hover:text-red-700">
                Revoke
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700">
              Sign out all other sessions
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Security Preferences */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg font-semibold">Security Preferences</CardTitle>
          <CardDescription className="text-gray-600">
            Configure additional security settings for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-semibold text-gray-900">Login Notifications</div>
                <div className="text-sm text-gray-600">Get notified when someone signs into your account</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-semibold text-gray-900">Suspicious Activity Alerts</div>
                <div className="text-sm text-gray-600">Get alerts for unusual account activity</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-semibold text-gray-900">Auto-logout</div>
                <div className="text-sm text-gray-600">Automatically sign out after 30 minutes of inactivity</div>
              </div>
              <input type="checkbox" className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
