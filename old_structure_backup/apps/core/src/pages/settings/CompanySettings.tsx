
import React from "react";
import { SettingsLayout } from "@/components/layout/SettingsLayout";
import { CompanyForm } from "@/components/settings/CompanyForm";

export default function CompanySettings() {
  return (
    <SettingsLayout>
      <CompanyForm />
    </SettingsLayout>
  );
}
