import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, projectsTable, activityTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [totals] = await db.select({
    total: sql<number>`count(*)::int`,
    active: sql<number>`count(*) filter (where status in ('in_progress', 'review'))::int`,
    completed: sql<number>`count(*) filter (where status = 'completed')::int`,
    pendingReview: sql<number>`count(*) filter (where status = 'review')::int`,
  }).from(projectsTable);

  const statusCounts = await db.select({
    status: projectsTable.status,
    count: sql<number>`count(*)::int`,
  }).from(projectsTable).groupBy(projectsTable.status);

  const typeCounts = await db.select({
    projectType: projectsTable.projectType,
    count: sql<number>`count(*)::int`,
  }).from(projectsTable).groupBy(projectsTable.projectType);

  res.json({
    totalProjects: totals?.total ?? 0,
    activeProjects: totals?.active ?? 0,
    completedProjects: totals?.completed ?? 0,
    pendingReview: totals?.pendingReview ?? 0,
    projectsByStatus: statusCounts,
    projectsByType: typeCounts,
  });
});

router.get("/dashboard/activity", async (_req, res): Promise<void> => {
  const activity = await db
    .select()
    .from(activityTable)
    .orderBy(sql`${activityTable.createdAt} desc`)
    .limit(20);

  res.json(activity.map(a => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  })));
});

export default router;
