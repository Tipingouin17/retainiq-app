import { useState } from "react";
import { Check, Zap, Shield, Users, BarChart3, Bell, Headphones, Star, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { SignInButton } from "@clerk/clerk-react";
import { Link } from "wouter";

const plans = [
  {
    name: "Starter",
    price: 100,
    description: "Perfect for small teams getting started with customer retention.",
    badge: null,
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
    color: "border-border",
    headerColor: "bg-muted/30",
    features: [
      "Up to 1,000 customers tracked",
      "Basic churn prediction",
      "Email alerts & notifications",
      "3 retention campaign templates",
      "CSV data export",
      "Email support",
      "7-day data history",
      "1 team member seat",
    ],
    notIncluded: [
      "Advanced AI insights",
      "Custom integrations",
      "Priority support",
      "Dedicated account manager",
    ],
  },
  {
    name: "Growth",
    price: 250,
    description: "For growing companies serious about reducing churn at scale.",
    badge: "Most Popular",
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
    color: "border-primary shadow-lg shadow-primary/10",
    headerColor: "bg-primary/5",
    features: [
      "Up to 10,000 customers tracked",
      "Advanced AI churn prediction",
      "Real-time alerts & webhooks",
      "20 retention campaign templates",
      "Full data export (CSV, JSON)",
      "Priority email & chat support",
      "90-day data history",
      "5 team member seats",
      "CRM integrations (HubSpot, Salesforce)",
      "A/B testing for campaigns",
      "Custom retention playbooks",
      "Monthly performance reports",
    ],
    notIncluded: [
      "Dedicated account manager",
      "White-label options",
    ],
  },
  {
    name: "Enterprise",
    price: 500,
    description: "Full-power retention intelligence for large, complex organizations.",
    badge: "Best Value",
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
    color: "border-border",
    headerColor: "bg-muted/30",
    features: [
      "Unlimited customers tracked",
      "Enterprise-grade AI predictions",
      "Real-time alerts, webhooks & Slack",
      "Unlimited campaign templates",
      "Advanced analytics & BI exports",
      "24/7 priority support",
      "Unlimited data history",
      "Unlimited team member seats",
      "All CRM & data warehouse integrations",
      "Advanced A/B & multivariate testing",
      "Custom retention playbooks",
      "Weekly performance reviews",
      "Dedicated account manager",
      "Custom AI model training",
      "White-label options",
      "SLA guarantees",
    ],
    notIncluded: [],
  },
];

const faqs = [
  {
    question: "Can I switch plans at any time?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "We offer a 14-day free trial on all plans. No credit card required to get started — just sign up and explore RetainIQ risk-free.",
  },
  {
    question: "What counts as a 'tracked customer'?",
    answer:
      "A tracked customer is any unique end-user in your system that RetainIQ monitors for churn signals. Deleted or churned customers no longer count toward your limit.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer:
      "Yes! Paying annually saves you 20% compared to monthly billing. Contact us to switch to an annual plan at any time.",
  },
  {
    question: "What integrations are supported?",
    answer:
      "Growth plans include HubSpot and Salesforce. Enterprise plans include all CRM platforms, data warehouses (Snowflake, BigQuery), and custom webhook integrations.",
  },
  {
    question: "How does the AI churn prediction work?",
    answer:
      "RetainIQ analyzes behavioral signals, usage patterns, and engagement metrics to assign real-time churn risk scores to each customer, enabling proactive outreach before they leave.",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Head of Customer Success",
    company: "TechFlow SaaS",
    avatar: "SC",
    quote:
      "RetainIQ reduced our churn rate by 34% in the first quarter. The AI predictions are surprisingly accurate — we caught at-risk accounts we would have completely missed.",
  },
  {
    name: "Marcus Rivera",
    role: "CEO",
    company: "GrowthStack",
    avatar: "MR",
    quote:
      "Worth every penny. The Growth plan paid for itself within the first month by saving three enterprise accounts that were about to cancel.",
  },
  {
    name: "Priya Nair",
    role: "VP of Revenue",
    company: "Dataloop",
    avatar: "PN",
    quote:
      "The campaign templates and A/B testing features are incredible. Our retention playbooks have never been more data-driven.",
  },
];

function PlanCard({ plan, index }: { plan: (typeof plans)[0]; index: number }) {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(false);

  const checkoutMutation = trpc.payments.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      setLoadingPlan(false);
    },
  });

  const handleCheckout = () => {
    setLoadingPlan(true);
    checkoutMutation.mutate({ priceId: plan.priceId });
  };

  const isPending = checkoutMutation.isPending || loadingPlan;
  const isPopular = plan.badge === "Most Popular";

  return (
    <Card
      className={`relative flex flex-col transition-all duration-200 hover:-translate-y-1 ${plan.color} ${
        isPopular ? "ring-2 ring-primary" : ""
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <Badge
            className={`px-4 py-1 text-xs font-semibold ${
              isPopular
                ? "bg-primary text-primary-foreground"
                : "bg-orange-500 text-white"
            }`}
          >
            {plan.badge}
          </Badge>
        </div>
      )}

      <CardHeader className={`rounded-t-xl pb-6 pt-8 ${plan.headerColor}`}>
        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
        <div className="mt-4 flex items-end gap-1">
          <span className="text-4xl font-extrabold tracking-tight">
            ${plan.price}
          </span>
          <span className="mb-1 text-muted-foreground">/month</span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-6 pt-6">
        <div className="space-y-3">
          {plan.features.map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-3 w-3 text-primary" strokeWidth={3} />
              </div>
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
          {plan.notIncluded.map((feature) => (
            <div key={feature} className="flex items-start gap-3 opacity-40">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted">
                <Check className="h-3 w-3 text-muted-foreground" strokeWidth={3} />
              </div>
              <span className="text-sm line-through">{feature}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          {user ? (
            <Button
              onClick={handleCheckout}
              disabled={isPending}
              size="lg"
              className={`h-11 w-full text-sm font-semibold ${
                isPopular
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "variant-outline"
              }`}
              variant={isPopular ? "default" : "outline"}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Get Started with {plan.name}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button
                size="lg"
                className={`h-11 w-full text-sm font-semibold`}
                variant={isPopular ? "default" : "outline"}
              >
                Get Started with {plan.name}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </SignInButton>
          )}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            14-day free trial · No credit card required
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-4 text-sm font-semibold md:text-base">{question}</span>
        <span
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-45" : ""
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="10" y1="4" x2="10" y2="16" />
            <line x1="4" y1="10" x2="16" y2="10" />
          </svg>
        </span>
      </button>
      {open && (
        <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
          {answer}
        </p>
      )}
    </div>
  );
}

export default function Pricing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/">
            <span className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
              <Zap className="h-5 w-5 text-primary" />
              RetainIQ
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Home
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-foreground">
              Pricing
            </Link>
            {user ? (
              <Link to="/dashboard">
                <Button size="sm" className="h-9 px-4">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <SignInButton mode="modal">
                <Button size="sm" className="h-9 px-4">
                  Get Started
                </Button>
              </SignInButton>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="17" y2="6" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="14" x2="17" y2="14" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background px-4 pb-4 md:hidden">
            <nav className="flex flex-col gap-1 pt-3">
              <Link
                to="/"
                className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/pricing"
                className="rounded-md bg-muted px-3 py-2.5 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="mt-2">
                {user ? (
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="h-10 w-full px-4">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <SignInButton mode="modal">
                    <Button size="sm" className="h-10 w-full px-4">
                      Get Started
                    </Button>
                  </SignInButton>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-12 pt-16 md:px-8 md:pb-16 md:pt-24">
        {/* Background gradient */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl md:h-96 md:w-96" />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-xs font-medium">
            <Star className="mr-1.5 h-3 w-3 text-yellow-500" />
            Trusted by 2,000+ SaaS companies
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            Simple pricing that{" "}
            <span className="text-primary">scales with you</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground md:text-xl">
            Stop losing customers silently. RetainIQ gives you the AI-powered
            insights and tools to predict churn, engage at-risk users, and grow
            your MRR — all in one platform.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-primary" />
              14-day free trial
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-primary" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-primary" />
              Cancel anytime
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 pb-16 md:px-8 md:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {plans.map((plan, index) => (
              <PlanCard key={plan.name} plan={plan} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Summary */}
      <section className="border-y border-border bg-muted/30 px-4 py-16 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Everything you need to retain customers