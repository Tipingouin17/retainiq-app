import { useAuth } from "@/_core/hooks/useAuth";
import { SignInButton } from "@clerk/clerk-react";
import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  Check,
  Zap,
  BarChart2,
  Users,
  MessageSquare,
  TrendingUp,
  Shield,
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <span className="text-xl font-bold text-indigo-600 cursor-pointer select-none">
              RetainIQ
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Pricing
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button size="sm" className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="h-10 px-4">
                    Sign In
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="sm" className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                    Get Started Free
                  </Button>
                </SignInButton>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-indigo-600 transition-colors"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4">
            <a
              href="#features"
              className="text-sm font-medium text-gray-700 hover:text-indigo-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-gray-700 hover:text-indigo-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              {user ? (
                <Link to="/dashboard">
                  <Button className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full h-10">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <Button className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white">
                      Get Started Free
                    </Button>
                  </SignInButton>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20 md:py-32 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0">
              AI-Powered Customer Retention
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Retain More Customers,{" "}
              <span className="text-indigo-600">Grow Revenue Faster</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              RetainIQ uses intelligent automation and personalized workflows to
              reduce churn, re-engage lapsed customers, and maximize lifetime
              value — all from one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold"
                    >
                      Start for Free
                    </Button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto h-12 px-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-base font-semibold"
                    >
                      Book a Demo
                    </Button>
                  </SignInButton>
                </>
              )}
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required · 14-day free trial
            </p>
          </div>
        </section>

        {/* Social Proof / Stats */}
        <section className="py-12 px-4 md:px-8 bg-white border-y border-gray-100">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10,000+", label: "Active Users" },
              { value: "35%", label: "Avg. Churn Reduction" },
              { value: "3x", label: "Customer LTV Increase" },
              { value: "99.9%", label: "Uptime SLA" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-extrabold text-indigo-600">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28 px-4 md:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <Badge className="mb-3 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0">
                Features
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything you need to retain customers
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
                RetainIQ gives your team the tools to identify at-risk customers,
                automate personalized outreach, and track the results in real time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <TrendingUp className="text-indigo-600" size={24} />,
                  title: "Churn Prediction",
                  description:
                    "AI-powered scoring identifies at-risk customers before they cancel, giving your team time to intervene.",
                },
                {
                  icon: <MessageSquare className="text-indigo-600" size={24} />,
                  title: "Automated Campaigns",
                  description:
                    "Set up personalized retention workflows that trigger automatically based on customer behavior.",
                },
                {
                  icon: <BarChart2 className="text-indigo-600" size={24} />,
                  title: "Retention Analytics",
                  description:
                    "Track cohort retention, MRR churn, and campaign performance with intuitive dashboards.",
                },
                {
                  icon: <Users className="text-indigo-600" size={24} />,
                  title: "Customer Segmentation",
                  description:
                    "Segment customers by behavior, plan, or lifecycle stage for hyper-targeted outreach.",
                },
                {
                  icon: <Zap className="text-indigo-600" size={24} />,
                  title: "1-Click Integrations",
                  description:
                    "Connect your CRM, billing, and support tools in minutes. Works with Stripe, HubSpot, Intercom, and more.",
                },
                {
                  icon: <Shield className="text-indigo-600" size={24} />,
                  title: "Enterprise Security",
                  description:
                    "SOC 2 compliant with role-based access, audit logs, and SSO support for your entire team.",
                },
              ].map((feature) => (
                <Card
                  key={feature.title}
                  className="border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all"
                >
                  <CardHeader className="pb-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-28 px-4 md:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <Badge className="mb-3 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0">
                Pricing
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto text-base md:text-lg">
                Choose the plan that fits your team. Upgrade or downgrade at any
                time. All plans include a 14-day free trial.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Starter",
                  price: "$49",
                  period: "/mo",
                  description: "Perfect for small teams just getting started with retention.",
                  features: [
                    "Up to 1,000 tracked customers",
                    "Churn prediction scoring",
                    "3 automated campaigns",
                    "Email support",
                    "Basic analytics dashboard",
                  ],
                  highlighted: false,
                  cta: "Start Free Trial",
                },
                {
                  name: "Growth",
                  price: "$149",
                  period: "/mo",
                  description: "For growing businesses that need more power and scale.",
                  features: [
                    "Up to 10,000 tracked customers",
                    "Advanced churn prediction",
                    "Unlimited campaigns",
                    "Priority support",
                    "Full analytics & cohort reports",
                    "CRM & billing integrations",
                    "Customer segmentation",
                  ],
                  highlighted: true,
                  cta: "Start Free Trial",
                },
                {
                  name: "Enterprise",
                  price: "$399",
                  period: "/mo",
                  description: "For large teams needing advanced security and custom workflows.",
                  features: [
                    "Unlimited tracked customers",
                    "Custom AI models",
                    "Unlimited campaigns",
                    "Dedicated account manager",
                    "SSO & role-based access",
                    "Audit logs & SOC 2 compliance",
                    "Custom integrations",
                    "SLA guarantee",
                  ],
                  highlighted: false,
                  cta: "Start Free Trial",
                },
              ].map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative flex flex-col border-2 ${
                    plan.highlighted
                      ? "border-indigo-500 shadow-xl shadow-indigo-100"
                      : "border-gray-200"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-indigo-600 text-white hover:bg-indigo-600 border-0 px-4 py-1 text-xs font-semibold">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {plan.name}
                    </CardTitle>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-extrabold text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-gray-500 text-sm">{plan.period}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                          <Check
                            size={16}
                            className="text-indigo-500 mt-0.5 shrink-0"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {user ? (
                      <Link to="/dashboard">
                        <Button
                          className={`w-full h-11 font-semibold ${
                            plan.highlighted
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                              : "bg-gray-900 hover:bg-gray-800 text-white"
                          }`}
                        >
                          {plan.cta}
                        </Button>
                      </Link>
                    ) : (
                      <SignInButton mode="modal">
                        <Button
                          className={`w-full h-11 font-semibold ${
                            plan.highlighted
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                              : "bg-gray-900 hover:bg-gray-800 text-white"
                          }`}
                        >
                          {plan.cta}
                        </Button>
                      </SignInButton>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 px-4 md:px-8 bg-indigo-600">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Ready to stop losing customers?
            </h2>
            <p className="text-indigo-100 text-base md:text-lg mb-10 max-w-xl mx-auto">
              Join thousands of businesses using RetainIQ to reduce churn and
              grow sustainable revenue. Start your free trial today — no credit
              card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-12 px-8 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-base"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto h-12 px-8 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-base"
                    >
                      Start Free Trial
                    </Button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto h-12 px-8 border-white text-white hover:bg-indigo-700 font-semibold text-base bg-transparent"
                    >
                      Schedule a Demo
                    </Button>
                  </SignInButton>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div>
              <span className="text-xl font-bold text-white">RetainIQ</span>
              <p className="mt-3 text-sm leading-relaxed">
                AI-powered customer retention platform that helps subscription
                businesses reduce churn and grow lifetime value.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
                Product
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
                Account
              </h4>
              <ul className="space-y-2 text-sm">
                {user ? (
                  <li>
                    <Link to="/dashboard">
                      <span className="hover:text-white transition-colors cursor-pointer">
                        Dashboard
                      </span>
                    </Link>
                  </li>
                ) : (
                  <li>
                    <SignInButton mode="modal">
                      <span className="hover:text-white transition-colors cursor-pointer">
                        Sign In
                      </span>
                    </SignInButton>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} RetainIQ. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}