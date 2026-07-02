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
      "Up to 1,000 customers tracked",
      "Basic churn prediction",
      "Email alerts & notifications",
      "3 retention playbooks",
      "CSV data import",
      "Email support",
      "Standard analytics dashboard",
      "Monthly reports",
    ],
    notIncluded: [
      "Advanced AI segmentation",
      "Custom integrations",
      "Priority support",
      "White-label options",
    ],
    cta: "Start with Starter",
    highlight: false,
  },
  {
    name: "Growth",
    price: 250,
    description: "For growing companies that need deeper insights and automation.",
    badge: "Most Popular",
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
    features: [
      "Up to 10,000 customers tracked",
      "Advanced churn prediction AI",
      "Real-time alerts & webhooks",
      "Unlimited retention playbooks",
      "CRM & Helpdesk integrations",
      "Priority email & chat support",
      "Advanced analytics & cohorts",
      "Weekly automated reports",
      "A/B testing for campaigns",
      "Custom audience segments",
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
    description: "Full-featured retention platform for large teams and enterprises.",
    badge: "Best Value",
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
    features: [
      "Unlimited customers tracked",
      "Enterprise AI & ML models",
      "Real-time alerts & webhooks",
      "Unlimited retention playbooks",
      "All integrations + custom APIs",
      "Dedicated account manager",
      "Full analytics suite + exports",
      "Daily automated reports",
      "A/B testing + multivariate",
      "Custom audience segments",
      "White-label options",
      "SLA guarantee (99.9% uptime)",
      "SSO & advanced security",
      "Onboarding & training sessions",
    ],
    notIncluded: [],
    cta: "Go Enterprise",
    highlight: false,
  },
];

const faqs = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "We offer a 14-day free trial on all plans. No credit card required to get started.",
  },
  {
    question: "What counts as a 'tracked customer'?",
    answer:
      "A tracked customer is any unique end-user whose behavior and retention metrics are actively monitored in your RetainIQ dashboard.",
  },
  {
    question: "Do you offer annual billing?",
    answer:
      "Yes! Annual billing saves you 20% compared to monthly billing. Contact our sales team to switch.",
  },
  {
    question: "What integrations are supported?",
    answer:
      "We support Salesforce, HubSpot, Intercom, Zendesk, Segment, and many more. Enterprise plans include custom API integrations.",
  },
  {
    question: "How secure is my data?",
    answer:
      "All data is encrypted in transit and at rest. We're SOC 2 Type II compliant and GDPR ready.",
  },
];

function PlanCard({ plan, index }: { plan: (typeof plans)[0]; index: number }) {
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
      className={`relative flex flex-col h-full transition-all duration-200 ${
        plan.highlight
          ? "border-2 border-primary shadow-2xl scale-[1.02] bg-primary/5"
          : "border border-border hover:border-primary/40 hover:shadow-lg"
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <Badge
            className={`px-4 py-1 text-xs font-semibold uppercase tracking-wide ${
              plan.highlight
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {plan.badge}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4 pt-8 px-6">
        <div className="flex items-center gap-2 mb-2">
          <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
        <div className="mt-4 flex items-end gap-1">
          <span className="text-4xl font-extrabold tracking-tight">${plan.price}</span>
          <span className="text-muted-foreground text-sm mb-1.5">/month</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-6 px-6 pb-8">
        <div className="space-y-2.5">
          {plan.features.map((feature) => (
            <div key={feature} className="flex items-start gap-2.5">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground leading-snug">{feature}</span>
            </div>
          ))}
          {plan.notIncluded.map((feature) => (
            <div key={feature} className="flex items-start gap-2.5 opacity-40">
              <div className="h-4 w-4 mt-0.5 flex-shrink-0 flex items-center justify-center">
                <div className="h-px w-3 bg-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground leading-snug line-through">
                {feature}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-2">
          {user ? (
            <Button
              onClick={handleCheckout}
              disabled={checkoutMutation.isPending}
              className={`w-full h-11 font-semibold text-sm transition-all ${
                plan.highlight
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                  : "variant-outline"
              }`}
              variant={plan.highlight ? "default" : "outline"}
            >
              {checkoutMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting…
                </span>
              ) : (
                plan.cta
              )}
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button
                className={`w-full h-11 font-semibold text-sm ${
                  plan.highlight
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                    : ""
                }`}
                variant={plan.highlight ? "default" : "outline"}
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/">
            <span className="text-xl font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
              RetainIQ
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" className="h-9 px-3 text-sm">
                Home
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button className="h-9 px-4 text-sm">Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <Badge className="mb-4 px-3 py-1 text-xs font-medium bg-primary/10 text-primary border-primary/20">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Retain more customers.
            <br />
            <span className="text-primary">Grow faster.</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Choose the plan that fits your team. All plans include a 14-day free trial —
            no credit card required.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
            {plans.map((plan, index) => (
              <PlanCard key={plan.name} plan={plan} index={index} />
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            All prices in USD. Cancel anytime. Need a custom plan?{" "}
            <a
              href="mailto:sales@retainiq.com"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Contact sales
            </a>
            .
          </p>
        </div>
      </section>

      {/* Feature Comparison Highlights */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-muted/40 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Everything you need to reduce churn
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              RetainIQ gives your team the tools to identify at-risk customers and act before
              it's too late.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <BarChart3 className="h-5 w-5 text-primary" />,
                title: "Predictive Analytics",
                description:
                  "AI-powered churn scoring identifies at-risk customers before they cancel.",
              },
              {
                icon: <Bell className="h-5 w-5 text-primary" />,
                title: "Smart Alerts",
                description:
                  "Get notified instantly when key health signals drop for any customer.",
              },
              {
                icon: <RefreshCw className="h-5 w-5 text-primary" />,
                title: "Retention Playbooks",
                description:
                  "Automated workflows trigger the right action at the right time.",
              },
              {
                icon: <Users className="h-5 w-5 text-primary" />,
                title: "Audience Segments",
                description:
                  "Group customers by behavior, plan, usage, and dozens of other signals.",
              },
              {
                icon: <Shield className="h-5 w-5 text-primary" />,
                title: "Enterprise Security",
                description:
                  "SOC 2 Type II, GDPR-compliant, SSO, and end-to-end encryption.",
              },
              {
                icon: <Zap className="h-5 w-5 text-primary" />,
                title: "Instant Integrations",
                description:
                  "Connect to your CRM, helpdesk, and data warehouse in minutes.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-4 p-5 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Still have questions? Email us at{" "}
              <a
                href="mailto:support@retainiq.com"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                support@retainiq.com
              </a>
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-border rounded-xl overflow-hidden bg-background hover:border-primary/30 transition-colors"
              >
                <button
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                >
                  <span className="font-medium text-sm">{faq.question}</span>
                  <span
                    className={`flex-shrink-0 h-5 w-5 rounded-full border border-border flex items-center justify-center transition-transform duration-200 ${
                      openFaq === index ? "rotate-45 border-primary" : ""
                    }`}
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 12 12"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M6 2v8M2 6h8" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-4 leading-tight">
            Start retaining customers today
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-sm md:text-base max-w-xl mx-auto">
            Join hundreds of SaaS companies using RetainIQ to reduce churn, increase LTV,
            and build better customer relationships.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="h-12 px-8 bg-background text-foreground hover:bg-background/90 font-semibold text-sm shadow-lg"
              >
                Start free 14-day trial
              </Button>
            </SignInButton>
            <a href="mailto:sales@retainiq.com">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-sm w-full sm:w-auto"
              >
                Talk to sales
              </Button>
            </a>
          </div>
          <p className="mt-5 text-xs text-primary-foreground/60">
            No credit card required •