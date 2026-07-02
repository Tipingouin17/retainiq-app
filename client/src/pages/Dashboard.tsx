import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import {
  Users,
  TrendingDown,
  AlertTriangle,
  Activity,
  Plus,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Bell,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

function StatCardSkeleton() {
  return (
    <Card className="p-4 md:p-6">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-32" />
    </Card>
  );
}

function CustomerRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border-b last:border-0">
      <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-12" />
    </div>
  );
}

function getHealthColor(status: string) {
  switch (status) {
    case "healthy": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "at_risk": return "bg-amber-100 text-amber-700 border-amber-200";
    case "critical": return "bg-red-100 text-red-700 border-red-200";
    case "churned": return "bg-gray-100 text-gray-600 border-gray-200";
    default: return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function getChurnColor(level: string) {
  switch (level) {
    case "low": return "text-emerald-600";
    case "medium": return "text-amber-600";
    case "high": return "text-orange-600";
    case "very_high": return "text-red-600";
    default: return "text-gray-600";
  }
}

function getScoreColor(score: number) {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  if (score >= 25) return "bg-orange-500";
  return "bg-red-500";
}

function AlertSeverityIcon({ severity }: { severity: string }) {
  if (severity === "high") return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
  if (severity === "medium") return <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />;
  return <Bell className="h-4 w-4 text-blue-500 flex-shrink-0" />;
}

export default function Dashboard() {
  const { user, loading } = useAuth();

  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerCompany, setNewCustomerCompany] = useState("");
  const [newCustomerMRR, setNewCustomerMRR] = useState("");
  const [newCustomerPlan, setNewCustomerPlan] = useState("");
  const [formError, setFormError] = useState("");

  const {
    data: customers,
    isLoading: customersLoading,
    error: customersError,
    refetch: refetchCustomers,
  } = trpc.customers.list.useQuery(undefined, { enabled: !!user });

  const {
    data: alerts,
    isLoading: alertsLoading,
    error: alertsError,
    refetch: refetchAlerts,
  } = trpc.alerts.list.useQuery(undefined, { enabled: !!user });

  const {
    data: playbooks,
    isLoading: playbooksLoading,
  } = trpc.playbooks.list.useQuery(undefined, { enabled: !!user });

  const {
    data: tasks,
    isLoading: tasksLoading,
  } = trpc.tasks.list.useQuery(undefined, { enabled: !!user });

  const utils = trpc.useUtils();

  const createCustomerMutation = trpc.customers.create.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      setAddCustomerOpen(false);
      setNewCustomerName("");
      setNewCustomerEmail("");
      setNewCustomerCompany("");
      setNewCustomerMRR("");
      setNewCustomerPlan("");
      setFormError("");
    },
    onError: (err) => {
      setFormError(err.message || "Failed to create customer.");
    },
  });

  const dismissAlertMutation = trpc.alerts.dismiss.useMutation({
    onSuccess: () => {
      utils.alerts.list.invalidate();
    },
  });

  function handleCreateCustomer() {
    setFormError("");
    if (!newCustomerName.trim()) { setFormError("Customer name is required."); return; }
    if (!newCustomerEmail.trim()) { setFormError("Email is required."); return; }
    createCustomerMutation.mutate({
      name: newCustomerName.trim(),
      email: newCustomerEmail.trim(),
      companyName: newCustomerCompany.trim() || undefined,
      mrr: newCustomerMRR ? newCustomerMRR : "0",
      planName: newCustomerPlan.trim() || undefined,
    });
  }

  const totalCustomers = customers?.length ?? 0;
  const activeCustomers = customers?.filter((c) => c.isActive).length ?? 0;
  const atRiskCustomers = customers?.filter((c) => c.healthStatus === "at_risk" || c.healthStatus === "critical").length ?? 0;
  const totalMRR = customers?.reduce((sum, c) => sum + parseFloat(String(c.mrr ?? "0")), 0) ?? 0;
  const mrrAtRisk = customers
    ?.filter((c) => c.healthStatus === "at_risk" || c.healthStatus === "critical")
    .reduce((sum, c) => sum + parseFloat(String(c.mrr ?? "0")), 0) ?? 0;
  const unreadAlerts = alerts?.filter((a) => !a.isRead && !a.isDismissed).length ?? 0;
  const activePlaybooks = playbooks?.filter((p) => p.status === "active").length ?? 0;
  const openTasks = tasks?.filter((t) => t.status === "open" || t.status === "in_progress").length ?? 0;
  const avgHealthScore = customers && customers.length > 0
    ? Math.round(customers.reduce((sum, c) => sum + (c.healthScore ?? 100), 0) / customers.length)
    : 0;

  const recentAtRisk = customers
    ?.filter((c) => c.healthStatus === "at_risk" || c.healthStatus === "critical")
    .slice(0, 6) ?? [];

  const visibleAlerts = alerts
    ?.filter((a) => !a.isDismissed)
    .slice(0, 5) ?? [];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">

        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}! 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Here's your retention overview for today.
            </p>
          </div>
          <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 px-4 self-start sm:self-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {formError && (
                  <Alert variant="destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Jane Smith"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="jane@acme.com"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
                  <Input
                    placeholder="Acme Corp"
                    value={newCustomerCompany}
                    onChange={(e) => setNewCustomerCompany(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">MRR ($)</label>
                    <Input
                      type="number"
                      placeholder="500"
                      value={newCustomerMRR}
                      onChange={(e) => setNewCustomerMRR(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan</label>
                    <Input
                      placeholder="Growth"
                      value={newCustomerPlan}
                      onChange={(e) => setNewCustomerPlan(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-10"
                    onClick={() => { setAddCustomerOpen(false); setFormError(""); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-10"
                    onClick={handleCreateCustomer}
                    disabled={createCustomerMutation.isPending}
                  >
                    {createCustomerMutation.isPending ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Creating...</>
                    ) : (
                      "Create Customer"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {customersLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Card className="p-4 md:p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">Total Customers</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{activeCustomers}</p>
                    <p className="text-xs text-gray-400 mt-1">{totalCustomers} total tracked</p>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 md:p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">MRR Tracked</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      ${totalMRR >= 1000 ? `${(totalMRR / 1000).toFixed(1)}K` : totalMRR.toFixed(0)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-red-500 font-medium flex items-center gap-0.5">
                        <ArrowDownRight className="h-3 w-3" />
                        ${mrrAtRisk >= 1000 ? `${(mrrAtRisk / 1000).toFixed(1)}K` : mrrAtRisk.toFixed(0)} at risk
                      </span>
                    </div>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 md:p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">At-Risk Customers</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{atRiskCustomers}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {atRiskCustomers > 0 ? (
                        <span className="text-xs text-amber-600 font-medium flex items-center gap-0.5">
                          <AlertTriangle className="h-3 w-3" />
                          Needs attention
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                          <CheckCircle2 className="h-3 w-3" />
                          All healthy
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-4 md:p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">Avg Health Score</p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{avgHealthScore}</p>
                    <div className="mt-2 w-full">
                      <Progress
                        value={avgHealthScore}
                        className="h-1.5"
                      />
                    </div>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {playbooksLoading || tasksLoading || alertsLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Card className="p-4 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Active Playbooks</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{activePlaybooks}</p>
                </div>
              </Card>
              <Card className="p-4 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-orange-50 dark:bg-orange-950 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Open Tasks</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{openTasks}</p>
                </div>
              </Card>
              <Card className="p-4 border border-gray-200 dark:border-gray-700 flex items-center gap-3 col-span-2 md:col-span-1">
                <div className="h-9 w-9 rounded-lg bg-rose-50 dark:bg-rose-950 flex items-center justify-center flex-shrink-0">
                  <Bell className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Unread Alerts</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{unreadAlerts}</p>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Main Content: At-Risk Customers + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* At-Risk Customers */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-200 dark:border-gray-700 h-full">
              <CardHeader className="pb-3 px-4 md:px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-gray-500" />
                    At-Risk Customers
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs text-gray-500"
                    onClick={() => refetchCustomers()}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 md:px-6 pb-4">
                {customersError ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {customersError.message || "Failed to load customers. Please try again."}
                    </AlertDescription>
                  </Alert>
                ) : customersLoading ? (
                  <div className="space-y-1">
                    {[...Array(5)].map((_, i) => <CustomerRowSkeleton key={i} />)}
                  </div>
                ) : recentAtRisk.length === 0 ? (
                  <div className="text-center py-10">
                    <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      No at-risk customers
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">
                      All your customers are healthy right now. Keep it up!
                    </p>
                    {totalCustomers === 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-4"
                        onClick={() => setAddCustomerOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Customer
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
                    {recentAtRisk.map((customer) => (
                      <div
                        key={customer.id}
                        className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-1 px-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white text-sm font-semibold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {customer.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {customer.companyName || customer.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="hidden sm:flex flex-col items-end">
                            <div className="flex items-center gap-1 mb-1">
                              <div className={`h-2 w-2 rounded-full ${getScoreColor(customer.healthScore)}`} />
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                {customer.healthScore}
                              </span>
                            </div>
                            <span className={`text-xs font-medium ${getChurnColor(customer.churnRiskLevel)}`}>
                              {customer.churnRiskLevel.replace("_", " ")} risk
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs border ${getHealthColor(customer.healthStatus)} whitespace-nowrap`}
                          >
                            {customer.healthStatus.replace("_", " ")}
                          </Badge>
                          {customer.mrr && parseFloat(String(customer.mrr)) > 0 && (
                            <span className="hidden md:block text-xs font-semibold text-gray-700 dark:text-gray-300">
                              ${parseFloat(String(customer.mrr)).toFixed(0)}/mo
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!customersLoading && !customersError && customers && customers.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-3 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 w-full"
                      onClick={() => window.location.href = "/dashboard/health"}
                    >
                      View All Customers
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Alerts Panel */}
          <div className="lg:col-span-1">
            <Card className="border border-gray-200 dark:border-gray-700 h-full">
              <CardHeader className="pb-3 px-4 md:px-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
                    <Bell className="h-5 w-5 text-gray-500" />
                    Recent Alerts
                    {unreadAlerts > 0 && (
                      <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-bold bg-red-500 text-white rounded-full">
                        {unreadAlerts}
                      </span>
                    )}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs text-gray-500"
                    onClick={() => refetchAlerts()}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 md:px-6 pb-4">
                {alertsError ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {alertsError.message || "Failed to load alerts."}
                    </AlertDescription>
                  </Alert>
                ) : alertsLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex gap-2">
                        <Skeleton className="h-4 w-4 rounded-full flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <Skeleton className="h-3 w-full mb-1" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : visibleAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No active alerts</p>
                    <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
                    {visibleAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`py-3 first:pt-0 last:pb-0 ${!alert.isRead ? "opacity-100" : "opacity-70"}`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertSeverityIcon severity={alert.severity} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium text-gray-800 dark:text-gray-200 leading-snug ${!alert.isRead ? "font-semibold" : ""}`}>
                              {alert.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                              {alert.message}
                            </p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-xs text-gray-400">
                                {new Date(alert.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-gray-400 hover:text-gray-600"
                                onClick={() => dismissAlertMutation.mutate({ id: alert.id })}
                              >
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3 px-4 md:px-6">
            <CardTitle className="text-base md:text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group"
                onClick={() => setAddCustomerOpen(true)}
              >
                <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Add Customer</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors group"
                onClick={() => window.location.href = "/dashboard/playbooks"}
              >
                <div className="h-9 w-9 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 transition-colors">
                  <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">New Playbook</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-950 hover:border-amber-200 dark:hover:border-amber-800 transition-colors group"
                onClick={() => window.location.href = "/dashboard/churn"}
              >
                <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-800 transition-colors">
                  <TrendingDown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Churn Report</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors group"
                onClick={() => window.location.href = "/dashboard/health"}
              >
                <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors">
                  <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Health Scores</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* All Customers Table */}
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3 px-4 md:px-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-500" />
                All Customers
                {!customersLoading && customers && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {customers.length}
                  </Badge>
                )}
              </CardTitle>
              <Button
                size="sm"
                className="h-9 px-4 text-xs"
                onClick={() => setAddCustomerOpen(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Customer
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {customersError ? (
              <div className="px-4 md:px-6 pb-4">
                <Alert variant="destructive">
                  <AlertDescription>
                    {customersError.message || "Failed to load customers. Please try again."}
                  </AlertDescription>
                </Alert>
              </div>
            ) : customersLoading ? (
              <div className="px-4 md:px-6">
                {[...Array(6)].map((_, i) => <CustomerRowSkeleton key={i} />)}
              </div>
            ) : !customers || customers.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  No customers yet
                </h3>
                <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
                  Add your first customer to start tracking health scores and predicting churn.
                </p>
                <Button
                  className="h-10 px-6"
                  onClick={() => setAddCustomerOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Customer
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                        Plan
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                        MRR
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Health
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                        Score
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                        Churn Risk
                      </th>
                      <th className="text-right px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                        Last Active
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
                      >
                        <td className="px-4 md:px-6 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                                {customer.name}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {customer.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 hidden md:table-cell">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {customer.planName || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3 hidden sm:table-cell">
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {customer.mrr && parseFloat(String(customer.mrr)) > 0
                              ? `$${parseFloat(String(customer.mrr)).toFixed(0)}`
                              : "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <Badge
                            variant="outline"
                            className={`text-xs border ${getHealthColor(customer.healthStatus)}`}
                          >
                            {customer.healthStatus.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 flex-shrink-0">
                              <div
                                className={`h-1.5 rounded-full ${getScoreColor(customer.healthScore)}`}
                                style={{ width: `${Math.min(100, Math.max(0, customer.healthScore))}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">
                              {customer.healthScore}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 hidden lg:table-cell">
                          <span className={`text-xs font-medium capitalize ${getChurnColor(customer.churnRiskLevel)}`}>
                            {customer.churnRiskLevel.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 text-right hidden md:table-cell">
                          <span className="text-xs text-gray-400">
                            {customer.lastActivityAt
                              ? new Date(customer.lastActivityAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                              : "Never"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}