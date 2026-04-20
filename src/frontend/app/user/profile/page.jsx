"use client";

import { useState, useEffect } from "react";
import { Box, Group, Title, ActionIcon, Button, Flex, Container } from "@mantine/core";
import { useMantineColorScheme } from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

// Import components
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import AccountTab from "../../components/profile/AccountTab";
import SecurityTab from "../../components/profile/SecurityTab";
import AppearanceTab from "../../components/profile/AppearanceTab";
import AlertHistoryTab from "../../components/profile/AlertHistoryTab";

// Helper
const getBg = (colorScheme, light, dark) => (colorScheme === "dark" ? dark : light);
const getBorderColor = (colorScheme) => (colorScheme === "dark" ? "#2c2e33" : "#eaeef2");

export default function ProfilePage() {
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme();
  const [activeTab, setActiveTab] = useState("account");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Box bg={getBg(colorScheme, "#fff", "#1a1b1e")} style={{ minHeight: "100vh" }}>
        <Container size="lg" py={48}>
          <div>Loading...</div>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={getBg(colorScheme, "#fff", "#1a1b1e")} style={{ minHeight: "100vh" }}>
      {/* Header */}
      <Box
        bg={getBg(colorScheme, "#fff", "#1a1b1e")}
        style={{
          borderBottom: `1px solid ${getBorderColor(colorScheme)}`,
          padding: "12px 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Group justify="space-between">
          <Group gap="sm">
            <ActionIcon variant="subtle" onClick={() => router.back()} size="lg">
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={4} fw={400}>Settings</Title>
          </Group>
        </Group>
      </Box>

      <Flex justify="center">
        <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} colorScheme={colorScheme} />

        <Box style={{ flex: 1, padding: "32px", maxWidth: 900, margin: "0 auto" }}>
          {activeTab === "account" && <AccountTab user={user} setUser={setUser} setDirty={setDirty} colorScheme={colorScheme} />}
          {activeTab === "security" && <SecurityTab colorScheme={colorScheme} />}
          {activeTab === "appearance" && <AppearanceTab colorScheme={colorScheme} />}
          {activeTab === "alert-history" && <AlertHistoryTab colorScheme={colorScheme} />}
        </Box>
      </Flex>
    </Box>
  );
}