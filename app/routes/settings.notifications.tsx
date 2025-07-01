import type { MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Bell, Mail, Smartphone, Save } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Notification Settings - KoalaCart" },
    { name: "description", content: "Manage your notification preferences and communication settings" },
  ];
};

export default function NotificationSettings() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-8 border border-purple-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
            <p className="text-purple-700 mt-1">
              Choose what notifications you want to receive and how
            </p>
          </div>
        </div>
      </div>
      
      {/* Email Notifications */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
          <CardDescription className="text-gray-600">
            Configure which email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-semibold text-gray-900">Order Notifications</div>
                <div className="text-sm text-gray-600">Get notified when you receive new orders</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-semibold text-gray-900">Payment Notifications</div>
                <div className="text-sm text-gray-600">Get notified about payment updates and transactions</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-semibold text-gray-900">Affiliate Notifications</div>
                <div className="text-sm text-gray-600">Get notified about affiliate activities and commissions</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-semibold text-gray-900">Security Alerts</div>
                <div className="text-sm text-gray-600">Important security notifications and login alerts</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-semibold text-gray-900">Marketing Emails</div>
                <div className="text-sm text-gray-600">Receive updates about new features, tips, and promotions</div>
              </div>
              <input type="checkbox" className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Push Notifications */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Smartphone className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription className="text-gray-600">
            Configure browser and mobile push notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-semibold text-gray-900">Browser Notifications</div>
                <div className="text-sm text-gray-600">Show notifications in your browser</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-orange-600 font-medium">Permission Required</span>
                <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-100">
                  Enable
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-semibold text-gray-900">Real-time Order Updates</div>
                <div className="text-sm text-gray-600">Instant notifications for new orders</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-semibold text-gray-900">Payment Confirmations</div>
                <div className="text-sm text-gray-600">Push notifications for successful payments</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Notification Frequency */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg font-semibold">Notification Frequency</CardTitle>
          <CardDescription className="text-gray-600">
            Control how often you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Email Digest Frequency</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input type="radio" name="emailFrequency" value="instant" defaultChecked className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500" />
                  <span className="text-sm text-gray-700">Instant notifications</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="radio" name="emailFrequency" value="daily" className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500" />
                  <span className="text-sm text-gray-700">Daily digest</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="radio" name="emailFrequency" value="weekly" className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500" />
                  <span className="text-sm text-gray-700">Weekly digest</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Quiet Hours</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm text-gray-600">From:</Label>
                  <select className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500">
                    <option value="22:00">10:00 PM</option>
                    <option value="23:00">11:00 PM</option>
                    <option value="00:00">12:00 AM</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="text-sm text-gray-600">To:</Label>
                  <select className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500">
                    <option value="06:00">6:00 AM</option>
                    <option value="07:00">7:00 AM</option>
                    <option value="08:00">8:00 AM</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-500">No notifications will be sent during quiet hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
          <Save className="w-4 h-4 mr-2" />
          Save Notification Preferences
        </Button>
      </div>
    </div>
  );
}

function Label({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) {
  return (
    <label className={`block text-sm font-medium text-gray-700 ${className || ''}`} {...props}>
      {children}
    </label>
  );
}
