
import React from "react";
import { SettingsLayout } from "@/components/layout/SettingsLayout";
import { AccountForm } from "@/components/settings/AccountForm";

export default function AccountSettings() {
  return (
    <SettingsLayout>
      <AccountForm />
    </SettingsLayout>
  );
}
