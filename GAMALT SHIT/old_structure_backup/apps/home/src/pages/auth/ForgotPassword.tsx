
import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimateOnScroll from "@/components/AnimateOnScroll";

// Form schema validation
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type FormValues = z.infer<typeof formSchema>;

const ForgotPassword = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    // Simulate API call
    console.log("Password reset requested for:", values.email);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, we'll just show a toast
    toast({
      title: "Reset link sent!",
      description: "Check your email for instructions to reset your password.",
    });
    
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <>
      <Navbar />
      <main>
        <section className="pt-32 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <AnimateOnScroll>
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-heading font-bold">Forgot Password</h1>
                  <p className="text-gray-600 mt-2">
                    {isSubmitted 
                      ? "Check your email for reset instructions" 
                      : "Enter your email to receive a password reset link"}
                  </p>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll delay={1}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                  {!isSubmitted ? (
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="name@company.com"
                                  type="email"
                                  disabled={isLoading}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-novora-600 to-teal-500 text-white"
                          disabled={isLoading}
                        >
                          {isLoading ? "Sending..." : "Send Reset Link"}
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">Check Your Email</h3>
                      <p className="text-gray-600 mb-6">
                        We've sent a password reset link to your email address. Please check your inbox and spam folder.
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        The link will expire in 1 hour.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => setIsSubmitted(false)}
                      >
                        Try a different email
                      </Button>
                    </div>
                  )}

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Remember your password?{" "}
                      <Link
                        to="/auth/signin"
                        className="font-medium text-novora-600 hover:text-novora-700"
                      >
                        Back to Sign In
                      </Link>
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ForgotPassword;
