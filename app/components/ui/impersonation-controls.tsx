import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { UserCheck, Users, Crown, ShoppingCart, AlertTriangle } from "lucide-react";

interface ImpersonationControlsProps {
  currentRole: 'admin' | 'affiliate' | 'user';
  isImpersonating?: boolean;
  originalRole?: string;
}

export function ImpersonationControls({ currentRole, isImpersonating, originalRole }: ImpersonationControlsProps) {
  const roles = [
    { 
      value: 'admin', 
      label: 'Admin', 
      icon: Crown, 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Full access to all admin features'
    },
    { 
      value: 'affiliate', 
      label: 'Affiliate', 
      icon: Users, 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Affiliate dashboard and link management'
    },
    { 
      value: 'user', 
      label: 'Customer', 
      icon: ShoppingCart, 
      color: 'bg-green-100 text-green-800 border-green-200',
      description: 'Regular customer experience'
    }
  ];

  return (
    <Card className="border-2 border-orange-200 bg-orange-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Testing Mode
              </CardTitle>
              <p className="text-sm text-orange-700">
                Switch between user roles to test different experiences
              </p>
            </div>
          </div>
          {isImpersonating && (
            <Badge className="bg-orange-100 text-orange-800 border-orange-300">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Impersonating
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            const isActive = currentRole === role.value;
            
            return (
              <div key={role.value} className="relative">
                <Form method="post" action="/admin/impersonate">
                  <input type="hidden" name="role" value={role.value} />
                  <Button
                    type="submit"
                    variant={isActive ? "default" : "outline"}
                    className={`w-full h-auto p-4 flex flex-col items-center space-y-2 ${
                      isActive 
                        ? 'bg-orange-600 hover:bg-orange-700 text-white border-orange-600' 
                        : 'hover:bg-orange-50 border-orange-200'
                    }`}
                    disabled={isActive}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-orange-600'}`} />
                    <div className="text-center">
                      <div className={`font-semibold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {role.label}
                      </div>
                      <div className={`text-xs ${isActive ? 'text-orange-100' : 'text-gray-600'}`}>
                        {role.description}
                      </div>
                    </div>
                  </Button>
                </Form>
                {isActive && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {isImpersonating && (
          <div className="mt-6 pt-4 border-t border-orange-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-orange-700">
                Currently viewing as <strong>{currentRole}</strong> • Original role: <strong>{originalRole}</strong>
              </div>
              <Form method="post" action="/admin/impersonate">
                <input type="hidden" name="action" value="clear" />
                <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                  Exit Testing Mode
                </Button>
              </Form>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
