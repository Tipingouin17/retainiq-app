import { useState } from "react";
import { Link } from "wouter";
import { SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Activity,
  Brain,
  Zap,
  TrendingDown,
  DollarSign,
  Shield,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Users,
  Bell,
  Star,
} from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  };

  const features = [
    {
      icon: Activity,
      title: "Customer Health Tracking",
      headline: "Know Your Customer's Health Before They Leave",
      description:
        "Stop guessing about customer satisfaction. RetainIQ continuously monitors customer engagement patterns, usage trends, and health signals across your entire customer base. Get real-time visibility into who's thriving and who's at risk—so you can intervene before it's too late.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Brain,
      title: "Predictive Churn Intelligence",
      headline: "Predict Churn with 85%+ Accuracy",
      description:
        "Our AI-powered churn engine analyzes hundreds of behavioral signals to predict which customers are likely to cancel in the next 30, 60, or 90 days. Identify at-risk accounts automatically, prioritize your retention efforts, and focus your team's energy where it matters most.",
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      icon: Zap,
      title: "Automated Retention Playbooks",
      headline: "Turn Predictions Into Action—Automatically",
      description:
        "Create if-this-then-that retention workflows that execute instantly. When a customer triggers a churn signal, RetainIQ automatically sends personalized outreach, adjusts pricing, or alerts your CSM—without manual intervention. Your retention team works 24/7.",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$100",
      period: "/month",
      description: "Perfect for early-stage SaaS with up to 200 customers.",
      features: [
        "Up to 200 tracked customers",
        "Customer health dashboards",
        "Basic churn risk scoring",
        "Email alerts for at-risk accounts",
        "3 retention playbook templates",
        "Slack integration",
      ],
      cta: "Start Free Trial",
      highlight: false,
    },
    {
      name: "Growth",
      price: "$250",
      period: "/month",
      description: "Built for scaling teams with deeper AI insights.",
      features: [
        "Up to 1,000 tracked customers",
        "85%+ accuracy churn predictions",
        "30/60/90-day churn forecasting",
        "Unlimited retention playbooks",
        "Automated CSM alerts & outreach",
        "CRM & Intercom integrations",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlight: true,
    },
    {
      name: "Scale",
      price: "$500",
      period: "/month",
      description: "For established SaaS companies protecting serious revenue.",
      features: [
        "Unlimited tracked customers",
        "Advanced AI behavioral analysis",
        "Custom churn models",
        "White-glove onboarding",
        "Dedicated success manager",
        "API access & webhooks",
        "Custom integrations",
        "SLA guarantee",
      ],
      cta: "Start Free Trial",
      highlight: false,
    },
  ];

  const stats = [
    { value: "85%+", label: "Churn prediction accuracy" },
    { value: "3x", label: "Average ROI in 90 days" },
    { value: "24/7", label: "Automated retention coverage" },
    { value: "$50K", label: "Saved vs. enterprise alternatives" },
  ];

  const problems = [
    {
      icon: DollarSign,
      title: "Enterprise tools cost $12,000–$50,000+/year",
      description:
        "Gainsight, Totango, and ChurnZero are built for enterprise budgets. Early-stage SaaS teams simply can't access the same churn-prevention power.",
    },
    {
      icon: TrendingDown,
      title: "Churn silently kills your growth",
      description:
        "Even a 5% monthly churn rate compounds into losing 46% of your customer base every year. Most teams don't even see it happening until it's too late.",
    },
    {
      icon: Users,
      title: "Manual tracking doesn't scale",
      description:
        "Spreadsheets and gut feelings fail as your customer base grows. Without automated signals, you'll always be reacting instead of preventing.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight">
                  Retain<span className="text-violet-600">IQ</span>
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </a>
              <SignedIn>
                <Link to="/dashboard">
                  <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Dashboard
                  </span>
                </Link>
              </SignedIn>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="h-9 px-4">
                    Sign In
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button
                    size="sm"
                    className="h-9 px-4 bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    Start Free Trial
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard">
                  <Button
                    size="sm"
                    className="h-9 px-4 bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              </SignedIn>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-md hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
            <a
              href="#features"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <SignedIn>
              <Link to="/dashboard">
                <span
                  className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </span>
              </Link>
            </SignedIn>
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="outline" className="w-full h-10">
                    Sign In
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button className="w-full h-10 bg-violet-600 hover:bg-violet-700 text-white">
                    Start Free Trial
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard">
                  <Button className="w-full h-10 bg-violet-600 hover:bg-violet-700 text-white">
                    Go to Dashboard
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-950/20 via-background to-background pt-16 pb-24 px-4 md:px-8 lg:px-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/10 rounded-full blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl text-center">
          <motion.div {...fadeUp}>
            <Badge
              variant="secondary"
              className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-violet-500/10 text-violet-400 border-violet-500/20"
            >
              <Star className="h-3 w-3" />
              Affordable Churn Prevention for Growing SaaS Startups
            </Badge>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6"
          >
            Stop Losing Customers
            <br />
            <span className="text-violet-500">You Could Have Saved</span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto max-w-2xl text-base md:text-lg text-muted-foreground mb-10 leading-relaxed"
          >
            Enterprise-grade churn prediction and retention automation for SaaS
            teams that can't afford $50,000/year solutions. Starting at just{" "}
            <span className="text-foreground font-semibold">$100/month</span>.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-violet-600 hover:bg-violet-700 text-white text-base font-semibold shadow-lg shadow-violet-500/25"
                >
                  Start Protecting Revenue Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-violet-600 hover:bg-violet-700 text-white text-base font-semibold shadow-lg shadow-violet-500/25"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </SignedIn>
            <p className="text-sm text-muted-foreground">
              14-day free trial · No credit card required
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 border border-border/50 rounded-2xl bg-card/50 backdrop-blur p-6 md:p-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-violet-400">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <motion.div
            {...fadeUp}
            className="text-center mb-14"
          >
            <Badge
              variant="secondary"
              className="mb-4 bg-red-500/10 text-red-400 border-red-500/20"
            >
              The Problem
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
              Churn is killing your growth.
              <br />
              <span className="text-muted-foreground font-normal">
                And you can't afford the tools to stop it.
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-base md:text-lg">
              Early-stage SaaS companies face a brutal reality: the tools that
              prevent churn cost more than most seed-stage revenues can support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {problems.map((problem, i) => (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="h-full border-border/50 bg-card/60">
                  <CardHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 mb-3">
                      <problem.icon className="h-5 w-5 text-red-400" />
                    </div>
                    <CardTitle className="text-base md:text-lg">
                      {problem.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {problem.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 md:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="text-center mb-14">
            <Badge
              variant="secondary"
              className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/20"
            >
              The Solution
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
              Everything you need to{" "}
              <span className="text-violet-500">stop churn</span>
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground text-base md:text-lg">
              RetainIQ gives growing SaaS teams the same churn-fighting
              capabilities as enterprise tools—at a fraction of the cost.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <Card className="h-full border-border/50 hover:border-violet-500/30 transition-colors bg-card/60 hover:bg-card">
                  <CardHeader>
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg} mb-4`}
                    >
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <Badge
                      variant="outline"
                      className="w-fit mb-2 text-xs font-medium"
                    >
                      {feature.title}
                    </Badge>
                    <CardTitle className="text-base md:text-lg leading-snug">
                      {feature.headline}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Feature Details Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-12 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 md:p-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl md:text-2xl font-bold mb-3">
                  Built for SaaS teams that move fast
                </h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">
                  RetainIQ integrates with your existing stack in minutes—not
                  months. No professional services required, no enterprise
                  contracts, no bloated feature sets you'll never use.
                </p>
                <ul className="space-y-3">
                  {[
                    "Connect your data sources in under 10 minutes",
                    "Pre-built integrations with Stripe, Intercom, Slack",
                    "No data science team required",
                    "Actionable insights from day one",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: Bell,
                    label: "Smart Alerts",
                    desc: "Get notified the moment a customer shows churn signals",
                  },
                  {
                    icon: Shield,
                    label: "Revenue Protection",
                    desc: "Automated playbooks that execute before customers leave",
                  },
                  {
                    icon: BarChart3,
                    label: "Health Scores",
                    desc: "Real-time composite scores for every account",
                  },
                  {
                    icon: Users,
                    label: "CSM Workflows",
                    desc: "Route at-risk accounts to the right team member instantly",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-border/50 bg-card p-4"
                  >
                    <item.icon className="h-5 w-5 text-violet-400 mb-2" />
                    <p className="text-sm font-semibold mb-1">{item.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-20 px-4 md:px-8 lg:px-16 bg-muted/30"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="text-center mb-14">
            <Badge
              variant="secondary"
              className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            >
              Pricing
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
              Transparent pricing.{" "}
              <span className="text-emerald-500">No surprises.</span>
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground text-base md:text-lg">
              Start at $100/month and scale as you grow. Cancel anytime. Every
              plan includes a 14-day free trial.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative"
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-violet-600 text-white border-0 px-3 py-1 text-xs font-semibold shadow-lg">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card
                  className={`h-full flex flex-col transition-all ${
                    plan.highlight
                      ? "border-violet-500/60 shadow-xl shadow-violet-500/10 bg-card"
                      : "border-border/50 bg-card/60"
                  }`}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl md:text-4xl font-bold">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {plan.period}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {plan.description}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-2.5 mb-8 flex-1">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm"
                        >
                          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <SignedOut>
                      <SignInButton mode="modal">
                        <Button
                          className={`w-full h-11 font-semibold ${
                            plan.highlight
                              ? "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20"
                              : "variant-outline"
                          }`}
                          variant={plan.highlight ? "default" : "outline"}
                        >
                          {plan.cta}
                        </Button>
                      </SignInButton>
                    </SignedOut>
                    <SignedIn>
                      <Link to="/dashboard">
                        <Button
                          className={`w-full h-11 font-semibold ${
                            plan.highlight
                              ? "bg-violet-600 hover:bg-violet-700 text-white"
                              : ""
                          }`}
                          variant={plan.highlight ? "default" : "outline"}
                        >
                          Go to Dashboard
                        </Button>
                      </Link>
                    </SignedIn>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            All plans include a 14-day free trial. No credit card required to
            start. Cancel anytime.
          </motion.p>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
              Why founders choose{" "}
              <span className="text-violet-500">RetainIQ</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Get enterprise-grade retention tools without the enterprise price
              tag.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="overflow-x-auto"
          >
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium border-b border-border">
                    Feature
                  </th>
                  <th className="py-3 px-4 border-b border-border">
                    <span className="text-muted-foreground font-medium">
                      Enterprise Tools
                    </span>
                    <br />
                    <span className="text-xs text-red-400">$12K–$50K/yr</span>
                  </th>
                  <th className="py-3 px-4 border-b border-violet-500/30 bg-violet-500/5 rounded-t-lg">
                    <span className="text-violet-400 font-semibold">
                      RetainIQ
                    </span>
                    <br />
                    <span className="text-xs text-emerald-400">
                      $100–$500/mo
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Churn prediction AI", true, true],
                  ["Customer health scores", true, true],
                  ["Automated playbooks", true, true],
                  ["Quick 10-min setup", false, true],
                  ["No professional services", false, true],
                  ["Startup-friendly pricing", false, true],
                  ["Month-to-month billing", false, true],
                  ["85%+ prediction accuracy", true, true],
                ].map(([feature, enterprise, retainiq], i) => (
                  <tr
                    key={String(feature)}
                    className={i % 2 === 0 ? "bg-muted/20" : ""}
                  >
                    <td className="py-3 px-4 text-muted-foreground">
                      {String(feature)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {enterprise ? (
                        <CheckCircle className="h-4 w-4 text-muted-foreground/50 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-red-400/60 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center bg-violet-500/5">
                      {retainiq ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-red-400 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-background to-violet-950/20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div {...fadeUp}>
            <Badge
              variant="secondary"
              className="mb-6 bg-violet-500/10 text-violet-400 border-violet-500/20"
            >
              Get Started Today
            </Badge>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Every day you wait,
              <br />
              <span className="text-violet-500">more customers are leaving.</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg mb-10 leading-relaxed">
              Don't let churn compound silently. RetainIQ pays for itself the
              moment it saves your first at-risk customer. Start your free
              14-day trial now—no credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-violet-600 hover:bg-violet-700 text-white text-base font-semibold shadow-xl shadow-violet-500/25 w-full sm:w-auto"
                  >
                    Get a Free 14-Day Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-violet-600 hover:bg-violet-700 text-white text-base font-semibold shadow-xl shadow-violet-500/25 w-full sm:w-auto"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </SignedIn>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              {[
                "14-day free trial",
                "No credit card required",
                "Cancel anytime",
                "Setup in 10 minutes",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/20 py-10 px-4 md:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
                <BarChart3 className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-base font-bold">
                Retain<span className="text-violet-500">IQ</span>
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <a
                href="#features"
                className="hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="hover:text-foreground transition-colors"
              >
                Pricing
              </a>
              <span className="text-muted-foreground/50">Privacy Policy</span>
              <span className="text-muted-foreground/50">Terms of Service</span>
            </div>

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} RetainIQ. All rights reserved.
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-border/30 text-center text-xs text-muted-foreground/60">
            Affordable churn prevention for growing SaaS startups. Starting at
            $100/month.
          </div>
        </div>
      </footer>
    </div>
  );
}