
import React from "react";
import { SettingsLayout } from "@/components/layout/SettingsLayout";
import { BrandingForm } from "@/components/settings/BrandingForm";

export default function BrandingSettings() {
  return (
    <SettingsLayout>
      <BrandingForm />
    </SettingsLayout>
  );
}
