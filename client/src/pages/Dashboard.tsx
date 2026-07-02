import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import {
  Users,
  TrendingDown,
  AlertTriangle,
  Activity,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Bell,
  Zap,
  ChevronRight,
  BarChart2,
} from "lucide-react";

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function CustomerRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div>
          <Skeleton className="h-4 w-28 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-12" />
      </div>
    </div>
  );
}

function getHealthColor(status: string) {
  switch (status) {
    case "healthy": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "at_risk": return "bg-amber-100 text-amber-800 border-amber-200";
    case "critical": return "bg-red-100 text-red-800 border-red-200";
    case "churned": return "bg-gray-100 text-gray-800 border-gray-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getChurnColor(risk: string) {
  switch (risk) {
    case "low": return "text-emerald-600";
    case "medium": return "text-amber-600";
    case "high": return "text-orange-600";
    case "critical": return "text-red-600";
    default: return "text-gray-600";
  }
}

function getScoreColor(score: number) {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  if (score >= 25) return "bg-orange-500";
  return "bg-red-500";
}

function getPlaybookStatusColor(status: string) {
  switch (status) {
    case "active": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "draft": return "bg-blue-100 text-blue-800 border-blue-200";
    case "paused": return "bg-amber-100 text-amber-800 border-amber-200";
    case "archived": return "bg-gray-100 text-gray-800 border-gray-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();

  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [addPlaybookOpen, setAddPlaybookOpen] = useState(false);

  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerCompany, setNewCustomerCompany] = useState("");
  const [newCustomerMrr, setNewCustomerMrr] = useState("");
  const [newCustomerPlan, setNewCustomerPlan] = useState("");

  const [newPlaybookName, setNewPlaybookName] = useState("");
  const [newPlaybookDescription, setNewPlaybookDescription] = useState("");
  const [newPlaybookTrigger, setNewPlaybookTrigger] = useState("");

  const {
    data: customersData,
    isLoading: customersLoading,
    error: customersError,
  } = trpc.customers.list.useQuery(undefined, { enabled: !!user });

  const {
    data: playbooksData,
    isLoading: playbooksLoading,
    error: playbooksError,
  } = trpc.playbooks.list.useQuery(undefined, { enabled: !!user });

  const {
    data: alertsData,
    isLoading: alertsLoading,
    error: alertsError,
  } = trpc.alerts.list.useQuery(undefined, { enabled: !!user });

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = trpc.dashboard.stats.useQuery(undefined, { enabled: !!user });

  const createCustomerMutation = trpc.customers.create.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      utils.dashboard.stats.invalidate();
      setAddCustomerOpen(false);
      setNewCustomerName("");
      setNewCustomerEmail("");
      setNewCustomerCompany("");
      setNewCustomerMrr("");
      setNewCustomerPlan("");
    },
  });

  const createPlaybookMutation = trpc.playbooks.create.useMutation({
    onSuccess: () => {
      utils.playbooks.list.invalidate();
      setAddPlaybookOpen(false);
      setNewPlaybookName("");
      setNewPlaybookDescription("");
      setNewPlaybookTrigger("");
    },
  });

  const handleCreateCustomer = () => {
    if (!newCustomerName.trim() || !newCustomerEmail.trim()) return;
    createCustomerMutation.mutate({
      name: newCustomerName.trim(),
      email: newCustomerEmail.trim(),
      companyName: newCustomerCompany.trim() || undefined,
      mrr: newCustomerMrr ? newCustomerMrr : "0",
      planName: newCustomerPlan || undefined,
    });
  };

  const handleCreatePlaybook = () => {
    if (!newPlaybookName.trim() || !newPlaybookTrigger) return;
    createPlaybookMutation.mutate({
      name: newPlaybookName.trim(),
      description: newPlaybookDescription.trim() || undefined,
      triggerType: newPlaybookTrigger,
      triggerConditions: JSON.stringify({ type: newPlaybookTrigger }),
    });
  };

  const totalCustomers = statsData?.totalCustomers ?? 0;
  const atRiskCustomers = statsData?.atRiskCustomers ?? 0;
  const activePlaybooks = statsData?.activePlaybooks ?? 0;
  const avgHealthScore = statsData?.avgHealthScore ?? 0;
  const totalMrr = statsData?.totalMrr ?? "0";
  const unreadAlerts = alertsData?.filter((a: any) => !a.isRead).length ?? 0;

  const recentCustomers = (customersData ?? []).slice(0, 8);
  const recentPlaybooks = (playbooksData ?? []).slice(0, 5);
  const recentAlerts = (alertsData ?? []).slice(0, 5);

  const statsHasError = statsError || customersError;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">

        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}! 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here's what's happening with your customer retention today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4"
              onClick={() => {
                utils.customers.list.invalidate();
                utils.playbooks.list.invalidate();
                utils.alerts.list.invalidate();
                utils.dashboard.stats.invalidate();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-10 px-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1">
                    <Label htmlFor="customer-name">Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="customer-name"
                      placeholder="Jane Smith"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="customer-email">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="customer-email"
                      type="email"
                      placeholder="jane@company.com"
                      value={newCustomerEmail}
                      onChange={(e) => setNewCustomerEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="customer-company">Company Name</Label>
                    <Input
                      id="customer-company"
                      placeholder="Acme Corp"
                      value={newCustomerCompany}
                      onChange={(e) => setNewCustomerCompany(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="customer-mrr">MRR ($)</Label>
                      <Input
                        id="customer-mrr"
                        type="number"
                        placeholder="299"
                        value={newCustomerMrr}
                        onChange={(e) => setNewCustomerMrr(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="customer-plan">Plan</Label>
                      <Select value={newCustomerPlan} onValueChange={setNewCustomerPlan}>
                        <SelectTrigger id="customer-plan">
                          <SelectValue placeholder="Select plan" />
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
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddCustomerOpen(false)} className="h-10 px-4">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateCustomer}
                    disabled={!newCustomerName.trim() || !newCustomerEmail.trim() || createCustomerMutation.isPending}
                    className="h-10 px-4"
                  >
                    {createCustomerMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Customer"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Error */}
        {statsHasError && (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load dashboard data. Please refresh the page and try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    Total Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{totalCustomers}</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                    Active accounts tracked
                  </p>
                </CardContent>
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 dark:bg-blue-950 rounded-bl-full opacity-60" />
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    At-Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold text-amber-600">{atRiskCustomers}</div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                    Need intervention
                  </p>
                </CardContent>
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 dark:bg-amber-950 rounded-bl-full opacity-60" />
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4 text-indigo-500" />
                    Avg Health Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{avgHealthScore}</div>
                  <div className="mt-2">
                    <Progress value={avgHealthScore} className="h-1.5" />
                  </div>
                </CardContent>
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 dark:bg-indigo-950 rounded-bl-full opacity-60" />
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-emerald-500" />
                    Total MRR
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    ${Number(totalMrr).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                    Monthly recurring revenue
                  </p>
                </CardContent>
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 dark:bg-emerald-950 rounded-bl-full opacity-60" />
              </Card>
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Customers Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base md:text-lg">Recent Customers</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Latest accounts and their health status</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="h-9 px-3 text-xs text-muted-foreground" asChild>
                    <a href="/dashboard/health">
                      View all <ChevronRight className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {customersLoading ? (
                  <div>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <CustomerRowSkeleton key={i} />
                    ))}
                  </div>
                ) : customersError ? (
                  <div className="p-4">
                    <Alert variant="destructive">
                      <AlertDescription>Failed to load customers. Please try again.</AlertDescription>
                    </Alert>
                  </div>
                ) : recentCustomers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="rounded-full bg-blue-50 dark:bg-blue-950 p-4 mb-4">
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No customers yet</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                      Add your first customer to start tracking their health and churn risk.
                    </p>
                    <Button
                      onClick={() => setAddCustomerOpen(true)}
                      size="sm"
                      className="h-10 px-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Customer
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentCustomers.map((customer: any) => (
                      <div
                        key={customer.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {customer.name?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {customer.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {customer.companyName || customer.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getHealthColor(customer.healthStatus)}`}>
                            {customer.healthStatus?.replace("_", " ")}
                          </span>
                          <div className="text-right">
                            <p className="text-xs font-medium text-gray-900 dark:text-white">
                              {customer.healthScore ?? 0}
                              <span className="text-muted-foreground font-normal">/100</span>
                            </p>
                            <p className={`text-xs font-medium ${getChurnColor(customer.churnRisk)}`}>
                              {customer.churnRisk} risk
                            </p>
                          </div>
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

            {/* Recent Alerts */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">Alerts</CardTitle>
                    {unreadAlerts > 0 && (
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                        {unreadAlerts}
                      </span>
                    )}
                  </div>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {alertsLoading ? (
                  <div className="p-3 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : alertsError ? (
                  <div className="p-3">
                    <Alert variant="destructive">
                      <AlertDescription className="text-xs">Failed to load alerts.</AlertDescription>
                    </Alert>
                  </div>
                ) : recentAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">All clear!</p>
                    <p className="text-xs text-muted-foreground mt-1">No active alerts right now.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentAlerts.map((alert: any) => (
                      <div key={alert.id} className={`p-3 ${!alert.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}>
                        <div className="flex items-start gap-2">
                          <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                            alert.severity === "high" || alert.severity === "critical"
                              ? "bg-red-500"
                              : alert.severity === "medium"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                          }`} />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{alert.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Playbooks */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Playbooks</CardTitle>
                    <CardDescription className="text-xs mt-0.5">{activePlaybooks} active</CardDescription>
                  </div>
                  <Dialog open={addPlaybookOpen} onOpenChange={setAddPlaybookOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 px-3">
                        <Plus className="h-3 w-3 mr-1" />
                        New
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create Retention Playbook</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="space-y-1">
                          <Label htmlFor="playbook-name">Playbook Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="playbook-name"
                            placeholder="e.g. Re-engage Inactive Users"
                            value={newPlaybookName}
                            onChange={(e) => setNewPlaybookName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="playbook-desc">Description</Label>
                          <Input
                            id="playbook-desc"
                            placeholder="What does this playbook do?"
                            value={newPlaybookDescription}
                            onChange={(e) => setNewPlaybookDescription(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="playbook-trigger">Trigger <span className="text-red-500">*</span></Label>
                          <Select value={newPlaybookTrigger} onValueChange={setNewPlaybookTrigger}>
                            <SelectTrigger id="playbook-trigger">
                              <SelectValue placeholder="Select trigger type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="health_score_drop">Health Score Drop</SelectItem>
                              <SelectItem value="churn_risk_high">High Churn Risk</SelectItem>
                              <SelectItem value="inactivity">User Inactivity</SelectItem>
                              <SelectItem value="trial_ending">Trial Ending</SelectItem>
                              <SelectItem value="renewal_approaching">Renewal Approaching</SelectItem>
                              <SelectItem value="manual">Manual Trigger</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setAddPlaybookOpen(false)} className="h-10 px-4">
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreatePlaybook}
                          disabled={!newPlaybookName.trim() || !newPlaybookTrigger || createPlaybookMutation.isPending}
                          className="h-10 px-4"
                        >
                          {createPlaybookMutation.isPending ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Playbook"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {playbooksLoading ? (
                  <div className="p-3 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : playbooksError ? (
                  <div className="p-3">
                    <Alert variant="destructive">
                      <AlertDescription className="text-xs">Failed to load playbooks.</AlertDescription>
                    </Alert>
                  </div>
                ) : recentPlaybooks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <div className="rounded-full bg-indigo-50 dark:bg-indigo-950 p-3 mb-3">
                      <BookOpen className="h-6 w-6 text-indigo-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">No playbooks yet</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                      Create automated retention workflows.
                    </p>
                    <Button
                      onClick={() => setAddPlaybookOpen(true)}
                      size="sm"
                      className="h-9 px-3"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Create Playbook
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentPlaybooks.map((playbook: any) => (
                      <div key={playbook.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{playbook.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {playbook.timesTriggered ?? 0} runs
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ml-2 ${getPlaybookStatusColor(playbook.status)}`}>
                          {playbook.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => window.location.href = "/dashboard/health"}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-xl bg-blue-100 dark:bg-blue-950 p-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-900 transition-colors">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Customer Health</p>
                  <p className="text-xs text-muted-foreground">View health scores & trends</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => window.location.href = "/dashboard/churn"}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-xl bg-red-100 dark:bg-red-950 p-3 group-hover:bg-red-200 dark:group-hover:bg-red-900 transition-colors">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Churn Prediction</p>
                  <p className="text-xs text-muted-foreground">AI-powered churn forecasting</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setAddPlaybookOpen(true)}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-xl bg-emerald-100 dark:bg-emerald-950 p-3 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900 transition-colors">
                  <Zap className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">New Playbook</p>
                  <p className="text-xs text-muted-foreground">Automate retention workflows</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Health Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Customer Health Distribution</CardTitle>
            <CardDescription>Breakdown of customers by health status</CardDescription>
          </CardHeader>
          <CardContent>
            {customersLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            ) : customersError ? (
              <Alert variant="destructive">
                <AlertDescription>Failed to load health distribution data.</AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { status: "healthy", label: "Healthy", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950", border: "border-emerald-200 dark:border-emerald-800" },
                  { status: "at_risk", label: "At Risk", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950", border: "border-amber-200 dark:border-amber-800" },
                  { status: "critical", label: "Critical", icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950", border: "border-red-200 dark:border-red-800" },
                  { status: "churned", label: "Churned", icon: Clock, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-950", border: "border-gray-200 dark:border-gray-700" },
                ].map(({ status, label, icon: Icon, color, bg, border }) => {
                  const count = (customersData ?? []).filter((c: any) => c.healthStatus === status).length;
                  const pct = totalCustomers > 0 ? Math.round((count / totalCustomers) * 100) : 0;
                  return (
                    <div key={status} className={`rounded-xl border p-4 ${bg} ${border}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`h-4 w-4 ${color}`} />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                      <p className="text-xs text-muted-foreground mt-1">{pct}% of total</p>
                      <div className="mt-2">
                        <Progress value={pct} className="h-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}