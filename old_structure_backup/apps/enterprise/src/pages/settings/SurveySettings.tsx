
import React from "react";
import { SettingsLayout } from "@/components/layout/SettingsLayout";
import { SurveyDefaultsForm } from "@/components/settings/SurveyDefaultsForm";

export default function SurveySettings() {
  return (
    <SettingsLayout>
      <SurveyDefaultsForm />
    </SettingsLayout>
  );
}
