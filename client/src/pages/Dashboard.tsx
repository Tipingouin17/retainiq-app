import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import {
  Users,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Plus,
  Activity,
  Heart,
  Bell,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-2xl md:text-3xl font-bold mt-1 truncate">{value}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
            {trendValue && (
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
                {trendValue}
              </div>
            )}
          </div>
          <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0 ml-3`}>
            <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HealthStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    healthy: { label: "Healthy", className: "bg-green-100 text-green-700 border-green-200" },
    at_risk: { label: "At Risk", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    critical: { label: "Critical", className: "bg-red-100 text-red-700 border-red-200" },
    churned: { label: "Churned", className: "bg-gray-100 text-gray-700 border-gray-200" },
  };
  const c = config[status] ?? config["healthy"];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${c.className}`}>
      {c.label}
    </span>
  );
}

function PlaybookStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-green-100 text-green-700 border-green-200" },
    paused: { label: "Paused", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    archived: { label: "Archived", className: "bg-gray-100 text-gray-700 border-gray-200" },
    draft: { label: "Draft", className: "bg-blue-100 text-blue-700 border-blue-200" },
  };
  const c = config[status] ?? config["draft"];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${c.className}`}>
      {c.label}
    </span>
  );
}

function AlertSeverityIcon({ severity }: { severity: string }) {
  if (severity === "critical") return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
  if (severity === "warning") return <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
  return <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />;
}

export default function Dashboard() {
  const { user, loading } = useAuth();

  const { data: customers, isLoading: customersLoading, error: customersError } = trpc.customers.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: playbooks, isLoading: playbooksLoading, error: playbooksError } = trpc.playbooks.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: alerts, isLoading: alertsLoading, error: alertsError } = trpc.alerts.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: tasks, isLoading: tasksLoading } = trpc.tasks.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  const createCustomerMutation = trpc.customers.create.useMutation({
    onSuccess: () => {
      trpc.useUtils().customers.list.invalidate();
      setCreateCustomerOpen(false);
      setNewCustomerName("");
      setNewCustomerEmail("");
      setNewCustomerCompany("");
      setNewCustomerMrr("");
      setNewCustomerPlan("starter");
    },
  });

  const dismissAlertMutation = trpc.alerts.dismiss.useMutation({
    onSuccess: () => {
      trpc.useUtils().alerts.list.invalidate();
    },
  });

  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerCompany, setNewCustomerCompany] = useState("");
  const [newCustomerMrr, setNewCustomerMrr] = useState("");
  const [newCustomerPlan, setNewCustomerPlan] = useState("starter");

  const handleCreateCustomer = () => {
    if (!newCustomerName.trim() || !newCustomerEmail.trim()) return;
    createCustomerMutation.mutate({
      name: newCustomerName.trim(),
      email: newCustomerEmail.trim(),
      companyName: newCustomerCompany.trim() || undefined,
      mrr: newCustomerMrr ? parseFloat(newCustomerMrr) : 0,
      plan: newCustomerPlan,
    });
  };

  const totalMrr = customers?.reduce((sum, c) => sum + parseFloat(String(c.mrr ?? "0")), 0) ?? 0;
  const atRiskCount = customers?.filter((c) => c.healthStatus === "at_risk" || c.healthStatus === "critical").length ?? 0;
  const healthyCount = customers?.filter((c) => c.healthStatus === "healthy").length ?? 0;
  const activePlaybooks = playbooks?.filter((p) => p.status === "active").length ?? 0;
  const unreadAlerts = alerts?.filter((a) => !a.isRead && !a.isDismissed).length ?? 0;
  const openTasks = tasks?.filter((t) => t.status === "open" || t.status === "in_progress").length ?? 0;

  const recentCustomers = customers?.slice(0, 6) ?? [];
  const recentAlerts = alerts?.filter((a) => !a.isDismissed).slice(0, 5) ?? [];
  const recentPlaybooks = playbooks?.slice(0, 4) ?? [];

  const anyError = customersError || playbooksError || alertsError;
  const mainLoading = customersLoading || playbooksLoading || alertsLoading || tasksLoading;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {user?.firstName ?? user?.username ?? "there"} 👋
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Here's your customer retention overview for today.
            </p>
          </div>
          <Dialog open={createCustomerOpen} onOpenChange={setCreateCustomerOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 px-4 gap-2 w-full sm:w-auto" onClick={() => setCreateCustomerOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="customer-name">Full Name *</Label>
                  <Input
                    id="customer-name"
                    placeholder="Jane Smith"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-email">Email Address *</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    placeholder="jane@company.com"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-company">Company Name</Label>
                  <Input
                    id="customer-company"
                    placeholder="Acme Corp"
                    value={newCustomerCompany}
                    onChange={(e) => setNewCustomerCompany(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="customer-mrr">MRR ($)</Label>
                    <Input
                      id="customer-mrr"
                      type="number"
                      placeholder="500"
                      min="0"
                      value={newCustomerMrr}
                      onChange={(e) => setNewCustomerMrr(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-plan">Plan</Label>
                    <Select value={newCustomerPlan} onValueChange={setNewCustomerPlan}>
                      <SelectTrigger id="customer-plan">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="growth">Growth</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {createCustomerMutation.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{createCustomerMutation.error.message}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-10"
                    onClick={() => setCreateCustomerOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-10"
                    onClick={handleCreateCustomer}
                    disabled={createCustomerMutation.isPending || !newCustomerName.trim() || !newCustomerEmail.trim()}
                  >
                    {createCustomerMutation.isPending ? "Adding..." : "Add Customer"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Error State */}
        {anyError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {customersError?.message ?? playbooksError?.message ?? alertsError?.message ?? "Failed to load dashboard data. Please refresh."}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {mainLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 md:p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <StatCard
                title="Total MRR"
                value={`$${totalMrr.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                subtitle={`Across ${customers?.length ?? 0} customers`}
                icon={DollarSign}
                trend="up"
                trendValue="vs last month"
                color="bg-green-500"
              />
              <StatCard
                title="At-Risk Customers"
                value={atRiskCount}
                subtitle={`${customers?.length ? Math.round((atRiskCount / customers.length) * 100) : 0}% of total base`}
                icon={AlertTriangle}
                trend={atRiskCount > 0 ? "down" : "neutral"}
                trendValue={atRiskCount > 0 ? "Needs attention" : "All clear"}
                color="bg-red-500"
              />
              <StatCard
                title="Healthy Customers"
                value={healthyCount}
                subtitle={`${customers?.length ? Math.round((healthyCount / customers.length) * 100) : 0}% retention rate`}
                icon={Heart}
                trend="up"
                trendValue="Great health"
                color="bg-blue-500"
              />
              <StatCard
                title="Active Playbooks"
                value={activePlaybooks}
                subtitle={`${openTasks} open tasks · ${unreadAlerts} alerts`}
                icon={Zap}
                trend="neutral"
                trendValue="Automations running"
                color="bg-purple-500"
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Customer List */}
          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Users className="h-5 w-5 text-blue-500" />
                    Customer Health Overview
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-xs" asChild>
                    <a href="/dashboard/health">View all</a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {customersLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                ) : recentCustomers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                      <Users className="h-7 w-7 text-blue-500" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">No customers yet</h3>
                    <p className="text-muted-foreground text-sm mb-4 max-w-xs">
                      Add your first customer to start tracking their health score and churn risk.
                    </p>
                    <Button
                      className="h-10 px-4"
                      onClick={() => setCreateCustomerOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Customer
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentCustomers.map((customer) => {
                      const churnPct = Math.round(parseFloat(String(customer.churnProbability ?? "0")) * 100);
                      return (
                        <div key={customer.id} className="flex items-center gap-3 px-4 md:px-6 py-3 hover:bg-muted/30 transition-colors">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm truncate">{customer.name}</span>
                              {customer.companyName && (
                                <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                                  · {customer.companyName}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center gap-1 flex-1 min-w-0">
                                <Progress
                                  value={customer.healthScore ?? 0}
                                  className="h-1.5 w-16 flex-shrink-0"
                                />
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                  {customer.healthScore ?? 0}
                                </span>
                              </div>
                              {churnPct > 0 && (
                                <span className="text-xs text-red-500 flex-shrink-0 hidden sm:inline">
                                  {churnPct}% churn risk
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm font-medium text-muted-foreground hidden md:inline">
                              ${parseFloat(String(customer.mrr ?? "0")).toLocaleString()}/mo
                            </span>
                            <HealthStatusBadge status={customer.healthStatus} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Playbooks */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                    Retention Playbooks
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-xs" asChild>
                    <a href="/dashboard/playbooks">View all</a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {playbooksLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-56" />
                        </div>
                        <Skeleton className="h-6 w-14" />
                      </div>
                    ))}
                  </div>
                ) : recentPlaybooks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
                      <BookOpen className="h-6 w-6 text-purple-500" />
                    </div>
                    <h3 className="font-semibold mb-1">No playbooks yet</h3>
                    <p className="text-muted-foreground text-sm mb-3 max-w-xs">
                      Create automated playbooks to engage at-risk customers.
                    </p>
                    <Button variant="outline" className="h-10 px-4" asChild>
                      <a href="/dashboard/playbooks">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Playbook
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentPlaybooks.map((playbook) => (
                      <div key={playbook.id} className="flex items-center gap-3 px-4 md:px-6 py-3 hover:bg-muted/30 transition-colors">
                        <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                          <Zap className="h-4 w-4 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{playbook.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {playbook.runCount ?? 0} runs
                            {playbook.lastRunAt && (
                              <span> · Last run {new Date(playbook.lastRunAt).toLocaleDateString()}</span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <PlaybookStatusBadge status={playbook.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Alerts */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-5 w-5 text-orange-500" />
                    Alerts
                    {unreadAlerts > 0 && (
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                        {unreadAlerts}
                      </span>
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {alertsLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                    <p className="font-medium text-sm">All clear!</p>
                    <p className="text-muted-foreground text-xs mt-1">No active alerts right now.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentAlerts.map((alert) => (
                      <div key={alert.id} className={`flex gap-3 px-4 py-3 ${!alert.isRead ? "bg-orange-50/50" : ""}`}>
                        <AlertSeverityIcon severity={alert.severity} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight">{alert.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.message}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-muted-foreground">
                              {new Date(alert.createdAt).toLocaleDateString()}
                            </span>
                            <button
                              className="text-xs text-muted-foreground hover:text-foreground underline"
                              onClick={() => dismissAlertMutation.mutate({ alertId: alert.id })}
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5 text-green-500" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mainLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                        Healthy
                      </span>
                      <span className="font-semibold">{healthyCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-yellow-400 inline-block" />
                        At Risk
                      </span>
                      <span className="font-semibold">
                        {customers?.filter((c) => c.healthStatus === "at_risk").length ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                        Critical
                      </span>
                      <span className="font-semibold">
                        {customers?.filter((c) => c.healthStatus === "critical").length ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-gray-400 inline-block" />
                        Churned
                      </span>
                      <span className="font-semibold">
                        {customers?.filter((c) => c.healthStatus === "churned").length ?? 0}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          Open Tasks
                        </span>
                        <span className="font-semibold">{openTasks}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <TrendingDown className="h-3.5 w-3.5" />
                          Avg Churn Risk
                        </span>
                        <span className="font-semibold">
                          {customers?.length
                            ? `${Math.round(
                                (customers.reduce(
                                  (sum, c) => sum + parseFloat(String(c.churnProbability ?? "0")),
                                  0
                                ) /
                                  customers.length) *
                                  100
                              )}%`
                            : "0%"}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Navigation */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { href: "/dashboard/health", label: "Customer Health", icon: Heart, color: "text-blue-500" },
                  { href: "/dashboard/churn", label: "Churn Prediction", icon: TrendingDown, color: "text-red-500" },
                  { href: "/dashboard/playbooks", label: "Playbooks", icon: BookOpen, color: "text-purple-500" },
                  { href: "/dashboard/settings", label: "Settings", icon: Activity, color: "text-gray-500" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-background transition-colors">
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}