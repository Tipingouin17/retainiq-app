import { useState } from "react";
import { Check, Zap, Shield, Users, BarChart3, Bell, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInButton } from "@clerk/clerk-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const plans = [
  {
    name: "Starter",
    price: 100,
    description: "Perfect for small teams getting started with customer retention.",
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_STARTER || import.meta.env.VITE_STRIPE_PRICE_ID,
    badge: null,
    features: [
      "Up to 500 tracked customers",
      "Basic retention analytics",
      "Email campaign automation",
      "3 retention workflows",
      "Standard email support",
      "CSV data export",
      "7-day data retention history",
    ],
    notIncluded: [
      "Advanced AI predictions",
      "Custom integrations",
      "Dedicated account manager",
    ],
  },
  {
    name: "Growth",
    price: 250,
    description: "For growing businesses that need deeper insights and automation.",
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_GROWTH || import.meta.env.VITE_STRIPE_PRICE_ID,
    badge: "Most Popular",
    features: [
      "Up to 5,000 tracked customers",
      "Advanced retention analytics",
      "Email & SMS campaign automation",
      "Unlimited retention workflows",
      "AI-powered churn predictions",
      "Priority email & chat support",
      "90-day data retention history",
      "Slack & Zapier integrations",
      "A/B testing for campaigns",
    ],
    notIncluded: [
      "Dedicated account manager",
    ],
  },
  {
    name: "Enterprise",
    price: 500,
    description: "Full-featured retention engine for large teams and complex needs.",
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_ENTERPRISE || import.meta.env.VITE_STRIPE_PRICE_ID,
    badge: "Best Value",
    features: [
      "Unlimited tracked customers",
      "Full retention analytics suite",
      "Omnichannel campaign automation",
      "Unlimited retention workflows",
      "Advanced AI churn predictions",
      "Dedicated account manager",
      "Unlimited data retention history",
      "Custom integrations & API access",
      "A/B testing for campaigns",
      "White-label reporting",
      "SLA guarantee (99.9% uptime)",
      "Custom onboarding & training",
    ],
    notIncluded: [],
  },
];

const faqs = [
  {
    question: "Can I switch plans at any time?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "Is there a free trial?",
    answer: "We offer a 14-day free trial on all plans. No credit card required to get started.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express) as well as ACH bank transfers for annual plans.",
  },
  {
    question: "Can I cancel my subscription?",
    answer: "You can cancel at any time with no penalties. Your access continues until the end of your current billing period.",
  },
  {
    question: "Do you offer annual billing discounts?",
    answer: "Yes! Annual billing saves you 20% compared to monthly billing. Contact us to set up annual billing.",
  },
  {
    question: "What counts as a 'tracked customer'?",
    answer: "A tracked customer is any end-user whose behavior and engagement data is actively monitored within RetainIQ for retention analysis.",
  },
];

function PlanCard({
  plan,
  isPopular,
}: {
  plan: (typeof plans)[0];
  isPopular: boolean;
}) {
  const { user } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const checkoutMutation = trpc.payments.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      setIsRedirecting(false);
    },
  });

  const handleCheckout = () => {
    setIsRedirecting(true);
    checkoutMutation.mutate({ priceId: plan.priceId });
  };

  const isPending = checkoutMutation.isPending || isRedirecting;

  return (
    <Card
      className={`relative flex flex-col transition-all duration-200 hover:shadow-xl ${
        isPopular
          ? "border-2 border-blue-500 shadow-lg shadow-blue-500/10 scale-105"
          : "border border-gray-200 dark:border-gray-700 hover:border-blue-300"
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span
            className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${
              isPopular ? "bg-blue-500" : "bg-emerald-500"
            }`}
          >
            {plan.badge}
          </span>
        </div>
      )}

      <CardHeader className="pb-4 pt-8 px-6">
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
          {plan.name}
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 min-h-[40px]">
          {plan.description}
        </p>
        <div className="mt-4 flex items-end gap-1">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
            ${plan.price}
          </span>
          <span className="text-gray-500 dark:text-gray-400 mb-1">/month</span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 px-6 pb-8 gap-6">
        <div className="space-y-3">
          {plan.features.map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" strokeWidth={3} />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
            </div>
          ))}
          {plan.notIncluded.map((feature) => (
            <div key={feature} className="flex items-start gap-3 opacity-40">
              <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <span className="w-3 h-0.5 bg-gray-400 rounded-full block" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-500 line-through">
                {feature}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-2">
          {user ? (
            <Button
              onClick={handleCheckout}
              disabled={isPending}
              className={`w-full h-11 font-semibold text-sm transition-all ${
                isPopular
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                  : "bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              }`}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting...
                </span>
              ) : (
                `Get Started with ${plan.name}`
              )}
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button
                className={`w-full h-11 font-semibold text-sm transition-all ${
                  isPopular
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                    : "bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                }`}
              >
                Get Started with {plan.name}
              </Button>
            </SignInButton>
          )}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
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
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {question}
        </span>
        <span
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center transition-transform duration-200 ${
            open ? "rotate-45 border-blue-500" : ""
          }`}
        >
          <span className="text-gray-500 dark:text-gray-400 text-lg leading-none mt-[-2px]">+</span>
        </span>
      </button>
      {open && (
        <div className="pb-5">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function Pricing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-white" />
              </div>
              RetainIQ
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/pricing" className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Pricing
              </Link>
              {user ? (
                <Link to="/dashboard">
                  <Button size="sm" className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <Button size="sm" className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white">
                    Sign In
                  </Button>
                </SignInButton>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span
                className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
              />
              <span
                className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all ${mobileMenuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
              />
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-3">
              <Link
                to="/pricing"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              {user ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <Button className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white">
                    Sign In
                  </Button>
                </SignInButton>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-950 pt-16 pb-20 px-4 md:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6">
            <Zap className="w-3.5 h-3.5" />
            Simple, transparent pricing
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
            Retain more customers.{" "}
            <span className="text-blue-600 dark:text-blue-400">Grow faster.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Choose the plan that fits your team size and ambition. All plans include a 14-day free trial — no credit card needed.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              No setup fees
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              14-day free trial
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} isPopular={i === 1} />
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-8">
          All prices in USD. Billed monthly.{" "}
          <span className="text-blue-600 dark:text-blue-400 font-medium">
            Save 20% with annual billing
          </span>{" "}
          — contact us to upgrade.
        </p>
      </section>

      {/* Feature Comparison Summary */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Everything you need to reduce churn
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              RetainIQ gives your team the tools, data, and automation to keep customers engaged and loyal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg: