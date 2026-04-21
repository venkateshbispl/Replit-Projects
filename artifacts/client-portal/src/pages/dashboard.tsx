import { 
  useGetDashboardSummary, 
  useGetDashboardActivity 
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { 
  FolderOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  MessageSquare,
  PlusCircle,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { StatusBadge } from "@/components/status-badge";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: isLoadingActivity } = useGetDashboardActivity();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your projects.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/projects/new">
            <PlusCircle className="size-4" />
            New Request
          </Link>
        </Button>
      </div>

      {isLoadingSummary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover-elevate transition-all border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
              <FolderOpen className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.totalProjects}</div>
            </CardContent>
          </Card>
          <Card className="hover-elevate transition-all border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              <Clock className="size-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.activeProjects}</div>
            </CardContent>
          </Card>
          <Card className="hover-elevate transition-all border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Needs Review</CardTitle>
              <AlertCircle className="size-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.pendingReview}</div>
            </CardContent>
          </Card>
          <Card className="hover-elevate transition-all border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.completedProjects}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates on your requests</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-muted-foreground">
              <Link href="/projects">
                View all <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingActivity ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="size-10 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="relative border-l border-border/50 ml-4 pl-6 space-y-8 pb-4">
                {activity.map((item) => {
                  let Icon = AlertCircle;
                  let iconBg = "bg-primary/10 text-primary";
                  
                  if (item.type === "project_created") {
                    Icon = PlusCircle;
                    iconBg = "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
                  } else if (item.type === "status_changed") {
                    Icon = CheckCircle2;
                    iconBg = "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
                  } else if (item.type === "file_uploaded") {
                    Icon = FileText;
                    iconBg = "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
                  } else if (item.type === "message_sent") {
                    Icon = MessageSquare;
                    iconBg = "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
                  }

                  return (
                    <div key={item.id} className="relative">
                      <div className={`absolute -left-[40px] size-8 rounded-full flex items-center justify-center ${iconBg} ring-4 ring-card`}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="text-sm">
                          <span className="font-semibold text-foreground mr-1">{item.actorName}</span>
                          <span className="text-muted-foreground">{item.description}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Link href={`/projects/${item.projectId}`} className="font-medium text-primary hover:underline">
                            {item.projectTitle}
                          </Link>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground flex flex-col items-center">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <FolderOpen className="size-6 opacity-50" />
                </div>
                <p>No recent activity.</p>
                <p className="text-sm">Start by creating a new project request.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Projects by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : summary && summary.projectsByStatus.length > 0 ? (
              <div className="space-y-4">
                {summary.projectsByStatus.map((stat) => (
                  <div key={stat.status} className="flex items-center justify-between">
                    <StatusBadge status={stat.status} />
                    <span className="font-bold">{stat.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No data available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
