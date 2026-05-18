"use client";

import { useState, useEffect } from "react";
import {
  Stack,
  Card,
  Text,
  Button,
  Group,
  Switch,
  Collapse,
  Paper,
  Alert,
  PinInput,
  SimpleGrid,
  Modal,
  PasswordInput,
  Progress,
  Box,  // ← ADDED
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconKey, IconInfoCircle, IconAlertTriangle, IconCheck, IconX } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { notifications } from "@mantine/notifications";
import { useTranslations } from "next-intl";

const getBg = (colorScheme, light, dark) => (colorScheme === "dark" ? dark : light);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

// Password schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[a-z]/, "Must contain lowercase")
      .regex(/\d/, "Must contain number")
      .regex(/[!@#$%^&*]/, "Must contain special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Simple hash function
const simpleHash = async (str) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export default function SecurityTab({ colorScheme }) {
  const t = useTranslations("Profile");
  const [pwdOpened, { open: openPwd, close: closePwd }] = useDisclosure(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [setupMode, setSetupMode] = useState("setup");
  const [pinValue, setPinValue] = useState("");
  const [confirmPinValue, setConfirmPinValue] = useState("");
  const [pinError, setPinError] = useState("");

  // Password form
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  // Load 2FA state
  useEffect(() => {
    const enabled = localStorage.getItem("twoFactorEnabled") === "true";
    setTwoFactorEnabled(enabled);
  }, []);

  // Calculate password strength
  useEffect(() => {
    const password = passwordForm.watch("newPassword");
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[!@#$%^&*]/.test(password)) strength += 25;

    setPasswordStrength(Math.min(strength, 100));
  }, [passwordForm.watch("newPassword")]);

  const handlePasswordChange = async (data) => {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      if (!token) throw new Error("Please login again.");

      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update password");
      }

      notifications.show({
        title: t("pwdUpdated"),
        message: t("pwdUpdatedMsg"),
        color: "green",
        icon: <IconCheck size={18} />,
      });
      closePwd();
      passwordForm.reset();
    } catch (error) {
      notifications.show({
        title: t("pwdUpdateFailed"),
        message: error.message || t("pwdUpdateError"),
        color: "red",
        icon: <IconX size={18} />,
      });
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return "red";
    if (passwordStrength < 60) return "orange";
    if (passwordStrength < 80) return "yellow";
    return "green";
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 30) return t("weak");
    if (passwordStrength < 60) return t("fair");
    if (passwordStrength < 80) return t("goodStrength");
    return t("strong");
  };

  // 2FA handlers
  const handleTwoFactorToggle = (checked) => {
    if (checked && !twoFactorEnabled) {
      setSetupMode("setup");
      setShow2FASetup(true);
    } else if (!checked && twoFactorEnabled) {
      setSetupMode("disable");
      setShow2FASetup(true);
    }
  };

  const handleEnable2FA = async () => {
    if (pinValue.length !== 6 || !/^\d+$/.test(pinValue)) {
      setPinError(t("pinErrorDigit"));
      return;
    }
    if (pinValue !== confirmPinValue) {
      setPinError(t("pinErrorMatch"));
      return;
    }
    const hash = await simpleHash(pinValue);
    localStorage.setItem("twoFactorEnabled", "true");
    localStorage.setItem("twoFactorPinHash", hash);
    setTwoFactorEnabled(true);
    setShow2FASetup(false);
    setPinValue("");
    setConfirmPinValue("");
    setPinError("");
    notifications.show({
      title: t("twoFactorEnabledTitle"),
      message: t("twoFactorEnabledMsg"),
      color: "green",
    });
  };

  const handleDisable2FA = () => {
    localStorage.removeItem("twoFactorEnabled");
    localStorage.removeItem("twoFactorPinHash");
    setTwoFactorEnabled(false);
    setShow2FASetup(false);
    notifications.show({
      title: t("twoFactorDisabledTitle"),
      message: t("twoFactorDisabledMsg"),
      color: "blue",
    });
  };

  const cancel2FASetup = () => {
    setShow2FASetup(false);
    setPinValue("");
    setConfirmPinValue("");
    setPinError("");
  };

  return (
    <Stack gap="xl">
      {/* Change Password Card */}
      <Card withBorder radius="md" padding="lg" bg={getBg(colorScheme, "white", "#2c2e33")}>
        <Text fw={500} size="md" mb="lg">{t("currentPassword")}</Text>
        <Button variant="light" leftSection={<IconKey size={16} />} onClick={openPwd} fullWidth>
          {t("changePassword")}
        </Button>
      </Card>

      {/* 2FA Card */}
      <Card withBorder radius="md" padding="lg" bg={getBg(colorScheme, "white", "#2c2e33")}>
        <Group justify="space-between" mb="lg">
          <Box>
            <Text fw={500} size="md">{t("twoFactor")}</Text>
            <Text size="xs" c="dimmed">{t("twoFactorDesc")}</Text>
          </Box>
          <Switch size="md" checked={twoFactorEnabled} onChange={(e) => handleTwoFactorToggle(e.currentTarget.checked)} />
        </Group>

        <Collapse in={show2FASetup}>
          <Paper withBorder p="md" radius="md" mt="md" bg={getBg(colorScheme, "white", "#2c2e33")}>
            {setupMode === "setup" ? (
              <Stack gap="md">
                <Alert color="blue" variant="light" icon={<IconInfoCircle size={16} />}>
                  {t("setupPin")}
                </Alert>
                <SimpleGrid cols={2}>
                  <PinInput length={6} type="number" value={pinValue} onChange={setPinValue} size="md" />
                  <PinInput length={6} type="number" value={confirmPinValue} onChange={setConfirmPinValue} size="md" />
                </SimpleGrid>
                {pinError && <Text c="red" size="xs">{pinError}</Text>}
                <Group justify="flex-end">
                  <Button size="xs" variant="subtle" onClick={cancel2FASetup}>{t("cancel")}</Button>
                  <Button size="xs" onClick={handleEnable2FA}>{t("enable")}</Button>
                </Group>
              </Stack>
            ) : (
              <Stack gap="md">
                <Alert color="red" variant="light" icon={<IconAlertTriangle size={16} />}>
                  {t("disable2FA")}
                </Alert>
                <Group justify="flex-end">
                  <Button size="xs" variant="subtle" onClick={cancel2FASetup}>{t("cancel")}</Button>
                  <Button size="xs" color="red" onClick={handleDisable2FA}>{t("disable")}</Button>
                </Group>
              </Stack>
            )}
          </Paper>
        </Collapse>
      </Card>

      {/* Login History Card */}
      <Card withBorder radius="md" padding="lg" bg={getBg(colorScheme, "white", "#2c2e33")}>
        <Text fw={500} size="md" mb="lg">{t("loginHistory")}</Text>
        <Stack gap="sm">
          <Group justify="space-between">
            <Box>
              <Text size="sm" fw={500}>{t("currentSession")}</Text>
              <Text size="xs" c="dimmed">{t("sessionInfo")}</Text>
            </Box>
          </Group>
        </Stack>
      </Card>

      {/* Change Password Modal */}
      <Modal opened={pwdOpened} onClose={closePwd} title={t("changePassword")} centered size="md" radius="md">
        <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)}>
          <Stack gap="md">
            <PasswordInput
              label={t("currentPassword")}
              {...passwordForm.register("currentPassword")}
              error={passwordForm.formState.errors.currentPassword ? t("pwdSchemaCurrReq") : null}
            />
            <PasswordInput
              label={t("newPassword")}
              {...passwordForm.register("newPassword")}
              error={
                passwordForm.formState.errors.newPassword
                  ? passwordForm.formState.errors.newPassword.message === "Password must be at least 8 characters"
                    ? t("pwdSchemaMin")
                    : passwordForm.formState.errors.newPassword.message === "Must contain uppercase"
                    ? t("pwdSchemaUpper")
                    : passwordForm.formState.errors.newPassword.message === "Must contain lowercase"
                    ? t("pwdSchemaLower")
                    : passwordForm.formState.errors.newPassword.message === "Must contain number"
                    ? t("pwdSchemaNum")
                    : passwordForm.formState.errors.newPassword.message === "Must contain special character"
                    ? t("pwdSchemaSpecial")
                    : passwordForm.formState.errors.newPassword.message
                  : null
              }
            />
            {passwordForm.watch("newPassword") && (
              <Box>
                <Group justify="space-between" mb={4}>
                  <Text size="xs" c="dimmed">{t("passwordStrength")}</Text>
                  <Text size="xs" fw={600} c={getPasswordStrengthColor()}>{getPasswordStrengthLabel()}</Text>
                </Group>
                <Progress value={passwordStrength} color={getPasswordStrengthColor()} size="sm" />
              </Box>
            )}
            <PasswordInput
              label={t("confirmPassword")}
              {...passwordForm.register("confirmPassword")}
              error={passwordForm.formState.errors.confirmPassword ? t("pwdSchemaMatch") : null}
            />
            <Button type="submit" color="blue" fullWidth>{t("changePassword")}</Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}