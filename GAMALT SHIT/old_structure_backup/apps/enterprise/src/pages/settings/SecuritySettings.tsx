
import React from "react";
import { SettingsLayout } from "@/components/layout/SettingsLayout";
import { SecurityForm } from "@/components/settings/SecurityForm";

export default function SecuritySettings() {
  return (
    <SettingsLayout>
      <SecurityForm />
    </SettingsLayout>
  );
}
