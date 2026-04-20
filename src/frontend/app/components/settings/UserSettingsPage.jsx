"use client";

import React, { useState } from "react";
import { Container, Paper, Alert, Box, Group, Button, Text } from "@mantine/core";
import Link from "next/link";
import { IconCheck, IconX, IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsNavigation } from "./SettingsNavigation";
import { ProfileSection } from "./SettingsSections/ProfileSection";
import { SecuritySection } from "./SettingsSections/SecuritySection";
import { PreferencesSection } from "./SettingsSections/PreferencesSection";
import { NotificationsSection } from "./SettingsSections/NotificationsSection";
import { PrivacySection } from "./SettingsSections/PrivacySection";
import { useSettingsForm } from "./hooks/useSettingsForm";
import { useUnsavedChanges } from "./hooks/useUnsavedChanges";
import { validateSettings } from "./utils/validators";
import { GRADIENT_PRIMARY } from "./utils/constants";

export default function UserSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const settingsForm = useSettingsForm();
  const formData = settingsForm.formData;
  const isLoading = settingsForm.isLoading;
  const notification = settingsForm.notification;
  const setNotification = settingsForm.setNotification;
  const errors = settingsForm.errors;
  const setErrors = settingsForm.setErrors;
  const handleChange = settingsForm.handleChange;
  const saveSettings = settingsForm.saveSettings;
  
  const hasUnsavedChanges = useUnsavedChanges(formData);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateSettings(formData);
    const errorKeys = Object.keys(validationErrors);
    if (errorKeys.length > 0) {
      setErrors(validationErrors);
      setNotification({ type: "error", message: "Please fix the errors above" });
      return;
    }
    await saveSettings();
  };

  return (
    <Box style={{ minHeight: "100vh", background: "#f8faff" }}>
      <SettingsHeader hasUnsavedChanges={hasUnsavedChanges} />

      <Container size="xl" pb="xl">
        {/* Notification */}
        {notification && (
          <Alert
            mb="md"
            variant="filled"
            color={notification.type === "success" ? "green" : "red"}
            title={notification.type === "success" ? "Success!" : "Error!"}
            withCloseButton={true}
            onClose={() => setNotification(null)}
            style={{
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            }}
          >
            {notification.message}
          </Alert>
        )}

        {/* Navigation */}
        <SettingsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Form */}
        <Paper
          withBorder={true}
          shadow="xl"
          p="xl"
          radius="lg"
          style={{
            background: "white",
            border: "1px solid rgba(65, 88, 208, 0.1)",
            boxShadow: "0 20px 40px rgba(65, 88, 208, 0.08)",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Profile Section */}
            <div style={{ display: activeTab === "profile" ? "block" : "none" }}>
              <ProfileSection 
                formData={formData} 
                handleChange={handleChange} 
                errors={errors} 
              />
            </div>

            {/* Security Section */}
            <div style={{ display: activeTab === "security" ? "block" : "none" }}>
              <SecuritySection 
                formData={formData} 
                handleChange={handleChange} 
                errors={errors} 
              />
            </div>

            {/* Preferences Section */}
            <div style={{ display: activeTab === "preferences" ? "block" : "none" }}>
              <PreferencesSection 
                formData={formData} 
                handleChange={handleChange} 
              />
            </div>

            {/* Notifications Section */}
            <div style={{ display: activeTab === "notifications" ? "block" : "none" }}>
              <NotificationsSection 
                formData={formData} 
                handleChange={handleChange} 
              />
            </div>

            {/* Privacy Section */}
            <div style={{ display: activeTab === "privacy" ? "block" : "none" }}>
              <PrivacySection 
                formData={formData} 
                handleChange={handleChange} 
              />
            </div>

            {/* Form Actions */}
            <Group justify="space-between" mt="lg" pt="lg" style={{ borderTop: '1px solid #e9ecef' }}>
              <Button
                variant="light"
                color="gray"
                component={Link}
                href="/dashboard"
                size="lg"
                radius="md"
                leftSection={<IconX size={20} />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading || !hasUnsavedChanges}
                size="lg"
                radius="md"
                leftSection={<IconCheck size={20} />}
                style={{
                  background: GRADIENT_PRIMARY,
                  transition: 'all 0.3s ease',
                }}
              >
                {isLoading ? "Saving..." : "Save changes"}
              </Button>
            </Group>
          </form>
        </Paper>

        {/* Info Card */}
        <Alert
          mt="xl"
          variant="light"
          color="blue"
          title="🔒 About your data"
          radius="lg"
          styles={{
            root: {
              border: '1px solid rgba(65, 88, 208, 0.2)',
              background: 'linear-gradient(135deg, rgba(65, 88, 208, 0.05) 0%, rgba(200, 80, 192, 0.05) 100%)',
            },
          }}
        >
          <Text size="sm">
            Your settings are stored locally in this demo. In a real app, they would be saved to our servers securely with end-to-end encryption.
          </Text>
        </Alert>
      </Container>
    </Box>
  );
}