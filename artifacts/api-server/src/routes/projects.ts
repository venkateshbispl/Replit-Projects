import { Router, type IRouter } from "express";
import { eq, sql, count } from "drizzle-orm";
import { db, projectsTable, projectFilesTable, messagesTable, activityTable } from "@workspace/db";
import {
  CreateProjectBody,
  UpdateProjectBody,
  UpdateProjectParams,
  GetProjectParams,
  GetProjectFilesParams,
  UploadProjectFileBody,
  UploadProjectFileParams,
  GetProjectMessagesParams,
  CreateProjectMessageBody,
  CreateProjectMessageParams,
  GetProjectsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  const s = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(s, 10);
}

router.get("/projects", async (req, res): Promise<void> => {
  const parsed = GetProjectsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const projects = await db
    .select({
      id: projectsTable.id,
      title: projectsTable.title,
      description: projectsTable.description,
      projectType: projectsTable.projectType,
      status: projectsTable.status,
      priority: projectsTable.priority,
      clientName: projectsTable.clientName,
      clientEmail: projectsTable.clientEmail,
      budget: projectsTable.budget,
      deadline: projectsTable.deadline,
      createdAt: projectsTable.createdAt,
      updatedAt: projectsTable.updatedAt,
      fileCount: sql<number>`(select count(*) from project_files where project_files.project_id = ${projectsTable.id})::int`,
      messageCount: sql<number>`(select count(*) from messages where messages.project_id = ${projectsTable.id})::int`,
    })
    .from(projectsTable)
    .where(parsed.data.status ? eq(projectsTable.status, parsed.data.status) : undefined)
    .orderBy(projectsTable.createdAt);

  res.json(projects.map(p => ({
    ...p,
    budget: p.budget != null ? Number(p.budget) : null,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  })));
});

router.post("/projects", async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { budget, ...rest } = parsed.data;
  const [project] = await db.insert(projectsTable).values({
    ...rest,
    budget: budget != null ? String(budget) : null,
  }).returning();

  await db.insert(activityTable).values({
    type: "project_created",
    projectId: project.id,
    projectTitle: project.title,
    description: `New ${project.projectType.replace("_", " ")} project submitted`,
    actorName: project.clientName,
    actorRole: "client",
  });

  res.status(201).json({
    ...project,
    budget: project.budget != null ? Number(project.budget) : null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    fileCount: 0,
    messageCount: 0,
  });
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const [project] = await db
    .select({
      id: projectsTable.id,
      title: projectsTable.title,
      description: projectsTable.description,
      projectType: projectsTable.projectType,
      status: projectsTable.status,
      priority: projectsTable.priority,
      clientName: projectsTable.clientName,
      clientEmail: projectsTable.clientEmail,
      budget: projectsTable.budget,
      deadline: projectsTable.deadline,
      createdAt: projectsTable.createdAt,
      updatedAt: projectsTable.updatedAt,
      fileCount: sql<number>`(select count(*) from project_files where project_files.project_id = ${projectsTable.id})::int`,
      messageCount: sql<number>`(select count(*) from messages where messages.project_id = ${projectsTable.id})::int`,
    })
    .from(projectsTable)
    .where(eq(projectsTable.id, id));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const files = await db.select().from(projectFilesTable).where(eq(projectFilesTable.projectId, id));
  const messages = await db.select().from(messagesTable).where(eq(messagesTable.projectId, id)).orderBy(messagesTable.createdAt);

  res.json({
    ...project,
    budget: project.budget != null ? Number(project.budget) : null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    files: files.map(f => ({ ...f, uploadedAt: f.uploadedAt.toISOString() })),
    messages: messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })),
  });
});

router.patch("/projects/:id", async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const { budget, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };
  if (budget !== undefined) {
    updateData.budget = budget != null ? String(budget) : null;
  }

  const [updated] = await db.update(projectsTable).set(updateData).where(eq(projectsTable.id, id)).returning();

  if (parsed.data.status && parsed.data.status !== existing.status) {
    await db.insert(activityTable).values({
      type: "status_changed",
      projectId: id,
      projectTitle: updated.title,
      description: `Project status changed to ${parsed.data.status.replace("_", " ")}`,
      actorName: "Studio",
      actorRole: "designer",
    });
  }

  res.json({
    ...updated,
    budget: updated.budget != null ? Number(updated.budget) : null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    fileCount: 0,
    messageCount: 0,
  });
});

router.get("/projects/:id/files", async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const files = await db.select().from(projectFilesTable).where(eq(projectFilesTable.projectId, id));
  res.json(files.map(f => ({ ...f, uploadedAt: f.uploadedAt.toISOString() })));
});

router.post("/projects/:id/files", async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const parsed = UploadProjectFileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const [file] = await db.insert(projectFilesTable).values({ ...parsed.data, projectId: id }).returning();

  await db.insert(activityTable).values({
    type: "file_uploaded",
    projectId: id,
    projectTitle: project.title,
    description: `File "${parsed.data.fileName}" uploaded by ${parsed.data.uploadedBy}`,
    actorName: parsed.data.uploadedBy === "client" ? project.clientName : "Studio",
    actorRole: parsed.data.uploadedBy,
  });

  res.status(201).json({ ...file, uploadedAt: file.uploadedAt.toISOString() });
});

router.get("/projects/:id/messages", async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const messages = await db.select().from(messagesTable).where(eq(messagesTable.projectId, id)).orderBy(messagesTable.createdAt);
  res.json(messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })));
});

router.post("/projects/:id/messages", async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const parsed = CreateProjectMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const [message] = await db.insert(messagesTable).values({ ...parsed.data, projectId: id }).returning();

  await db.insert(activityTable).values({
    type: "message_sent",
    projectId: id,
    projectTitle: project.title,
    description: `Message from ${parsed.data.senderName}`,
    actorName: parsed.data.senderName,
    actorRole: parsed.data.senderRole,
  });

  res.status(201).json({ ...message, createdAt: message.createdAt.toISOString() });
});

export default router;
