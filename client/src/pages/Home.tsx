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
  CheckCircle,
  ArrowRight,
  BarChart3,
  Users,
  Bell,
  Shield,
  Clock,
  Target,
  ChevronRight,
  Star,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay: i * 0.1 },
});

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const features = [
    {
      icon: <Activity className="h-7 w-7 text-violet-500" />,
      title: "Customer Health Tracking",
      headline: "Know Your Customer's Health Before They Leave",
      description:
        "Stop guessing about customer satisfaction. RetainIQ continuously monitors customer engagement patterns, usage trends, and health signals across your entire customer base. Get real-time visibility into who's thriving and who's at risk—so you can intervene before it's too late.",
    },
    {
      icon: <Brain className="h-7 w-7 text-violet-500" />,
      title: "Predictive Churn Intelligence",
      headline: "Predict Churn with 85%+ Accuracy",
      description:
        "Our AI-powered churn engine analyzes hundreds of behavioral signals to predict which customers are likely to cancel in the next 30, 60, or 90 days. Identify at-risk accounts automatically, prioritize your retention efforts, and focus your team's energy where it matters most.",
    },
    {
      icon: <Zap className="h-7 w-7 text-violet-500" />,
      title: "Automated Retention Playbooks",
      headline: "Turn Predictions Into Action—Automatically",
      description:
        "Create if-this-then-that retention workflows that execute instantly. When a customer triggers a churn signal, RetainIQ automatically sends personalized outreach, adjusts pricing, or alerts your CSM—without manual intervention. Your retention team works 24/7.",
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
        "Email alert notifications",
        "CSV data import",
        "Email support",
      ],
      cta: "Start Free Trial",
      highlighted: false,
    },
    {
      name: "Growth",
      price: "$250",
      period: "/month",
      description: "For scaling SaaS teams serious about retention.",
      features: [
        "Up to 1,000 tracked customers",
        "AI churn prediction (85%+ accuracy)",
        "30/60/90-day risk forecasting",
        "Automated retention playbooks",
        "CRM & Slack integrations",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Scale",
      price: "$500",
      period: "/month",
      description: "Full power for companies protecting significant MRR.",
      features: [
        "Unlimited tracked customers",
        "Advanced AI churn modeling",
        "Custom retention workflows",
        "API access & webhooks",
        "Dedicated CSM onboarding",
        "SLA-backed support",
      ],
      cta: "Start Free Trial",
      highlighted: false,
    },
  ];

  const stats = [
    { value: "85%+", label: "Churn prediction accuracy" },
    { value: "3x", label: "Faster retention response time" },
    { value: "$50K", label: "Saved vs. enterprise alternatives" },
    { value: "14 days", label: "Free trial, no credit card" },
  ];

  const problems = [
    {
      icon: <DollarSign className="h-5 w-5 text-red-400" />,
      text: "Enterprise churn tools cost $12,000–$50,000+ per year—out of reach for most startups.",
    },
    {
      icon: <TrendingDown className="h-5 w-5 text-red-400" />,
      text: "You only discover customers are churning when they cancel—too late to act.",
    },
    {
      icon: <Clock className="h-5 w-5 text-red-400" />,
      text: "Your CS team manually combs through data instead of actually saving accounts.",
    },
  ];

  const solutions = [
    {
      icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
      text: "Affordable plans starting at $100/month—built specifically for growing SaaS teams.",
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
      text: "AI predicts churn 30–90 days before it happens so you intervene while there's still time.",
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
      text: "Automated playbooks handle outreach and escalations while your team sleeps.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight">RetainIQ</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
                Pricing
              </a>
              <SignedIn>
                <Link to="/dashboard">
                  <span className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
                    Dashboard
                  </span>
                </Link>
              </SignedIn>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                    Sign In
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white h-9 px-4">
                    Start Free Trial
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard">
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white h-9 px-4">
                    Go to Dashboard
                  </Button>
                </Link>
              </SignedIn>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-md text-gray-400 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="md:hidden border-t border-white/10 py-4 flex flex-col gap-4">
              <a
                href="#features"
                className="text-sm text-gray-400 hover:text-white transition-colors px-1"
                onClick={() => setMobileOpen(false)}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm text-gray-400 hover:text-white transition-colors px-1"
                onClick={() => setMobileOpen(false)}
              >
                Pricing
              </a>
              <SignedIn>
                <Link to="/dashboard">
                  <span
                    className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer px-1"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </span>
                </Link>
              </SignedIn>
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="ghost" className="w-full justify-start text-gray-300">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white h-10">
                      Start Free Trial
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link to="/dashboard">
                    <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white h-10">
                      Go to Dashboard
                    </Button>
                  </Link>
                </SignedIn>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-4 md:px-8 lg:px-16 pt-20 pb-24 md:pt-32 md:pb-36">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-violet-700/20 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div {...stagger(0)}>
            <Badge className="mb-6 inline-flex items-center gap-1.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1 text-xs font-medium rounded-full">
              <Star className="h-3 w-3 fill-violet-400" />
              Now in Early Access — 14-Day Free Trial
            </Badge>
          </motion.div>

          <motion.h1
            {...stagger(1)}
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6"
          >
            Stop Losing Customers{" "}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              You Could Have Saved
            </span>
          </motion.h1>

          <motion.p
            {...stagger(2)}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Enterprise-grade churn prediction and retention automation for SaaS teams that can't afford $50,000/year
            solutions. Starting at just <span className="text-white font-semibold">$100/month</span>.
          </motion.p>

          <motion.div {...stagger(3)} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-base rounded-xl shadow-lg shadow-violet-900/40"
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
                  className="w-full sm:w-auto h-12 px-8 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-base rounded-xl shadow-lg shadow-violet-900/40"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </SignedIn>
            <a href="#pricing">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 px-8 border-white/20 text-gray-300 hover:text-white hover:bg-white/5 text-base rounded-xl"
              >
                View Pricing
              </Button>
            </a>
          </motion.div>

          <motion.p {...stagger(4)} className="mt-5 text-sm text-gray-500">
            No credit card required · Cancel anytime · Setup in under 10 minutes
          </motion.p>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-white/10 bg-white/[0.02] px-4 md:px-8 py-10">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} {...stagger(i)} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-violet-400 mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM / SOLUTION ── */}
      <section className="px-4 md:px-8 lg:px-16 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              The Churn Problem Is{" "}
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Costing You More Than You Think
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
              Most SaaS startups discover churn too late—and the tools built to fix it cost more than your entire
              marketing budget.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Problems */}
            <motion.div
              {...stagger(0)}
              className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6 md:p-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingDown className="h-5 w-5 text-red-400" />
                <h3 className="font-semibold text-red-300 text-sm uppercase tracking-wider">The Problem</h3>
              </div>
              <div className="flex flex-col gap-5">
                {problems.map((p, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{p.icon}</div>
                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">{p.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Solutions */}
            <motion.div
              {...stagger(1)}
              className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-6 md:p-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-5 w-5 text-emerald-400" />
                <h3 className="font-semibold text-emerald-300 text-sm uppercase tracking-wider">The RetainIQ Fix</h3>
              </div>
              <div className="flex flex-col gap-5">
                {solutions.map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{s.icon}</div>
                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="px-4 md:px-8 lg:px-16 py-20 md:py-28 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="text-center mb-14">
            <Badge className="mb-4 bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1 text-xs rounded-full">
              Platform Features
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Retain More Revenue
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
              Three powerful capabilities working together to protect your MRR—without enterprise complexity or
              enterprise pricing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} {...stagger(i)}>
                <Card className="h-full bg-white/[0.03] border border-white/10 rounded-2xl hover:border-violet-500/40 hover:bg-white/[0.05] transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                      {f.icon}
                    </div>
                    <div className="text-xs text-violet-400 font-medium uppercase tracking-wider mb-1">
                      {f.title}
                    </div>
                    <CardTitle className="text-base md:text-lg font-bold text-white leading-snug">
                      {f.headline}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Feature highlights row */}
          <motion.div
            {...fadeUp}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { icon: <Bell className="h-4 w-4" />, label: "Real-time alerts" },
              { icon: <Users className="h-4 w-4" />, label: "CSM workflow sync" },
              { icon: <Target className="h-4 w-4" />, label: "Segmentation engine" },
              { icon: <BarChart3 className="h-4 w-4" />, label: "Revenue analytics" },
            ].map((item, i) => (
              <div
                key={item.label}
                className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <div className="text-violet-400">{item.icon}</div>
                <span className="text-sm text-gray-300">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="px-4 md:px-8 lg:px-16 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="text-center mb-14">
            <Badge className="mb-4 bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1 text-xs rounded-full">
              Simple Pricing
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Predictable Pricing.{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                No Surprises.
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-base md:text-lg">
              From $100 to $500/month—a fraction of what enterprise solutions charge. Every plan includes a 14-day free
              trial with no credit card required.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {pricingPlans.map((plan, i) => (
              <motion.div key={plan.name} {...stagger(i)} className="flex">
                <Card
                  className={`flex flex-col w-full rounded-2xl transition-all duration-300 ${
                    plan.highlighted
                      ? "bg-violet-600/20 border-2 border-violet-500 shadow-xl shadow-violet-900/30 scale-[1.02]"
                      : "bg-white/[0.03] border border-white/10 hover:border-white/20"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="text-center pt-4">
                      <Badge className="bg-violet-500 text-white text-xs px-3 py-0.5 rounded-full font-semibold">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className={`pb-4 ${plan.highlighted ? "pt-3" : "pt-6"}`}>
                    <CardTitle className="text-lg font-bold text-white">{plan.name}</CardTitle>
                    <div className="flex items-end gap-1 mt-2">
                      <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                      <span className="text-gray-400 text-sm mb-1.5">{plan.period}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2 leading-relaxed">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 gap-4">
                    <ul className="flex flex-col gap-3 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <CheckCircle className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-4">
                      <SignedOut>
                        <SignInButton mode="modal">
                          <Button
                            className={`w-full h-11 font-semibold rounded-xl ${
                              plan.highlighted
                                ? "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/40"
                                : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                            }`}
                          >
                            {plan.cta}
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </SignInButton>
                      </SignedOut>
                      <SignedIn>
                        <Link to="/dashboard">
                          <Button
                            className={`w-full h-11 font-semibold rounded-xl ${
                              plan.highlighted
                                ? "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/40"
                                : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                            }`}
                          >
                            Go to Dashboard
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </Link>
                      </SignedIn>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.p {...fadeUp} className="text-center text-sm text-gray-500 mt-8">
            All plans include 14-day free trial · No credit card required · Cancel anytime · Annual billing saves 20%
          </motion.p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-4 md:px-8 lg:px-16 py-20 md:py-28 bg-white/[0.02] border-t border-white/10">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-2 text-sm text-violet-400 mb-8">
              <Shield className="h-4 w-4" />
              Your MRR deserves protection
            </div>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
              Get a Free 14-Day Trial.{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Save Your First Customer This Week.
              </span>
            </h2>
            <p className="text-gray-400 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Join SaaS teams already using RetainIQ to spot churn risk early, automate retention outreach, and protect
              revenue—without blowing their budget on enterprise tooling.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-base rounded-xl shadow-lg shadow-violet-900/40"
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
                    className="h-12 px-8 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-base rounded-xl shadow-lg shadow-violet-900/40"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </SignedIn>
              <a href="#pricing">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 border-white/20 text-gray-300 hover:text-white hover:bg-white/5 text-base rounded-xl"
                >
                  View Pricing Plans
                </Button>
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> 14-day full access
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Cancel anytime
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 px-4 md:px-8 lg:px-16 py-10">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
              <BarChart3 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-white">RetainIQ</span>
            <span className="text-gray-500 text-sm ml-2">Affordable Churn Prevention for Growing SaaS Startups</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-300 transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-gray-300 transition-colors">
              Pricing
            </a>
            <span>© {new Date().getFullYear()} RetainIQ. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}