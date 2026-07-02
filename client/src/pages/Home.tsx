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
  TrendingDown,
  Activity,
  Brain,
  Zap,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Users,
  Shield,
  Star,
  DollarSign,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  };

  const staggerChildren = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.15 },
  };

  const cardFade = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  };

  const features = [
    {
      icon: <Activity className="w-7 h-7 text-violet-500" />,
      title: "Customer Health Tracking",
      headline: "Know Your Customer's Health Before They Leave",
      description:
        "Stop guessing about customer satisfaction. RetainIQ continuously monitors customer engagement patterns, usage trends, and health signals across your entire customer base. Get real-time visibility into who's thriving and who's at risk—so you can intervene before it's too late.",
      badge: "Real-Time",
    },
    {
      icon: <Brain className="w-7 h-7 text-violet-500" />,
      title: "Predictive Churn Intelligence",
      headline: "Predict Churn with 85%+ Accuracy",
      description:
        "Our AI-powered churn engine analyzes hundreds of behavioral signals to predict which customers are likely to cancel in the next 30, 60, or 90 days. Identify at-risk accounts automatically, prioritize your retention efforts, and focus your team's energy where it matters most.",
      badge: "AI-Powered",
    },
    {
      icon: <Zap className="w-7 h-7 text-violet-500" />,
      title: "Automated Retention Playbooks",
      headline: "Turn Predictions Into Action—Automatically",
      description:
        "Create if-this-then-that retention workflows that execute instantly. When a customer triggers a churn signal, RetainIQ automatically sends personalized outreach, adjusts pricing, or alerts your CSM—without manual intervention. Your retention team works 24/7.",
      badge: "Automation",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$100",
      period: "/month",
      description: "Perfect for early-stage SaaS teams getting started with retention.",
      features: [
        "Up to 500 tracked customers",
        "Customer health dashboards",
        "Basic churn risk scores",
        "Email alert notifications",
        "2 retention playbooks",
        "Standard support",
      ],
      cta: "Start Free Trial",
      highlighted: false,
    },
    {
      name: "Growth",
      price: "$249",
      period: "/month",
      description: "The full retention engine for growing SaaS companies scaling fast.",
      features: [
        "Up to 2,500 tracked customers",
        "Advanced health scoring",
        "AI churn predictions (85%+ accuracy)",
        "Unlimited retention playbooks",
        "Slack + CRM integrations",
        "Priority support",
        "Quarterly strategy review",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Scale",
      price: "$500",
      period: "/month",
      description: "Enterprise-grade retention for high-growth teams with larger customer bases.",
      features: [
        "Unlimited tracked customers",
        "Custom health score models",
        "30/60/90-day churn forecasting",
        "Advanced automation workflows",
        "Custom integrations & API",
        "Dedicated CSM",
        "White-glove onboarding",
      ],
      cta: "Start Free Trial",
      highlighted: false,
    },
  ];

  const stats = [
    { value: "85%+", label: "Churn prediction accuracy" },
    { value: "3.2×", label: "Average retention improvement" },
    { value: "$500", label: "Max monthly cost vs $50K+ competitors" },
    { value: "14 days", label: "Free trial, no credit card" },
  ];

  const problems = [
    {
      icon: <DollarSign className="w-5 h-5 text-red-400" />,
      text: "Enterprise churn tools cost $12,000–$50,000+ per year—priced out of reach for most startups.",
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
      text: "You only find out a customer is leaving when they send the cancellation email.",
    },
    {
      icon: <Users className="w-5 h-5 text-red-400" />,
      text: "Your CS team is flying blind, manually tracking health in spreadsheets with no automation.",
    },
  ];

  const solutions = [
    {
      icon: <CheckCircle2 className="w-5 h-5 text-violet-400" />,
      text: "RetainIQ starts at $100/month—a fraction of what enterprise tools charge for the same power.",
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-violet-400" />,
      text: "Predict churn 30, 60, or 90 days out so you can intervene before customers decide to leave.",
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-violet-400" />,
      text: "Automated playbooks handle outreach, discounts, and CSM alerts—so you never miss a save.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans antialiased">
      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Retain<span className="text-violet-400">IQ</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">
                Pricing
              </a>
              <SignedIn>
                <Link to="/dashboard" className="text-sm text-white/60 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </SignedIn>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
                    Sign In
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-500 text-white h-9 px-4 rounded-lg font-medium transition-all"
                  >
                    Start Free Trial
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard">
                  <Button
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-500 text-white h-9 px-4 rounded-lg font-medium"
                  >
                    Dashboard
                  </Button>
                </Link>
              </SignedIn>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#0d0d14] px-4 py-4 flex flex-col gap-3">
            <a
              href="#features"
              className="text-sm text-white/70 hover:text-white py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-white/70 hover:text-white py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <SignedIn>
              <Link
                to="/dashboard"
                className="text-sm text-white/70 hover:text-white py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </SignedIn>
            <div className="pt-2 flex flex-col gap-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="outline" className="w-full border-white/10 text-white bg-transparent hover:bg-white/5">
                    Sign In
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white">
                    Start Free Trial
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white">
                    Go to Dashboard
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4 md:px-8 lg:px-16">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-violet-800/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
            <Badge className="mb-6 bg-violet-500/10 text-violet-400 border border-violet-500/20 px-4 py-1.5 text-xs font-medium rounded-full">
              ✦ Built for SaaS teams under $5M ARR
            </Badge>
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Stop Losing Customers
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
              You Could Have Saved
            </span>
          </motion.h1>

          <motion.p
            className="text-base md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Enterprise-grade churn prediction and retention automation for SaaS teams that can't afford $50,000/year solutions. Start protecting your revenue from{" "}
            <span className="text-white font-medium">$100/month</span>.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white h-12 px-8 text-base font-semibold rounded-xl transition-all shadow-lg shadow-violet-600/25 hover:shadow-violet-500/30"
                >
                  Start Protecting Revenue Today
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full sm:w-auto text-white/70 hover:text-white hover:bg-white/5 h-12 px-6 text-base rounded-xl"
                >
                  See How It Works
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white h-12 px-8 text-base font-semibold rounded-xl shadow-lg shadow-violet-600/25"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </SignedIn>
          </motion.div>

          <motion.p
            className="mt-4 text-sm text-white/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            14-day free trial · No credit card required · Cancel anytime
          </motion.p>
        </div>

        {/* Hero Stats Bar */}
        <motion.div
          className="relative max-w-4xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#0d0d14] px-6 py-5 text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-white/45 leading-snug">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── PROBLEM / SOLUTION ── */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-[#0d0d14]">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-14" {...fadeUp}>
            <Badge className="mb-4 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 text-xs rounded-full">
              The Problem
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 tracking-tight">
              Growing SaaS Teams Are Stuck in a{" "}
              <span className="text-red-400">Retention Blind Spot</span>
            </h2>
            <p className="text-white/55 max-w-xl mx-auto text-base md:text-lg">
              You're losing customers you could have saved—and the tools that solve this are priced for enterprises, not you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            {/* Problems */}
            <motion.div
              className="bg-[#12111a] border border-red-500/10 rounded-2xl p-6 md:p-8"
              {...cardFade}
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <span className="text-sm font-semibold text-red-400 uppercase tracking-wider">Before RetainIQ</span>
              </div>
              <div className="flex flex-col gap-5">
                {problems.map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <p className="text-white/65 text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Solutions */}
            <motion.div
              className="bg-[#12111a] border border-violet-500/15 rounded-2xl p-6 md:p-8"
              {...cardFade}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-violet-400" />
                <span className="text-sm font-semibold text-violet-400 uppercase tracking-wider">With RetainIQ</span>
              </div>
              <div className="flex flex-col gap-5">
                {solutions.map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <p className="text-white/65 text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-4 md:px-8 lg:px-16 bg-[#0a0a0f]">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-14" {...fadeUp}>
            <Badge className="mb-4 bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1 text-xs rounded-full">
              Platform Features
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 tracking-tight">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
                Stop Churn
              </span>
            </h2>
            <p className="text-white/55 max-w-xl mx-auto text-base md:text-lg">
              RetainIQ packs enterprise retention power into an affordable, easy-to-use platform built specifically for growing SaaS teams.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={{
              initial: {},
              whileInView: { transition: { staggerChildren: 0.12 } },
            }}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={{
                  initial: { opacity: 0, y: 24 },
                  whileInView: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-[#0d0d14] border border-white/5 rounded-2xl h-full hover:border-violet-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5 group">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/15 transition-colors">
                      {feature.icon}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-violet-500/10 text-violet-400 border-0 text-xs px-2 py-0.5">
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold text-white leading-snug">
                      {feature.headline}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/55 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SOCIAL PROOF / TRUST ── */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-[#0d0d14] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-10" {...fadeUp}>
            <p className="text-white/35 text-sm uppercase tracking-widest font-medium">
              Trusted by retention-focused SaaS teams
            </p>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            {...staggerChildren}
          >
            {[
              {
                quote:
                  "We went from losing 8% of customers monthly to under 2%. RetainIQ paid for itself in the first week.",
                name: "Sarah K.",
                role: "Head of Customer Success",
                company: "DevFlow SaaS",
                stars: 5,
              },
              {
                quote:
                  "We couldn't justify $30K/year for Gainsight. RetainIQ gave us the same insights at a price that made sense for our stage.",
                name: "Marcus T.",
                role: "Co-founder & CEO",
                company: "Loopable",
                stars: 5,
              },
              {
                quote:
                  "The automated playbooks are a game-changer. Our CSM team now focuses on expansion instead of firefighting.",
                name: "Priya M.",
                role: "VP of Growth",
                company: "Notionery",
                stars: 5,
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-[#0a0a0f] border border-white/5 rounded-2xl h-full p-6">
                  <CardContent className="p-0">
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: testimonial.stars }).map((_, s) => (
                        <Star key={s} className="w-4 h-4 fill-violet-400 text-violet-400" />
                      ))}
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed mb-5">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                        <p className="text-xs text-white/45">
                          {testimonial.role} · {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 px-4 md:px-8 lg:px-16 bg-[#0a0a0f]">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-14" {...fadeUp}>
            <Badge className="mb-4 bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1 text-xs rounded-full">
              Simple Pricing
            </Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 tracking-tight">
              Enterprise Power.{" "}
              <span className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
                Startup-Friendly Pricing.
              </span>
            </h2>
            <p className="text-white/55 max-w-xl mx-auto text-base md:text-lg">
              All plans include a 14-day free trial. No credit card required. Cancel anytime.
              Compare to $12,000–$50,000/year alternatives.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex"
              >
                <Card
                  className={`flex flex-col w-full rounded-2xl transition-all duration-300 ${
                    plan.highlighted
                      ? "bg-gradient-to-b from-violet-600/15 to-violet-900/5 border-2 border-violet-500/40 shadow-2xl shadow-violet-500/10 relative"
                      : "bg-[#0d0d14] border border-white/5 hover:border-white/10"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-violet-600 text-white border-0 px-4 py-1 text-xs font-semibold shadow-lg">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pt-8 pb-4">
                    <p className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">{plan.name}</p>
                    <div className="flex items-end gap-1 mb-3">
                      <span className="text-4xl md:text-5xl font-bold text-white">{plan.price}</span>
                      <span className="text-white/40 text-base mb-1.5">{plan.period}</span>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="flex flex-col gap-3 mb-8 flex-1">
                      {plan.features.map((feature, fi) => (
                        <li key={fi} className="flex items-start gap-2.5">
                          <CheckCircle2
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              plan.highlighted ? "text-violet-400" : "text-violet-500/70"
                            }`}
                          />
                          <span className="text-sm text-white/65">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <SignedOut>
                      <SignInButton mode="modal">
                        <Button
                          className={`w-full h-11 rounded-xl font-semibold text-sm transition-all ${
                            plan.highlighted
                              ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25"
                              : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                          }`}
                        >
                          {plan.cta}
                          <ChevronRight className="ml-1 w-4 h-4" />
                        </Button>
                      </SignInButton>
                    </SignedOut>
                    <SignedIn>
                      <Link to="/dashboard">
                        <Button
                          className={`w-full h-11 rounded-xl font-semibold text-sm transition-all ${
                            plan.highlighted
                              ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25"
                              : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                          }`}
                        >
                          Go to Dashboard
                          <ChevronRight className="ml-1 w-4 h-4" />
                        </Button>
                      </Link>
                    </SignedIn>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-white/35 text-sm">
              Need a custom plan?{" "}
              <span className="text-violet-400 cursor-pointer hover:text-violet-300 transition-colors">
                Contact us for enterprise pricing
              </span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-[#0d0d14]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="relative rounded-3xl bg-gradient-to-br from-violet-600/20 to-violet-900/10 border border-violet-500/20 p-10 md:p-16 text-center overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Glow effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-60 h-32 bg-violet-800/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <Badge className="mb-5 bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1 text-xs rounded-full">
                ✦ 14-Day Free Trial
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold mb-4 tracking-tight leading-tight">
                Every Day You Wait,{" "}
                <span className="bg-gradient-to-r from-violet-400 to-violet-500 bg-clip-text text-transparent">
                  More Customers Slip Away
                </span>
              </h2>
              <p className="text-white/55 max-w-lg mx-auto mb-8 text-base md:text-lg leading-relaxed">
                Join SaaS teams who use RetainIQ to predict churn before it happens, automate retention, and protect the revenue they've worked hard to earn.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white h-12 px-10 text-base font-semibold rounded-xl shadow-lg shadow-violet-600/30 hover:shadow-violet-500/35 transition-all"
                    >
                      Get a Free 14-Day Trial
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link to="/dashboard">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white h-12 px-10 text-base font-semibold rounded-xl shadow-lg shadow-violet-600/30"
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </SignedIn>
              </div>
              <p className="mt-4 text-sm text-white/30">
                No credit card required · Setup in under 10 minutes · Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0a0a0f] border-t border-white/5 py-10 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-bold text-white">
                Retain<span className="text-violet-400">IQ</span>
              </span>
            </Link>

            {/* Links */}
            <div className="flex items-center gap-6">
              <a href="#features" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                Pricing
              </a>
              <SignedIn>
                <Link to="/dashboard" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                  Dashboard
                </Link>
              </SignedIn>
            </div>

            {/* Copyright */}
            <p className="text-sm text-white/30">
              © {new Date().getFullYear()} RetainIQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}