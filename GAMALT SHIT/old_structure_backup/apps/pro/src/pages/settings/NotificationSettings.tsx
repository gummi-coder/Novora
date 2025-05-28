
import React from "react";
import { SettingsLayout } from "@/components/layout/SettingsLayout";
import { NotificationForm } from "@/components/settings/NotificationForm";

export default function NotificationSettings() {
  return (
    <SettingsLayout>
      <NotificationForm />
    </SettingsLayout>
  );
}
