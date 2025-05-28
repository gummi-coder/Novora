
import React from "react";
import { SettingsLayout } from "@/components/layout/SettingsLayout";
import { IntegrationsForm } from "@/components/settings/IntegrationsForm";

export default function IntegrationSettings() {
  return (
    <SettingsLayout>
      <IntegrationsForm />
    </SettingsLayout>
  );
}
