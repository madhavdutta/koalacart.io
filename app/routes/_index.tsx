import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { createSupabaseServerClient } from "~/lib/supabase.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { formatCurrency } from "~/lib/utils";
import { 
  ArrowRight, 
  CheckCircle, 
  CreditCard, 
  Globe, 
  Shield, 
  Zap, 
  TrendingUp,
  Users,
  Star,
  Play,
  ChevronRight,
  Sparkles,
  BarChart3,
  Lock,
  Smartphone,
  DollarSign,
  Target,
  Award,
  Rocket,
  PieChart,
  MessageSquare,
  Clock,
  Headphones,
  Building,
  Code,
  Database,
  Settings,
  Layers,
  Monitor,
  Wifi,
  Activity
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "KoalaCart - Your Own Payment Gateway, Maximum Control" },
    { name: "description", content: "Connect your own Stripe account to KoalaCart. Keep 100% control over payments, no platform fees, maximum profits." },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createSupabaseServerClient(request);
  
  // Get featured products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .limit(6);
  
  return json({ products: products || [] });
}

export default function Index() {
  const { products } = useLoaderData<typeof loader>();
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-green-50 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='%2316a34a' fill-opacity='1'%3e%3cpath d='M30 30c0-8.3-6.7-15-15-15s-15 6.7-15 15 6.7 15 15 15 15-6.7 15 15-6.7 15-15 15-15-6.7-15-15 6.7-15 15-15 15 6.7 15 15z'/%3e%3c/g%3e%3c/svg%3e")`
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200 mb-10">
              <Sparkles className="w-4 h-4 mr-2" />
              Your complete payment infrastructure
            </div>
            
            {/* Main Headline */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-gray-900 tracking-tight leading-none mb-10">
              Payment infrastructure
              <br />
              <span className="text-green-600">built for growth</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-2xl sm:text-3xl text-gray-700 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
              Connect your Stripe account to KoalaCart and keep 100% of your profits. No platform fees, maximum control, unlimited potential.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <Link to="/register">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-10 py-5 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                  Start building now
                  <ArrowRight className="ml-3 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="border-2 border-green-600 text-green-700 hover:bg-green-50 font-semibold px-10 py-5 text-lg rounded-lg transition-all duration-200">
                  <Play className="mr-3 w-5 h-5" />
                  Watch demo
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-10 text-gray-600 text-base font-medium">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                No setup fees
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Your Stripe account
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                100% profit retention
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Enterprise security
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by thousands of businesses worldwide
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Join the growing community of successful entrepreneurs using KoalaCart
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">50K+</div>
              <div className="text-green-100 text-lg">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">$100M+</div>
              <div className="text-green-100 text-lg">Processed</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">99.9%</div>
              <div className="text-green-100 text-lg">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">150+</div>
              <div className="text-green-100 text-lg">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Everything you need to succeed
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
              From payment processing to affiliate management, we provide all the tools you need to build and scale your online business.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Payment Processing */}
            <div className="group bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-green-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-8">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Payment Processing</h3>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Accept payments from customers worldwide with your own Stripe account. Keep 100% of your revenue with no platform fees.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  Your own Stripe account
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  No platform fees
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  Global payment methods
                </li>
              </ul>
              <Link to="/payments" className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors text-lg">
                Learn more
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            
            {/* Affiliate Management */}
            <div className="group bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-green-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-8">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Affiliate Management</h3>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Build a powerful affiliate network with automated tracking, commission management, and real-time analytics.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  Automated tracking
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  Custom commission rates
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  Real-time reporting
                </li>
              </ul>
              <Link to="/affiliates" className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors text-lg">
                Learn more
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            
            {/* Analytics & Insights */}
            <div className="group bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-green-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-8">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics & Insights</h3>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Get detailed insights into your sales, affiliate performance, and customer behavior with advanced analytics.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  Real-time dashboards
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  Custom reports
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  Performance tracking
                </li>
              </ul>
              <Link to="/analytics" className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors text-lg">
                Learn more
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              How KoalaCart works
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
              Get started in minutes with our simple three-step process
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Stripe</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Link your existing Stripe account or create a new one. Keep full control over your payments and customer data.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Add Your Products</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Upload your digital products, set pricing, and configure your affiliate commission structure in minutes.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Selling</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Launch your store, recruit affiliates, and start generating revenue. Monitor everything from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              What our customers say
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
              Don't just take our word for it - hear from successful entrepreneurs using KoalaCart
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                "KoalaCart transformed my business. I went from struggling with platform fees to keeping 100% of my revenue. The affiliate system is incredible!"
              </p>
              <div className="flex items-center">
                <img 
                  src="https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" 
                  alt="Sarah Johnson" 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">Sarah Johnson</div>
                  <div className="text-gray-600">Digital Course Creator</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                "The setup was incredibly easy. Within 30 minutes, I had my entire product catalog live and affiliates were already promoting my products."
              </p>
              <div className="flex items-center">
                <img 
                  src="https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" 
                  alt="Mike Chen" 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">Mike Chen</div>
                  <div className="text-gray-600">Software Developer</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                "Finally, a platform that doesn't take a cut of my hard-earned revenue. The analytics are detailed and the support team is fantastic."
              </p>
              <div className="flex items-center">
                <img 
                  src="https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" 
                  alt="Emma Rodriguez" 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">Emma Rodriguez</div>
                  <div className="text-gray-600">Marketing Consultant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Simple, transparent pricing
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
              No hidden fees, no platform commissions. You keep 100% of your revenue.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border-2 border-green-200 rounded-3xl p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Professional Plan</h3>
              <div className="mb-8">
                <span className="text-6xl font-bold text-green-600">$29</span>
                <span className="text-2xl text-gray-600">/month</span>
              </div>
              
              <ul className="space-y-4 mb-12 text-left max-w-md mx-auto">
                <li className="flex items-center text-gray-700 text-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-4" />
                  Unlimited products
                </li>
                <li className="flex items-center text-gray-700 text-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-4" />
                  Unlimited affiliates
                </li>
                <li className="flex items-center text-gray-700 text-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-4" />
                  Advanced analytics
                </li>
                <li className="flex items-center text-gray-700 text-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-4" />
                  Priority support
                </li>
                <li className="flex items-center text-gray-700 text-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-4" />
                  Custom branding
                </li>
              </ul>
              
              <Link to="/register">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-12 py-4 text-xl rounded-xl">
                  Start free trial
                </Button>
              </Link>
              
              <p className="text-gray-600 mt-6">14-day free trial • No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Frequently asked questions
            </h2>
            <p className="text-2xl text-gray-600 font-light">
              Everything you need to know about KoalaCart
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Do I need my own Stripe account?
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Yes, you'll connect your own Stripe account to KoalaCart. This means you keep 100% control over your payments, customer data, and revenue. We never touch your money.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Are there any transaction fees?
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                No! Unlike other platforms, KoalaCart doesn't charge any transaction fees or take a percentage of your sales. You only pay your monthly subscription and standard Stripe processing fees.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                How quickly can I get started?
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Most users are up and running within 30 minutes. Simply connect your Stripe account, add your products, and you're ready to start selling and recruiting affiliates.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Can I customize my store's appearance?
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Absolutely! KoalaCart offers extensive customization options including custom branding, colors, logos, and even custom domains for a professional appearance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-green-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-white mb-8">
            Ready to keep 100% of your profits?
          </h2>
          <p className="text-2xl text-green-100 mb-12 font-light max-w-3xl mx-auto">
            Join thousands of successful entrepreneurs who've made the switch to KoalaCart. Start your free trial today and see the difference.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-50 font-semibold px-12 py-5 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                Start free trial
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-12 py-5 text-xl rounded-xl transition-all duration-200">
                <MessageSquare className="mr-3 w-6 h-6" />
                Talk to sales
              </Button>
            </Link>
          </div>
          
          <p className="text-green-100 mt-8 text-lg">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}
