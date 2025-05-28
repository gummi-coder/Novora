import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  companySize: string;
  role: string;
  plan: string;
  acceptTerms: boolean;
}

interface TrialSignupProps {
  onComplete: (formData: FormData) => void;
  onCancel: () => void;
}

const steps = [
  { id: 1, title: "Personal Information" },
  { id: 2, title: "Company Details" },
  { id: 3, title: "Choose Your Plan" },
  { id: 4, title: "Confirm Details" },
];

export function TrialSignup({ onComplete, onCancel }: TrialSignupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    companySize: "",
    role: "",
    plan: "",
    acceptTerms: false,
  });

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onCancel();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companySize">Company Size</Label>
              <Select
                value={formData.companySize}
                onValueChange={(value) => handleInputChange("companySize", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501+">501+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Your Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ceo">CEO / Founder</SelectItem>
                  <SelectItem value="cto">CTO / Technical Lead</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Your Plan</Label>
              <div className="grid gap-4">
                {["Basic", "Pro", "Enterprise"].map((plan) => (
                  <Card
                    key={plan}
                    className={`cursor-pointer ${
                      formData.plan === plan ? "border-primary" : ""
                    }`}
                    onClick={() => handleInputChange("plan", plan)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{plan}</h4>
                          <p className="text-sm text-muted-foreground">
                            {plan === "Basic"
                              ? "Perfect for small teams"
                              : plan === "Pro"
                              ? "Ideal for growing businesses"
                              : "For large organizations"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${plan === "Basic" ? "29" : plan === "Pro" ? "99" : "299"}
                          </p>
                          <p className="text-sm text-muted-foreground">/month</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Personal Information</h4>
              <p>
                {formData.firstName} {formData.lastName}
              </p>
              <p>{formData.email}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Company Details</h4>
              <p>{formData.company}</p>
              <p>Size: {formData.companySize} employees</p>
              <p>Role: {formData.role}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Selected Plan</h4>
              <p>{formData.plan}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) =>
                  handleInputChange("acceptTerms", checked as boolean)
                }
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the terms and conditions
              </Label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Start Your Free Trial</CardTitle>
        <div className="flex justify-between mt-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex-1 text-center ${
                step.id === currentStep ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                  step.id === currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {step.id}
              </div>
              <p className="text-sm mt-2">{step.title}</p>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {renderStepContent()}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              currentStep === steps.length ||
              (currentStep === steps.length - 1 && !formData.acceptTerms)
            }
          >
            {currentStep === steps.length ? "Start Trial" : "Next"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 