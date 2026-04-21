import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetProject, 
  useGetProjectFiles,
  useGetProjectMessages,
  useCreateProjectMessage, 
  useUploadProjectFile,
  useUpdateProject,
  getGetProjectQueryKey,
  getGetProjectFilesQueryKey,
  getGetProjectMessagesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Paperclip, 
  Send, 
  Download, 
  FileText, 
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  UploadCloud,
  Pencil
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, PriorityBadge, formatType } from "@/components/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_STEPS = ["pending", "in_progress", "review", "delivered", "completed"];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: project, isLoading: isLoadingProject } = useGetProject(projectId, {
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId) }
  });

  const { data: files, isLoading: isLoadingFiles } = useGetProjectFiles(projectId, {
    query: { enabled: !!projectId, queryKey: getGetProjectFilesQueryKey(projectId) }
  });

  const { data: messages, isLoading: isLoadingMessages } = useGetProjectMessages(projectId, {
    query: { enabled: !!projectId, queryKey: getGetProjectMessagesQueryKey(projectId) }
  });

  const createMessage = useCreateProjectMessage();
  const uploadFile = useUploadProjectFile();
  const updateProject = useUpdateProject();
  
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !project) return;
    
    try {
      await createMessage.mutateAsync({
        id: projectId,
        data: {
          content: message,
          senderName: project.clientName,
          senderRole: "client"
        }
      });
      setMessage("");
      queryClient.invalidateQueries({ queryKey: getGetProjectMessagesQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
    } catch (err) {
      toast({ title: "Failed to send message", variant: "destructive" });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadFile.mutateAsync({
        id: projectId,
        data: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || "application/octet-stream",
          uploadedBy: "client",
          url: `https://placeholder-storage.com/${file.name}`
        }
      });
      toast({ title: "File uploaded successfully" });
      queryClient.invalidateQueries({ queryKey: getGetProjectFilesQueryKey(projectId) });
      queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
    } catch (err) {
      toast({ title: "Failed to upload file", variant: "destructive" });
    }
  };

  const handleMarkCompleted = async () => {
    try {
      await updateProject.mutateAsync({
        id: projectId,
        data: { status: "completed" }
      });
      toast({ title: "Project marked as completed" });
      queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
    } catch (err) {
      toast({ title: "Failed to update project", variant: "destructive" });
    }
  };

  const isLoading = isLoadingProject || isLoadingFiles || isLoadingMessages;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-md" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  const currentStepIndex = STATUS_STEPS.indexOf(project.status);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="shrink-0 mt-1">
            <Link href="/projects">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
              <StatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{formatType(project.projectType)}</span>
              <span>•</span>
              <span>Requested {format(new Date(project.createdAt), "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" className="shrink-0">
          <MoreVertical className="size-4 mr-2" />
          Actions
        </Button>
      </div>

      {/* Progress Timeline */}
      <Card className="border-none shadow-sm overflow-hidden bg-card">
        <div className="px-6 py-8">
          <div className="relative flex justify-between">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-in-out"
                style={{ width: `${(Math.max(currentStepIndex, 0) / (STATUS_STEPS.length - 1)) * 100}%` }}
              />
            </div>
            
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step} className="relative z-10 flex flex-col items-center gap-3 group">
                  <div 
                    className={`size-8 rounded-full flex items-center justify-center transition-all duration-500
                      ${isCurrent ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110' : 
                        isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                  >
                    {isCompleted && !isCurrent ? <CheckCircle2 className="size-5" /> : 
                     isCurrent ? <Clock className="size-4 animate-pulse" /> : 
                     <span className="text-xs font-bold">{index + 1}</span>}
                  </div>
                  <span className={`text-xs font-medium uppercase tracking-wider absolute top-10 whitespace-nowrap
                    ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="brief" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
              <TabsTrigger value="brief" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-medium">
                Project Brief
              </TabsTrigger>
              <TabsTrigger value="messages" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-medium">
                Messages
                <span className="ml-2 bg-primary/10 text-primary py-0.5 px-2 rounded-full text-xs">
                  {(messages || project.messages).length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="files" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 font-medium">
                Files
                <span className="ml-2 bg-primary/10 text-primary py-0.5 px-2 rounded-full text-xs">
                  {(files || project.files).length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="brief" className="mt-0 focus-visible:outline-none">
              <Card className="border-none shadow-sm">
                <CardContent className="p-8 prose prose-slate dark:prose-invert max-w-none">
                  <h3>Description</h3>
                  <p className="whitespace-pre-wrap">{project.description}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="mt-0 focus-visible:outline-none">
              <Card className="border-none shadow-sm flex flex-col h-[600px]">
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6"
                >
                  {project.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                      <MessageSquare className="size-12 opacity-20 mb-4" />
                      <p>No messages yet.</p>
                      <p className="text-sm">Send a message to start the conversation.</p>
                    </div>
                  ) : (
                    project.messages.map((msg) => {
                      const isClient = msg.senderRole === "client";
                      return (
                        <div key={msg.id} className={`flex gap-4 max-w-[85%] ${isClient ? 'ml-auto flex-row-reverse' : ''}`}>
                          <Avatar className="size-8 shrink-0">
                            <AvatarFallback className={isClient ? "bg-primary text-primary-foreground" : "bg-sidebar text-sidebar-foreground"}>
                              {msg.senderName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-1 px-1">
                              <span className="text-sm font-medium">{msg.senderName}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(msg.createdAt), "h:mm a")}
                              </span>
                            </div>
                            <div className={`p-4 rounded-2xl ${
                              isClient 
                                ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                                : 'bg-muted/50 text-foreground rounded-tl-sm'
                            }`}>
                              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="p-4 border-t bg-card shrink-0">
                  <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <Textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..." 
                      className="min-h-[80px] max-h-[200px] resize-y bg-muted/30 focus-visible:ring-1 border-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="shrink-0 size-10 rounded-full"
                      disabled={!message.trim() || createMessage.isPending}
                    >
                      <Send className="size-4" />
                    </Button>
                  </form>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="mt-0 focus-visible:outline-none space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Project Files</h3>
                <div className="relative">
                  <Input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
                    onChange={handleFileUpload}
                    disabled={uploadFile.isPending}
                  />
                  <Button variant="outline" size="sm" className="gap-2 relative z-0" disabled={uploadFile.isPending}>
                    {uploadFile.isPending ? <Clock className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
                    Upload File
                  </Button>
                </div>
              </div>

              {project.files.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted/10">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Paperclip className="size-10 opacity-20 mb-4" />
                    <p>No files uploaded yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.files.map((file) => (
                    <Card key={file.id} className="border-none shadow-sm hover-elevate transition-all group overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex items-center gap-4 p-4">
                          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            {file.fileType.includes('image') ? <ImageIcon className="size-5" /> : <FileText className="size-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate" title={file.fileName}>{file.fileName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {(file.fileSize / 1024 / 1024).toFixed(2)} MB • {format(new Date(file.uploadedAt), "MMM d")}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Download className="size-4" />
                          </Button>
                        </div>
                        <div className={`px-4 py-2 text-xs border-t bg-muted/30 ${
                          file.uploadedBy === 'designer' ? 'text-primary font-medium' : 'text-muted-foreground'
                        }`}>
                          Uploaded by {file.uploadedBy}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">{project.clientName}</p>
                <p className="text-sm text-primary">{project.clientEmail}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-medium">{project.budget ? `$${project.budget.toLocaleString()}` : "Not specified"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Target Deadline</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {project.deadline ? format(new Date(project.deadline), "MMMM d, yyyy") : "Not specified"}
                  </p>
                  {project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed' && (
                    <AlertCircle className="size-4 text-destructive" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Need help?</h3>
              <p className="text-primary-foreground/80 text-sm mb-4">
                If you have questions about your project or need to make urgent changes to the brief.
              </p>
              <Button variant="secondary" className="w-full bg-white text-primary hover:bg-white/90">
                Contact Studio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
