
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Save, Send } from "lucide-react";
import { Link } from 'react-router-dom';

// Define the form schema
const basicInfoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  language: z.string().min(1, "Language is required"),
});

type FormValues = z.infer<typeof basicInfoSchema>;

const SurveyBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [activeTab, setActiveTab] = useState("basic-info");
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: "",
      description: "",
      language: "en",
    },
  });

  const onSubmit = (values: FormValues) => {
    console.log(values);
    toast.success(isEditing ? "Survey updated successfully" : "Survey created successfully");
    navigate("/surveys");
  };

  const handleSaveDraft = () => {
    const values = form.getValues();
    console.log("Saving draft:", values);
    toast.success("Draft saved successfully");
  };

  return (
    <DashboardLayout>
      <div className="py-4">
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link to="/surveys">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">
            {isEditing ? "Edit Survey" : "Create New Survey"}
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
            <TabsTrigger value="review">Review & Publish</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic-info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Survey Details</CardTitle>
                <CardDescription>
                  Enter the basic information for your survey.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter survey title" {...field} />
                          </FormControl>
                          <FormDescription>
                            This will be displayed as the title of your survey.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter a description for your survey"
                              className="h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional: Provide context about the purpose of this survey.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                              <SelectItem value="ja">Japanese</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="mr-2 h-4 w-4" />
                  Save as Draft
                </Button>
                <Button onClick={() => setActiveTab("questions")}>
                  Continue to Questions
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Survey Questions</CardTitle>
                <CardDescription>
                  Add, edit, and arrange questions for your survey.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">
                    This section will contain the question builder with drag-and-drop functionality.
                  </p>
                  <Button className="mt-4">
                    Add Question
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("basic-info")}>
                  Back
                </Button>
                <Button onClick={() => setActiveTab("delivery")}>
                  Continue to Delivery
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Delivery Tab */}
          <TabsContent value="delivery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Settings</CardTitle>
                <CardDescription>
                  Configure how and when your survey will be delivered.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">
                    This section will contain delivery settings such as channels, schedule, and reminders.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("questions")}>
                  Back
                </Button>
                <Button onClick={() => setActiveTab("review")}>
                  Continue to Review
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Review & Publish</CardTitle>
                <CardDescription>
                  Review your survey before publishing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">
                    This section will display a preview of the survey.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("delivery")}>
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSaveDraft}>
                    <Save className="mr-2 h-4 w-4" />
                    Save as Draft
                  </Button>
                  <Button onClick={form.handleSubmit(onSubmit)}>
                    <Send className="mr-2 h-4 w-4" />
                    {isEditing ? "Update Survey" : "Publish Survey"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SurveyBuilder;
