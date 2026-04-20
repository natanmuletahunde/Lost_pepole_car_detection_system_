"use client";

import { useState, useRef } from "react";
import {
  Stack,
  Card,
  Group,
  Box,
  Text,
  Avatar,
  Button,
  TextInput,
  SimpleGrid,
  Badge,
} from "@mantine/core";
import { IconUser, IconCamera, IconMail, IconPhone, IconMapPin } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

const getBg = (colorScheme, light, dark) => (colorScheme === "dark" ? dark : light);
const getTextColor = (colorScheme, light, dark) => (colorScheme === "dark" ? dark : light);

export default function AccountTab({ user, setUser, setDirty, colorScheme }) {
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(user?.id);

  const handleInputChange = (field, value) => {
    setUser((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setDirty(true);
    }
  };

  const handleSaveChanges = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:3001/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const updatedUser = await response.json();
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setDirty(false);

      notifications.show({
        title: "Success",
        message: "Profile updated successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update profile",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap="xl">
      {/* Profile Photo */}
      <Card withBorder radius="md" padding="lg" bg={getBg(colorScheme, "white", "#2c2e33")}>
        <Group justify="space-between" align="flex-start">
          <Box>
            <Text fw={500} size="md" mb={4} c={getTextColor(colorScheme, "black", "white")}>
              Profile photo
            </Text>
            <Text size="xs" c="dimmed">Your photo helps others recognize you</Text>
          </Box>
          <Group gap="lg">
            <Avatar size={64} radius={64} src={profileImage} color="blue">
              {!profileImage && <IconUser size={32} />}
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: "none" }}
            />
            <Button
              variant="light"
              leftSection={<IconCamera size={16} />}
              onClick={() => fileInputRef.current.click()}
              size="sm"
            >
              Change
            </Button>
          </Group>
        </Group>
      </Card>

      {/* Personal Details */}
      <Card withBorder radius="md" padding="lg" bg={getBg(colorScheme, "white", "#2c2e33")}>
        <Text fw={500} size="md" mb="lg" c={getTextColor(colorScheme, "black", "white")}>
          Personal details
        </Text>

        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              label="First name"
              value={user?.firstName || ""}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
            />
            <TextInput
              label="Last name"
              value={user?.lastName || ""}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
            />
          </SimpleGrid>

          <TextInput
            label="Email address"
            value={user?.email || ""}
            disabled
            description="Your email cannot be changed"
            leftSection={<IconMail size={16} />}
          />

          <TextInput
            label="Phone number"
            value={user?.phone || ""}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+251 XXX XXX XXX"
            leftSection={<IconPhone size={16} />}
          />

          <TextInput
            label="Address"
            value={user?.address || ""}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="City, Ethiopia"
            leftSection={<IconMapPin size={16} />}
          />
        </Stack>
      </Card>

      {/* Save Button */}
      <Button
        color="blue"
        onClick={handleSaveChanges}
        loading={saving}
        fullWidth
      >
        Save Changes
      </Button>

      {/* Sync Status */}
      <Card withBorder radius="md" padding="lg" bg={getBg(colorScheme, "white", "#2c2e33")}>
        <Group justify="space-between">
          <Box>
            <Text fw={500} size="md" c={getTextColor(colorScheme, "black", "white")}>
              Sync is on
            </Text>
            <Text size="xs" c="dimmed">Your data is synced across devices</Text>
          </Box>
          <Badge color="green" size="lg">Active</Badge>
        </Group>
      </Card>
    </Stack>
  );
}