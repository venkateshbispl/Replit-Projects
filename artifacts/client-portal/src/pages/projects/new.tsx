import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateProject, useUploadProjectFile } from "@workspace/api-client-react";
import { ArrowLeft, Loader2, UploadCloud } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Please provide more details about your request"),
  projectType: z.enum(["logo", "branding", "web_design", "social_media", "print", "illustration", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  clientName: z.string().min(2, "Name is required"),
  clientEmail: z.string().email("Invalid email address"),
  budget: z.coerce.number().optional().nullable(),
  deadline: z.string().optional().nullable(),
});

export default function NewProject() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createProject = useCreateProject();
  const uploadFile = useUploadProjectFile();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      projectType: "web_design",
      priority: "medium",
      clientName: "",
      clientEmail: "",
      budget: null,
      deadline: null,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const project = await createProject.mutateAsync({
        data: {
          ...values,
          deadline: values.deadline ? new Date(values.deadline).toISOString() : null,
        }
      });

      // Simulate file upload if files were selected
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          await uploadFile.mutateAsync({
            id: project.id,
            data: {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type || "application/octet-stream",
              uploadedBy: "client",
              url: `https://placeholder-storage.com/${file.name}`
            }
          });
        }
      }

      toast({
        title: "Project request submitted",
        description: "We'll review your request and get back to you shortly.",
      });
      setLocation(`/projects/${project.id}`);
    } catch (error) {
      toast({
        title: "Error submitting request",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href="/projects">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Project Request</h1>
          <p className="text-muted-foreground mt-1">Fill out the details below to start a new design project.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>What do you need help with?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Acme Corp Rebranding" {...field} className="bg-muted/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/50">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="logo">Logo Design</SelectItem>
                          <SelectItem value="branding">Brand Identity</SelectItem>
                          <SelectItem value="web_design">Web Design</SelectItem>
                          <SelectItem value="social_media">Social Media Assets</SelectItem>
                          <SelectItem value="print">Print Design</SelectItem>
                          <SelectItem value="illustration">Illustration</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/50">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low - No rush</SelectItem>
                          <SelectItem value="medium">Medium - Standard timeframe</SelectItem>
                          <SelectItem value="high">High - Needed soon</SelectItem>
                          <SelectItem value="urgent">Urgent - ASAP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Brief</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your goals, target audience, and any specific requirements..."
                        className="min-h-[150px] bg-muted/50 resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The more detail you provide, the better we can estimate and execute your project.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Budget ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5000" {...field} value={field.value || ''} className="bg-muted/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ''} className="bg-muted/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How should we reach you about this project?</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} className="bg-muted/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} className="bg-muted/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-muted/30">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-xl">
              <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <UploadCloud className="size-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Attach Files</h3>
              <p className="text-muted-foreground text-sm max-w-xs mb-6">
                Upload brand guidelines, existing assets, or inspiration images.
              </p>
              
              <div className="relative">
                <Input 
                  type="file" 
                  multiple 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleFileChange}
                />
                <Button type="button" variant="outline">Select Files</Button>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mt-6 text-sm text-left w-full max-w-sm space-y-2">
                  <p className="font-medium text-foreground">Selected files:</p>
                  <ul className="space-y-1">
                    {selectedFiles.map((file, i) => (
                      <li key={i} className="flex items-center gap-2 text-muted-foreground bg-background p-2 rounded-md border">
                        <UploadCloud className="size-4 shrink-0" />
                        <span className="truncate">{file.name}</span>
                        <span className="ml-auto text-xs shrink-0">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="ghost" asChild>
              <Link href="/projects">Cancel</Link>
            </Button>
            <Button type="submit" size="lg" disabled={createProject.isPending}>
              {createProject.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Submit Request
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
