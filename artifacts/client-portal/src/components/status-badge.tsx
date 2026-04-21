import { Badge } from "@/components/ui/badge";

type Status = "pending" | "in_progress" | "review" | "delivered" | "completed";

const STATUS_CONFIG: Record<Status, { label: string; variant: "default" | "secondary" | "outline" | "destructive" | "outline"; className?: string }> = {
  pending: { label: "Pending", variant: "secondary", className: "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300" },
  in_progress: { label: "In Progress", variant: "default", className: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300" },
  review: { label: "Needs Review", variant: "default", className: "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300" },
  delivered: { label: "Delivered", variant: "default", className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300" },
  completed: { label: "Completed", variant: "default", className: "bg-slate-100 text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300" },
};

export function StatusBadge({ status }: { status: Status | string }) {
  const config = STATUS_CONFIG[status as Status] || { label: status, variant: "outline" };
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

type Priority = "low" | "medium" | "high" | "urgent";

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  low: { label: "Low", className: "text-slate-500 bg-slate-100" },
  medium: { label: "Medium", className: "text-blue-600 bg-blue-50" },
  high: { label: "High", className: "text-orange-600 bg-orange-50" },
  urgent: { label: "Urgent", className: "text-red-600 bg-red-50" },
};

export function PriorityBadge({ priority }: { priority: Priority | string }) {
  const config = PRIORITY_CONFIG[priority as Priority] || { label: priority, className: "bg-slate-100" };
  
  return (
    <Badge variant="outline" className={`border-none ${config.className}`}>
      {config.label}
    </Badge>
  );
}

export function formatType(type: string) {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
