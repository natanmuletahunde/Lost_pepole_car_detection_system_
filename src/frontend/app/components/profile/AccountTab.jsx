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
import { useTranslations } from "next-intl";

const getBg = (colorScheme, light, dark) => (colorScheme === "dark" ? dark : light);
const getTextColor = (colorScheme, light, dark) => (colorScheme === "dark" ? dark : light);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export default function AccountTab({ user, setUser, setDirty, colorScheme, onSave }) {
  const t = useTranslations("Profile");
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);
  const [saving, setSaving] = useState(false);
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
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (!token) {
      notifications.show({
        title: t("verification"),
        message: t("authReqDesc"),
        color: "yellow",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          profileImage: profileImage || user?.profileImage || "",
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const result = await response.json();
      const apiUser = result?.data?.user || {};
      const updatedUser = {
        ...user,
        id: apiUser._id || apiUser.id || user?.id,
        firstName: apiUser.firstName || user?.firstName,
        lastName: apiUser.lastName || user?.lastName,
        email: apiUser.email || user?.email,
        phone: apiUser.phone || user?.phone,
        address: apiUser.address || "",
        profileImage: apiUser.profileImage || profileImage || "",
        role: apiUser.role || user?.role,
      };
      setUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      if (onSave) onSave(updatedUser);
      setDirty(false);

      notifications.show({
        title: t("verified"),
        message: t("successSave"),
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: t("errorUpdate"),
        message: error.message || t("errorUpdate"),
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
              {t("photoTitle")}
            </Text>
            <Text size="xs" c="dimmed">{t("photoDesc")}</Text>
          </Box>
          <Group gap="lg">
            <Avatar size={64} radius={64} src={profileImage || user?.profileImage || null} color="blue">
              {!profileImage && !user?.profileImage && <IconUser size={32} />}
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
              {t("change")}
            </Button>
          </Group>
        </Group>
      </Card>

      {/* Personal Details */}
      <Card withBorder radius="md" padding="lg" bg={getBg(colorScheme, "white", "#2c2e33")}>
        <Text fw={500} size="md" mb="lg" c={getTextColor(colorScheme, "black", "white")}>
          {t("personalDetails")}
        </Text>

        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              label={t("firstName")}
              value={user?.firstName || ""}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
            />
            <TextInput
              label={t("lastName")}
              value={user?.lastName || ""}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
            />
          </SimpleGrid>

          <TextInput
            label={t("emailAddress")}
            value={user?.email || ""}
            disabled
            description={t("emailLocked")}
            leftSection={<IconMail size={16} />}
          />

          <TextInput
            label={t("phone")}
            value={user?.phone || ""}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder={t("phonePlaceholder")}
            leftSection={<IconPhone size={16} />}
          />

          <TextInput
            label={t("address")}
            value={user?.address || ""}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder={t("addressPlaceholder")}
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
        {t("save")}
      </Button>

      {/* Sync Status */}
      <Card withBorder radius="md" padding="lg" bg={getBg(colorScheme, "white", "#2c2e33")}>
        <Group justify="space-between">
          <Box>
            <Text fw={500} size="md" c={getTextColor(colorScheme, "black", "white")}>
              {t("syncOn")}
            </Text>
            <Text size="xs" c="dimmed">{t("syncDesc")}</Text>
          </Box>
          <Badge color="green" size="lg">{t("activeAccount")}</Badge>
        </Group>
      </Card>
    </Stack>
  );
}