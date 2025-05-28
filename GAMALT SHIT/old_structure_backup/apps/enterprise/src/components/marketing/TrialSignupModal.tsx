import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrialSignup } from "./TrialSignup";
import { toast } from "sonner";

interface TrialSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrialSignupModal({ isOpen, onClose }: TrialSignupModalProps) {
  const handleComplete = async (formData: any) => {
    try {
      const response = await fetch("/api/auth/trial-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to sign up for trial");
      }

      toast.success("Welcome! Your trial has started.");
      onClose();
    } catch (error) {
      toast.error("Failed to start trial. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Start Your Free Trial</DialogTitle>
        </DialogHeader>
        <TrialSignup onComplete={handleComplete} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
} 