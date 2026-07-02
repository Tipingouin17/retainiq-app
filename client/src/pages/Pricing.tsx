import { useState } from "react";
import { Check, Zap, Shield, BarChart3, Users, Bell, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { SignInButton } from "@clerk/clerk-react";
import { Link } from "wouter";

const plans = [
  {
    name: "Starter",
    price: 100,
    description: "Perfect for small teams getting started with customer retention.",
    badge: null,
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
    features: [
      "Up to 500 tracked customers",
      "Basic churn prediction",
      "Email alerts & notifications",
      "5 retention workflows",
      "CSV data import",
      "Standard analytics dashboard",
      "Email support",
    ],
    notIncluded: [
      "Advanced AI insights",
      "CRM integrations",
      "Custom playbooks",
      "Dedicated account manager",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Growth",
    price: 250,
    description: "For growing businesses ready to take retention to the next level.",
    badge: "Most Popular",
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
    features: [
      "Up to 5,000 tracked customers",
      "Advanced churn prediction (AI-powered)",
      "Real-time alerts & notifications",
      "Unlimited retention workflows",
      "CRM integrations (HubSpot, Salesforce)",
      "Advanced analytics & reporting",
      "Custom retention playbooks",
      "A/B testing for campaigns",
      "Priority email & chat support",
    ],
    notIncluded: [
      "White-label options",
      "Dedicated account manager",
    ],
    cta: "Start Growing",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: 500,
    description: "For large organizations requiring full-scale retention infrastructure.",
    badge: "Best Value",
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
    features: [
      "Unlimited tracked customers",
      "Enterprise AI & predictive modeling",
      "Real-time alerts & notifications",
      "Unlimited retention workflows",
      "All CRM & data warehouse integrations",
      "Custom analytics & BI exports",
      "Custom retention playbooks",
      "Advanced A/B testing",
      "White-label options",
      "Dedicated account manager",
      "SLA guarantee (99.9% uptime)",
      "Custom onboarding & training",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    highlight: false,
  },
];

const featureHighlights = [
  {
    icon: BarChart3,
    title: "Predictive Churn Analytics",
    description: "Identify at-risk customers before they leave using machine learning models trained on your data.",
  },
  {
    icon: Bell,
    title: "Smart Alerting",
    description: "Get notified the moment a customer shows signs of disengagement so your team can act fast.",
  },
  {
    icon: RefreshCw,
    title: "Automated Workflows",
    description: "Build retention sequences that trigger automatically based on customer behavior and health scores.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Assign accounts, share playbooks, and track team performance across the entire retention funnel.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 Type II compliant with SSO, role-based access control, and audit logs built in.",
  },
  {
    icon: Zap,
    title: "Instant Integrations",
    description: "Connect to your existing CRM, helpdesk, and billing tools in minutes with one-click integrations.",
  },
];

function PlanCard({ plan, index }: { plan: typeof plans[0]; index: number }) {
  const { user } = useAuth();
  const checkoutMutation = trpc.payments.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });

  const handleCheckout = () => {
    checkoutMutation.mutate({ priceId: plan.priceId });
  };

  return (
    <Card
      className={`relative flex flex-col transition-all duration-300 hover:shadow-xl ${
        plan.highlight
          ? "border-2 border-primary shadow-lg scale-100 md:scale-105 z-10 bg-primary/5"
          : "border border-border hover:border-primary/50"
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge
            className={`px-3 py-1 text-xs font-semibold ${
              plan.highlight
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {plan.badge}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4 pt-8">
        <CardTitle className="text-xl font-bold text-foreground">{plan.name}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
        <div className="mt-4 flex items-end gap-1">
          <span className="text-4xl md:text-5xl font-extrabold text-foreground">
            ${plan.price}
          </span>
          <span className="text-muted-foreground mb-1 text-sm">/month</span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 gap-6">
        <div className="space-y-3">
          {plan.features.map((feature) => (
            <div key={feature} className="flex items-start gap-2.5">
              <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-primary" strokeWidth={3} />
              </div>
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
          {plan.notIncluded.map((feature) => (
            <div key={feature} className="flex items-start gap-2.5 opacity-40">
              <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                <span className="w-2 h-0.5 bg-muted-foreground rounded-full block" />
              </div>
              <span className="text-sm text-muted-foreground line-through">{feature}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-2">
          {user ? (
            <Button
              onClick={handleCheckout}
              disabled={checkoutMutation.isPending}
              className={`w-full h-11 text-sm font-semibold transition-all ${
                plan.highlight
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                  : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              }`}
            >
              {checkoutMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting…
                </span>
              ) : (
                plan.cta
              )}
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button
                className={`w-full h-11 text-sm font-semibold transition-all ${
                  plan.highlight
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                    : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                }`}
              >
                {plan.cta}
              </Button>
            </SignInButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Pricing() {
  const [billingCycle] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex h-14 items-center justify-between">
          <Link to="/">
            <span className="text-lg font-bold text-primary cursor-pointer">RetainIQ</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/">
              <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer hidden sm:inline">
                Home
              </span>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="h-9 px-4 text-sm">
                Dashboard
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-12 px-4 md:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs font-medium">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Invest in retention,{" "}
            <span className="text-primary">multiply your revenue</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            RetainIQ helps you identify at-risk customers and take action before they churn.
            Choose the plan that fits your team size and ambitions.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            All plans include a{" "}
            <span className="font-semibold text-foreground">14-day free trial</span>. No credit card required.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 lg:gap-8 items-start">
            {plans.map((plan, index) => (
              <PlanCard key={plan.name} plan={plan} index={index} />
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            All prices in USD. Billed monthly. Cancel anytime.{" "}
            <a href="mailto:support@retainiq.com" className="underline hover:text-foreground transition-colors">
              Contact us
            </a>{" "}
            for annual discounts or custom enterprise pricing.
          </p>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 px-4 md:px-8 bg-muted/40 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Everything you need to stop churn
            </h2>
            <p className="mt-3 text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              RetainIQ gives your team the tools, data, and automation to keep customers happy and subscribed.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureHighlights.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex gap-4 p-5 rounded-xl bg-background border border-border hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I switch plans later?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated for the current billing period.",
              },
              {
                q: "Is there a free trial?",
                a: "Every plan comes with a 14-day free trial. No credit card is required to start, and you can cancel at any time before the trial ends.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit and debit cards (Visa, Mastercard, Amex) through our secure Stripe-powered checkout. Enterprise customers can request invoice billing.",
              },
              {
                q: "How is 'tracked customers' defined?",
                a: "A tracked customer is any unique customer profile synced to RetainIQ. This includes customers from your CRM, billing system, or imported CSV files.",
              },
              {
                q: "Do you offer discounts for annual billing?",
                a: "Yes! Annual plans come with a 20% discount. Contact our sales team at sales@retainiq.com to get set up with an annual subscription.",
              },
              {
                q: "What integrations are available?",
                a: "RetainIQ integrates with HubSpot, Salesforce, Intercom, Stripe, Chargebee, Segment, and more. Growth and Enterprise plans unlock all integrations.",
              },
            ].map((faq) => (
              <div key={faq.q} className="border-b border-border pb-6 last:border-0 last:pb-0">
                <h3 className="font-semibold text-foreground text-sm md:text-base mb-2">{faq.q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4 md:px-8 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-4">
            Start retaining more customers today
          </h2>
          <p className="text-primary-foreground/80 text-sm md:text-base mb-8 max-w-xl mx-auto">
            Join hundreds of companies using RetainIQ to reduce churn, increase lifetime value, and build stronger customer relationships.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="h-11 px-8 bg-background text-foreground hover:bg-background/90 font-semibold"
              >
                Start Free Trial
              </Button>
            </SignInButton>
            <a href="mailto:sales@retainiq.com">
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-8 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 font-semibold w-full sm:w-auto"
              >
                Talk to Sales
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-8 border-t border-border bg-background">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-semibold text-primary">RetainIQ</span>
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} RetainIQ. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="mailto:support@retainiq.com" className="hover:text-foreground transition-colors">
              support@retainiq.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}