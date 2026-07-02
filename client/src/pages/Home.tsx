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
  Users,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Bell,
  Target,
  Shield,
  Clock,
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

  const features = [
    {
      icon: <Activity className="w-6 h-6 text-violet-400" />,
      title: "Customer Health Tracking",
      headline: "Know Your Customer's Health Before They Leave",
      description:
        "Stop guessing about customer satisfaction. RetainIQ continuously monitors customer engagement patterns, usage trends, and health signals across your entire customer base. Get real-time visibility into who's thriving and who's at risk—so you can intervene before it's too late.",
      color: "from-violet-500/10 to-violet-500/5",
      border: "border-violet-500/20",
    },
    {
      icon: <Brain className="w-6 h-6 text-blue-400" />,
      title: "Predictive Churn Intelligence",
      headline: "Predict Churn with 85%+ Accuracy",
      description:
        "Our AI-powered churn engine analyzes hundreds of behavioral signals to predict which customers are likely to cancel in the next 30, 60, or 90 days. Identify at-risk accounts automatically, prioritize your retention efforts, and focus your team's energy where it matters most.",
      color: "from-blue-500/10 to-blue-500/5",
      border: "border-blue-500/20",
    },
    {
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      title: "Automated Retention Playbooks",
      headline: "Turn Predictions Into Action—Automatically",
      description:
        "Create if-this-then-that retention workflows that execute instantly. When a customer triggers a churn signal, RetainIQ automatically sends personalized outreach, adjusts pricing, or alerts your CSM—without manual intervention. Your retention team works 24/7.",
      color: "from-emerald-500/10 to-emerald-500/5",
      border: "border-emerald-500/20",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$100",
      period: "/month",
      description: "Perfect for early-stage startups with up to 200 customers",
      highlight: false,
      features: [
        "Up to 200 tracked customers",
        "Basic health score dashboard",
        "Churn risk alerts",
        "Email retention playbooks",
        "30-day churn predictions",
        "Slack notifications",
        "Email support",
      ],
      cta: "Start Free Trial",
      badge: null,
    },
    {
      name: "Growth",
      price: "$250",
      period: "/month",
      description: "Built for scaling teams managing up to 1,000 customers",
      highlight: true,
      features: [
        "Up to 1,000 tracked customers",
        "Advanced health scoring",
        "AI churn predictions (85%+ accuracy)",
        "Automated multi-channel playbooks",
        "30/60/90-day predictions",
        "CRM integrations",
        "Priority support",
        "Custom health metrics",
      ],
      cta: "Start Free Trial",
      badge: "Most Popular",
    },
    {
      name: "Scale",
      price: "$500",
      period: "/month",
      description: "For growth-stage companies with complex retention needs",
      highlight: false,
      features: [
        "Unlimited tracked customers",
        "Custom AI model training",
        "Full playbook automation suite",
        "Advanced segmentation",
        "Revenue impact forecasting",
        "API access",
        "Dedicated CSM",
        "White-glove onboarding",
        "Custom integrations",
      ],
      cta: "Start Free Trial",
      badge: null,
    },
  ];

  const painPoints = [
    {
      icon: <DollarSign className="w-5 h-5 text-red-400" />,
      text: "Enterprise churn tools cost $12,000–$50,000+ per year",
    },
    {
      icon: <TrendingDown className="w-5 h-5 text-red-400" />,
      text: "You only find out customers are leaving when they cancel",
    },
    {
      icon: <Users className="w-5 h-5 text-red-400" />,
      text: "Your CS team is too small to monitor every account manually",
    },
    {
      icon: <Clock className="w-5 h-5 text-red-400" />,
      text: "Manual check-ins miss the early warning signs every time",
    },
  ];

  const solutions = [
    {
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      text: "Full churn prevention suite starting at just $100/month",
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      text: "Spot at-risk customers 30–90 days before they consider leaving",
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      text: "Automated playbooks that work even when your team is asleep",
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      text: "Up and running in under 30 minutes with no engineering needed",
    },
  ];

  const stats = [
    { value: "85%+", label: "Churn Prediction Accuracy" },
    { value: "3.2×", label: "Average Retention Improvement" },
    { value: "< 30min", label: "Time to First Insight" },
    { value: "$100/mo", label: "Starting Price (vs. $50K/yr)" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 antialiased">
      {/* Sticky Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">
                  RetainIQ
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="#features"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-500 text-white h-9 px-4"
                  >
                    Start Free Trial
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard">
                  <Button
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-500 text-white h-9 px-4"
                  >
                    Dashboard
                  </Button>
                </Link>
              </SignedIn>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-4 flex flex-col gap-4">
            <a
              href="#features"
              className="text-sm text-gray-300 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-gray-300 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <SignedIn>
              <Link to="/dashboard">
                <span
                  className="text-sm text-gray-300 hover:text-white transition-colors py-2 block cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </span>
              </Link>
            </SignedIn>
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-800">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-gray-300 hover:text-white h-10"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white h-10">
                    Start Free Trial
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link to="/dashboard">
                  <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white h-10">
                    Go to Dashboard
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 md:px-8 lg:px-16 relative overflow-hidden">
          {/* Background gradient blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-3xl" />
            <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-blue-600/8 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto relative">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              {...fadeUp}
            >
              <Badge className="mb-6 bg-violet-500/10 text-violet-300 border-violet-500/30 hover:bg-violet-500/20 px-4 py-1.5 text-sm">
                Affordable Churn Prevention for Growing SaaS Startups
              </Badge>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
                Stop Losing Customers{" "}
                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  You Could Have Saved
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Enterprise-grade churn prediction and retention automation for
                SaaS teams that can't afford $50,000/year solutions. Starting
                at just $100/month.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button
                      size="lg"
                      className="bg-violet-600 hover:bg-violet-500 text-white h-12 px-8 text-base font-semibold w-full sm:w-auto shadow-lg shadow-violet-500/20"
                    >
                      Start Protecting Revenue Today
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link to="/dashboard">
                    <Button
                      size="lg"
                      className="bg-violet-600 hover:bg-violet-500 text-white h-12 px-8 text-base font-semibold w-full sm:w-auto shadow-lg shadow-violet-500/20"
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </SignedIn>
                <a href="#pricing">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 h-12 px-8 text-base w-full sm:w-auto bg-transparent"
                  >
                    See Pricing
                  </Button>
                </a>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                No credit card required · 14-day free trial · Cancel anytime
              </p>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 md:p-5 text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Problem / Solution Section */}
        <section className="py-16 md:py-24 px-4 md:px-8 lg:px-16 bg-gray-900/40">
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-12" {...fadeUp}>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                The Churn Problem Nobody's Solving{" "}
                <span className="text-violet-400">for You</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
                Every early-stage SaaS founder knows the pain of preventable
                churn. The tools to fix it exist—but they're priced for
                enterprises, not startups.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Pain Points */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 md:p-8 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      The Problem
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {painPoints.map((point, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0">{point.icon}</div>
                        <p className="text-gray-300 text-sm md:text-base">
                          {point.text}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                    <p className="text-red-300 text-sm font-medium">
                      💸 The average SaaS company loses 5–7% of revenue to
                      preventable churn every single month.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Solutions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 md:p-8 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      The RetainIQ Solution
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {solutions.map((solution, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0">
                          {solution.icon}
                        </div>
                        <p className="text-gray-300 text-sm md:text-base">
                          {solution.text}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <p className="text-emerald-300 text-sm font-medium">
                      ✅ RetainIQ customers see an average 3.2× improvement in
                      retention within 90 days.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-16 md:py-24 px-4 md:px-8 lg:px-16"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-12 md:mb-16" {...fadeUp}>
              <Badge className="mb-4 bg-blue-500/10 text-blue-300 border-blue-500/30 px-4 py-1.5 text-sm">
                Everything You Need
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                Three Pillars of{" "}
                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  Proactive Retention
                </span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
                RetainIQ gives you the complete toolkit to monitor, predict, and
                act on churn risk—all in one affordable platform.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerChildren}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
            >
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    whileInView: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Card
                    className={`bg-gradient-to-b ${feature.color} border ${feature.border} rounded-2xl h-full hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 bg-gray-900/50`}
                  >
                    <CardHeader className="pb-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-800/80 flex items-center justify-center mb-4 border border-gray-700">
                        {feature.icon}
                      </div>
                      <Badge
                        variant="outline"
                        className="w-fit text-xs border-gray-700 text-gray-500 mb-2"
                      >
                        {feature.title}
                      </Badge>
                      <CardTitle className="text-lg md:text-xl text-white leading-snug">
                        {feature.headline}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Additional capability highlights */}
            <motion.div
              className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {[
                {
                  icon: <Bell className="w-4 h-4 text-violet-400" />,
                  label: "Instant Risk Alerts",
                },
                {
                  icon: <Target className="w-4 h-4 text-blue-400" />,
                  label: "Account Segmentation",
                },
                {
                  icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
                  label: "Revenue Impact Reports",
                },
                {
                  icon: <Zap className="w-4 h-4 text-amber-400" />,
                  label: "CRM & Slack Integrations",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-sm text-gray-300 font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section
          id="pricing"
          className="py-16 md:py-24 px-4 md:px-8 lg:px-16 bg-gray-900/40"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-12 md:mb-16" {...fadeUp}>
              <Badge className="mb-4 bg-emerald-500/10 text-emerald-300 border-emerald-500/30 px-4 py-1.5 text-sm">
                Simple, Startup-Friendly Pricing
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                Enterprise Power at{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  Startup Prices
                </span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
                While competitors charge $12,000–$50,000+ per year, RetainIQ
                gives you the same enterprise-grade retention tools starting at
                just $100/month.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {pricingPlans.map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative"
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-violet-600 text-white border-0 px-4 py-1 text-xs font-semibold shadow-lg shadow-violet-500/30">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <Card
                    className={`h-full rounded-2xl transition-all duration-300 ${
                      plan.highlight
                        ? "bg-gradient-to-b from-violet-900/40 to-gray-900/80 border-violet-500/40 shadow-xl shadow-violet-500/10 scale-[1.02]"
                        : "bg-gray-900/60 border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg text-white">
                        {plan.name}
                      </CardTitle>
                      <p className="text-gray-400 text-sm mt-1">
                        {plan.description}
                      </p>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span
                          className={`text-4xl md:text-5xl font-bold ${plan.highlight ? "text-violet-300" : "text-white"}`}
                        >
                          {plan.price}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {plan.period}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, fi) => (
                          <li key={fi} className="flex items-start gap-2.5">
                            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">
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
                                ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                                : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
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
                            className={`w-full h-11 font-semibold ${
                              plan.highlight
                                ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                                : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
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
              className="mt-10 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="text-gray-500 text-sm">
                All plans include a 14-day free trial. No credit card required.
                Cancel anytime.
              </p>
              <p className="text-gray-600 text-xs mt-2">
                Compare to Gainsight ($50,000+/yr) · ChurnZero ($12,000+/yr) ·
                Totango ($20,000+/yr)
              </p>
            </motion.div>
          </div>
        </section>

        {/* Social Proof / Trust Section */}
        <section className="py-16 md:py-20 px-4 md:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-12" {...fadeUp}>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Built for the Realities of Early-Stage SaaS
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                RetainIQ was designed from the ground up for founders and CS
                teams who need real results without enterprise budgets.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Clock className="w-6 h-6 text-violet-400" />,
                  title: "Up and Running in 30 Minutes",
                  description:
                    "Connect your data sources, configure your health scores, and start seeing at-risk customers—all without a single line of code or a lengthy enterprise onboarding process.",
                },
                {
                  icon: <Target className="w-6 h-6 text-blue-400" />,
                  title: "No Data Science Degree Required",
                  description:
                    "Our AI models are pre-trained on SaaS churn patterns. You get 85%+ prediction accuracy out of the box—no model training, no data team, no months of setup.",
                },
                {
                  icon: <DollarSign className="w-6 h-6 text-emerald-400" />,
                  title: "ROI in Your First Month",
                  description:
                    "Saving even one $500 MRR customer per month pays for your entire RetainIQ subscription. Most teams save dozens of customers—every single month.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 h-full hover:border-gray-700 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mb-4">
                      {item.icon}
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="py-16 md:py-24 px-4 md:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="relative bg-gradient-to-br from-violet-900/40 via-gray-900 to-blue-900/30 border border-violet-500/20 rounded-3xl p-8 md:p-12 lg:p-16 text-center overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <Badge className="mb-6 bg-violet-500/10 text-violet-300 border-violet-500/30 px-4 py-1.5 text-sm">
                  14-Day Free Trial — No Credit Card Required
                </Badge>
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  Every Day You Wait Is{" "}
                  <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                    Revenue Walking Out the Door
                  </span>
                </h2>
                <p className="text-gray-300 text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                  Join the growing number of SaaS founders who've stopped
                  accepting churn as inevitable. Get a free 14-day trial and see
                  exactly which customers are at risk—within 30 minutes of
                  signing up.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button
                        size="lg"
                        className="bg-violet-600 hover:bg-violet-500 text-white h-12 px-10 text-base font-semibold shadow-lg shadow-violet-500/30 w-full sm:w-auto"
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
                        className="bg-violet-600 hover:bg-violet-500 text-white h-12 px-10 text-base font-semibold shadow-lg shadow-violet-500/30 w-full sm:w-auto"
                      >
                        Go to Dashboard
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </SignedIn>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
                  {[
                    "✓ No credit card required",
                    "✓ Setup in 30 minutes",
                    "✓ Cancel anytime",
                  ].map((item, i) => (
                    <span key={i} className="text-sm text-gray-500">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-10 px-4 md:px-8 lg:px-16 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-bold text-white">RetainIQ</span>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Affordable Churn Prevention for Growing SaaS Startups
            </p>
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} RetainIQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}