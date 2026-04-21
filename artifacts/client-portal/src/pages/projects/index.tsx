import { useState } from "react";
import { Link } from "wouter";
import { useGetProjects } from "@workspace/api-client-react";
import type { GetProjectsStatus } from "@workspace/api-client-react";
import { 
  FolderOpen, 
  Search, 
  PlusCircle, 
  Calendar,
  MessageSquare,
  Paperclip
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, PriorityBadge, formatType } from "@/components/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProjectsList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<GetProjectsStatus | "all">("all");

  const { data: projects, isLoading } = useGetProjects(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );

  const filteredProjects = projects?.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage and track your design requests.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/projects/new">
            <PlusCircle className="size-4" />
            New Request
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-none shadow-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
          <SelectTrigger className="w-[180px] bg-card border-none shadow-sm">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">Needs Review</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects && filteredProjects.length > 0 ? (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="group hover-elevate transition-all border-none shadow-sm cursor-pointer relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors" />
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                        <StatusBadge status={project.status} />
                        <PriorityBadge priority={project.priority} />
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                          <FolderOpen className="size-3.5" />
                          <span className="font-medium text-foreground/80">{formatType(project.projectType)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          <span>Updated {format(new Date(project.updatedAt), "MMM d, yyyy")}</span>
                        </div>
                        {project.deadline && (
                          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                            <Calendar className="size-3.5" />
                            <span>Due {format(new Date(project.deadline), "MMM d, yyyy")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 md:flex-col md:items-end justify-between border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6 shrink-0">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Paperclip className="size-4" />
                          <span className="font-medium">{project.fileCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MessageSquare className="size-4" />
                          <span className="font-medium">{project.messageCount}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="hidden md:flex group-hover:bg-primary/10 group-hover:text-primary">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-none shadow-sm py-16">
          <CardContent className="flex flex-col items-center text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FolderOpen className="size-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold mb-2">No projects found</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {search || statusFilter !== "all" 
                ? "Try adjusting your search or filters to find what you're looking for."
                : "You don't have any design projects yet. Create a new request to get started."}
            </p>
            {!(search || statusFilter !== "all") && (
              <Button asChild size="lg">
                <Link href="/projects/new">
                  <PlusCircle className="mr-2 size-5" />
                  Create First Project
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
