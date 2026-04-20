"use client";

import { Box, Stack, Text, UnstyledButton, Group, Divider } from "@mantine/core";
import {
  IconUser,
  IconShieldLock,
  IconBrush,
  IconClock,
  IconLogout,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const getTextColor = (colorScheme, light, dark) =>
  colorScheme === "dark" ? dark : light;

const navItems = [
  { id: "account", label: "Your account", icon: IconUser },
  { id: "security", label: "Security", icon: IconShieldLock },
  { id: "appearance", label: "Appearance", icon: IconBrush },
  { id: "alert-history", label: "Alert history", icon: IconClock },
];

export default function ProfileSidebar({ activeTab, setActiveTab, colorScheme }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isAuthenticated");
    router.push("/");
  };

  return (
    <Box
      w={280}
      bg={colorScheme === "dark" ? "#1a1b1e" : "#fff"}
      style={{
        borderRight: `1px solid ${colorScheme === "dark" ? "#2c2e33" : "#eaeef2"}`,
        height: "calc(100vh - 70px)",
        position: "sticky",
        top: 70,
        overflowY: "auto",
      }}
      p="md"
    >
      <Stack gap="lg">
        <Stack gap={2}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <UnstyledButton
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  backgroundColor: isActive
                    ? colorScheme === "dark"
                      ? "#2c2e33"
                      : "#e8f0fe"
                    : "transparent",
                }}
              >
                <Group gap="sm">
                  <Icon
                    size={18}
                    color={isActive ? "#228be6" : "#5f6368"}
                  />
                  <Text
                    size="sm"
                    c={isActive ? "blue" : getTextColor(colorScheme, "black", "#e0e0e0")}
                  >
                    {item.label}
                  </Text>
                </Group>
              </UnstyledButton>
            );
          })}
        </Stack>

        <Divider my="md" />

        <UnstyledButton
          onClick={handleLogout}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
          }}
        >
          <Group gap="sm">
            <IconLogout size={18} color="#fa5252" />
            <Text size="sm" c="red.6">
              Sign out
            </Text>
          </Group>
        </UnstyledButton>
      </Stack>
    </Box>
  );
}