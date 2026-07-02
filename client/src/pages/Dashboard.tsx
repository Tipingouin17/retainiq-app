import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  Users,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Plus,
  Activity,
  BookOpen,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Heart,
} from "lucide-react";

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-1" />
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
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-12" />
      </div>
    </div>
  );
}

function getHealthBadgeVariant(status: string) {
  switch (status) {
    case "healthy":
      return "default";
    case "at_risk":
      return "secondary";
    case "churned":
      return "destructive";
    case "new":
      return "outline";
    default:
      return "outline";
  }
}

function getHealthBadgeClass(status: string) {
  switch (status) {
    case "healthy":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "at_risk":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "churned":
      return "bg-red-100 text-red-700 border-red-200";
    case "new":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "";
  }
}

function getHealthIcon(status: string) {
  switch (status) {
    case "healthy":
      return <CheckCircle2 className="h-3 w-3" />;
    case "at_risk":
      return <AlertTriangle className="h-3 w-3" />;
    case "churned":
      return <XCircle className="h-3 w-3" />;
    case "new":
      return <Clock className="h-3 w-3" />;
    default:
      return null;
  }
}

function getAlertSeverityClass(severity: string) {
  switch (severity) {
    case "critical":
      return "border-l-4 border-l-red-500 bg-red-50";
    case "warning":
      return "border-l-4 border-l-amber-500 bg-amber-50";
    case "info":
      return "border-l-4 border-l-blue-500 bg-blue-50";
    default:
      return "border-l-4 border-l-gray-300 bg-gray-50";
  }
}

function getAlertSeverityBadgeClass(severity: string) {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-700";
    case "warning":
      return "bg-amber-100 text-amber-700";
    case "info":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-cyan-100 text-cyan-700",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerCompany, setNewCustomerCompany] = useState("");
  const [newCustomerMrr, setNewCustomerMrr] = useState("");
  const [newCustomerPlan, setNewCustomerPlan] = useState("starter");
  const [formError, setFormError] = useState("");

  const {
    data: customers,
    isLoading: customersLoading,
    error: customersError,
  } = trpc.customers.list.useQuery(undefined, { enabled: !!user });

  const {
    data: alerts,
    isLoading: alertsLoading,
    error: alertsError,
  } = trpc.alerts.list.useQuery(undefined, { enabled: !!user });

  const {
    data: playbooks,
    isLoading: playbooksLoading,
    error: playbooksError,
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
      setNewCustomerMrr("");
      setNewCustomerPlan("starter");
      setFormError("");
    },
    onError: (err) => {
      setFormError(err.message || "Failed to create customer.");
    },
  });

  const markAlertReadMutation = trpc.alerts.markRead.useMutation({
    onSuccess: () => {
      utils.alerts.list.invalidate();
    },
  });

  function handleCreateCustomer() {
    if (!newCustomerName.trim()) {
      setFormError("Customer name is required.");
      return;
    }
    if (!newCustomerEmail.trim()) {
      setFormError("Email is required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCustomerEmail.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }
    setFormError("");
    createCustomerMutation.mutate({
      name: newCustomerName.trim(),
      email: newCustomerEmail.trim(),
      companyName: newCustomerCompany.trim() || undefined,
      mrr: newCustomerMrr ? newCustomerMrr : "0",
      plan: newCustomerPlan,
    });
  }

  const totalCustomers = customers?.length ?? 0;
  const healthyCount = customers?.filter((c) => c.healthStatus === "healthy").length ?? 0;
  const atRiskCount = customers?.filter((c) => c.healthStatus === "at_risk").length ?? 0;
  const totalMrr = customers?.reduce((sum, c) => sum + parseFloat(c.mrr ?? "0"), 0) ?? 0;
  const atRiskMrr = customers
    ?.filter((c) => c.healthStatus === "at_risk")
    .reduce((sum, c) => sum + parseFloat(c.mrr ?? "0"), 0) ?? 0;
  const unreadAlerts = alerts?.filter((a) => !a.isRead).length ?? 0;
  const activePlaybooks = playbooks?.filter((p) => p.status === "active").length ?? 0;
  const openTasks = tasks?.filter((t) => t.status === "open" || t.status === "in_progress").length ?? 0;

  const recentCustomers = customers?.slice(0, 8) ?? [];
  const recentAlerts = alerts?.slice(0, 5) ?? [];

  const avgHealthScore =
    customers && customers.length > 0
      ? Math.round(
          customers.reduce((sum, c) => sum + (c.healthScore ?? 0), 0) / customers.length
        )
      : 0;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}! 👋
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Here's what's happening with your customer retention today.
            </p>
          </div>
          <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 px-4 gap-2 w-full sm:w-auto" size="default">
                <Plus className="h-4 w-4" />
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
                <div className="space-y-1.5">
                  <Label htmlFor="cust-name">Full Name *</Label>
                  <Input
                    id="cust-name"
                    placeholder="Jane Doe"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cust-email">Email *</Label>
                  <Input
                    id="cust-email"
                    type="email"
                    placeholder="jane@acme.com"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cust-company">Company</Label>
                  <Input
                    id="cust-company"
                    placeholder="Acme Corp"
                    value={newCustomerCompany}
                    onChange={(e) => setNewCustomerCompany(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="cust-mrr">MRR ($)</Label>
                    <Input
                      id="cust-mrr"
                      type="number"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      value={newCustomerMrr}
                      onChange={(e) => setNewCustomerMrr(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cust-plan">Plan</Label>
                    <Select value={newCustomerPlan} onValueChange={setNewCustomerPlan}>
                      <SelectTrigger id="cust-plan" className="h-10">
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
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-10"
                    onClick={() => {
                      setAddCustomerOpen(false);
                      setFormError("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-10"
                    onClick={handleCreateCustomer}
                    disabled={createCustomerMutation.isPending}
                  >
                    {createCustomerMutation.isPending ? "Adding..." : "Add Customer"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {customersLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : customersError ? (
            <div className="col-span-2 lg:col-span-4">
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to load customer stats: {customersError.message}
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                    Total Customers
                  </CardTitle>
                  <div className="h-8 w-8 bg-violet-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-violet-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{totalCustomers}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {healthyCount} healthy · {atRiskCount} at risk
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                    Total MRR
                  </CardTitle>
                  <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    ${totalMrr.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <ArrowDownRight className="h-3 w-3" />
                    ${atRiskMrr.toLocaleString()} at risk
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                    Avg Health Score
                  </CardTitle>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Heart className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{avgHealthScore}</div>
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        avgHealthScore >= 70
                          ? "bg-emerald-500"
                          : avgHealthScore >= 40
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${avgHealthScore}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                    Active Playbooks
                  </CardTitle>
                  <div className="h-8 w-8 bg-rose-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-rose-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{activePlaybooks}</div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    {openTasks} open tasks
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer List - Takes 2/3 width */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-semibold">Customer Overview</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-3"
                  onClick={() => setAddCustomerOpen(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {customersLoading ? (
                  <div className="divide-y">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <CustomerRowSkeleton key={i} />
                    ))}
                  </div>
                ) : customersError ? (
                  <div className="p-4">
                    <Alert variant="destructive">
                      <AlertDescription>
                        Failed to load customers: {customersError.message}
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : recentCustomers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="h-16 w-16 bg-violet-50 rounded-full flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-violet-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      No customers yet
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-xs">
                      Start tracking customer health by adding your first customer.
                    </p>
                    <Button
                      className="h-10 px-4"
                      onClick={() => setAddCustomerOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Customer
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${getAvatarColor(
                              customer.name
                            )}`}
                          >
                            {getInitials(customer.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {customer.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {customer.companyName || customer.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-2">
                          <span className="hidden sm:block text-sm font-medium text-gray-700">
                            ${parseFloat(customer.mrr ?? "0").toLocaleString()}
                            <span className="text-xs text-gray-400">/mo</span>
                          </span>
                          <div className="hidden sm:flex items-center gap-1">
                            <div
                              className={`h-1.5 w-12 rounded-full ${
                                (customer.healthScore ?? 0) >= 70
                                  ? "bg-emerald-400"
                                  : (customer.healthScore ?? 0) >= 40
                                  ? "bg-amber-400"
                                  : "bg-red-400"
                              }`}
                            >
                              <div
                                className="h-full bg-current rounded-full opacity-0"
                                style={{ width: `${customer.healthScore ?? 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-6">
                              {customer.healthScore ?? 0}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs px-2 py-0.5 flex items-center gap-1 ${getHealthBadgeClass(
                              customer.healthStatus
                            )}`}
                          >
                            {getHealthIcon(customer.healthStatus)}
                            <span className="capitalize hidden xs:inline">
                              {customer.healthStatus.replace("_", " ")}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {(customers?.length ?? 0) > 8 && (
                      <div className="px-4 py-3 text-center">
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-violet-600 hover:text-violet-700">
                          View all {customers?.length} customers
                          <ArrowUpRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Alerts Panel */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-semibold">Alerts</CardTitle>
                  {unreadAlerts > 0 && (
                    <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold">
                      {unreadAlerts}
                    </span>
                  )}
                </div>
                <Bell className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent className="p-0">
                {alertsLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))}
                  </div>
                ) : alertsError ? (
                  <div className="p-4">
                    <Alert variant="destructive">
                      <AlertDescription>
                        Failed to load alerts: {alertsError.message}
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : recentAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700">All clear!</p>
                    <p className="text-xs text-gray-500">No active alerts right now.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`px-4 py-3 ${getAlertSeverityClass(alert.severity)} ${
                          !alert.isRead ? "opacity-100" : "opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span
                                className={`text-xs font-semibold px-1.5 py-0.5 rounded capitalize ${getAlertSeverityBadgeClass(
                                  alert.severity
                                )}`}
                              >
                                {alert.severity}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-gray-800 truncate">
                              {alert.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {alert.message}
                            </p>
                          </div>
                          {!alert.isRead && (
                            <button
                              onClick={() => markAlertReadMutation.mutate({ id: alert.id })}
                              className="flex-shrink-0 h-4 w-4 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors mt-0.5"
                              title="Mark as read"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Playbooks Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-semibold">Playbooks</CardTitle>
                <BookOpen className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent className="p-0">
                {playbooksLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-14" />
                      </div>
                    ))}
                  </div>
                ) : playbooksError ? (
                  <div className="p-4">
                    <Alert variant="destructive">
                      <AlertDescription>
                        Failed to load playbooks: {playbooksError.message}
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : !playbooks || playbooks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <BookOpen className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-sm font-medium text-gray-700">No playbooks yet</p>
                    <p className="text-xs text-gray-500 mb-3">
                      Create automated retention workflows.
                    </p>
                    <Button variant="outline" size="sm" className="h-8 text-xs px-3">
                      <Plus className="h-3 w-3 mr-1" />
                      Create Playbook
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {playbooks.slice(0, 5).map((playbook) => (
                      <div
                        key={playbook.id}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">
                            {playbook.name}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {playbook.triggerType.replace(/_/g, " ")}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs flex-shrink-0 ml-2 ${
                            playbook.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : playbook.status === "draft"
                              ? "bg-gray-50 text-gray-600 border-gray-200"
                              : "bg-gray-50 text-gray-500 border-gray-200"
                          }`}
                        >
                          {playbook.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Customer Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customersLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-2 w-24" />
                        <Skeleton className="h-3 w-6" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {[
                      {
                        label: "Healthy",
                        count: healthyCount,
                        color: "bg-emerald-500",
                        textColor: "text-emerald-700",
                      },
                      {
                        label: "At Risk",
                        count: atRiskCount,
                        color: "bg-amber-500",
                        textColor: "text-amber-700",
                      },
                      {
                        label: "Churned",
                        count: customers?.filter((c) => c.healthStatus === "churned").length ?? 0,
                        color: "bg-red-500",
                        textColor: "text-red-700",
                      },
                      {
                        label: "New",
                        count: customers?.filter((c) => c.healthStatus === "new").length ?? 0,
                        color: "bg-blue-500",
                        textColor: "text-blue-700",
                      },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-14 flex-shrink-0">
                          {item.label}
                        </span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full transition-all duration-500`}
                            style={{
                              width:
                                totalCustomers > 0
                                  ? `${(item.count / totalCustomers) * 100}%`
                                  : "0%",
                            }}
                          />
                        </div>
                        <span className={`text-xs font-semibold w-6 text-right ${item.textColor}`}>
                          {item.count}
                        </span>
                      </div>
                    ))}
                    <div className="pt-1 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Churn Risk MRR</span>
                        <span className="text-xs font-semibold text-amber-600">
                          ${atRiskMrr.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tasks Quick View */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">Open Tasks</CardTitle>
              {openTasks > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                  {openTasks}
                </span>
              )}
            </div>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent className="p-0">
            {tasksLoading ? (
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-3 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ) : !tasks || tasks.filter((t) => t.status === "open" || t.status === "in_progress").length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-300 mb-3" />
                <p className="text-sm font-medium text-gray-700">All caught up!</p>
                <p className="text-xs text-gray-500">No open tasks at the moment.</p>
              </div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tasks
                    .filter((t) => t.status === "open" || t.status === "in_progress")
                    .slice(0, 6)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="border rounded-lg p-3 hover:shadow-sm transition-shadow bg-white"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-sm font-medium text-gray-800 line-clamp-2">
                            {task.title}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-xs flex-shrink-0 ${
                              task.priority === "urgent"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : task.priority === "high"
                                ? "bg-orange-50 text-orange-700 border-orange-200"
                                : task.priority === "medium"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-gray-50 text-gray-600 border-gray-200"
                            }`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              task.status === "in_progress"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-gray-50 text-gray-600 border-gray-200"
                            }`}
                          >
                            {task.status === "in_progress" ? "In Progress" : "Open"}
                          </Badge>
                          {task.dueAt && (
                            <span className="text-xs text-gray-400">
                              Due {new Date(task.dueAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}