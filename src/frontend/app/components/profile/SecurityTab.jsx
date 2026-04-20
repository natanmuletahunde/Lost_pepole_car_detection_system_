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

const getBg = (colorScheme, light, dark) => (colorScheme === "dark" ? dark : light);

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
    notifications.show({
      title: "Password Updated",
      message: "Your password has been changed successfully",
      color: "green",
      icon: <IconCheck size={18} />,
    });
    closePwd();
    passwordForm.reset();
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return "red";
    if (passwordStrength < 60) return "orange";
    if (passwordStrength < 80) return "yellow";
    return "green";
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 30) return "Weak";
    if (passwordStrength < 60) return "Fair";
    if (passwordStrength < 80) return "Good";
    return "Strong";
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
      setPinError("PIN must be 6 digits");
      return;
    }
    if (pinValue !== confirmPinValue) {
      setPinError("PINs do not match");
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
      title: "2FA Enabled",
      message: "Two-factor authentication has been enabled.",
      color: "green",
    });
  };

  const handleDisable2FA = () => {
    localStorage.removeItem("twoFactorEnabled");
    localStorage.removeItem("twoFactorPinHash");
    setTwoFactorEnabled(false);
    setShow2FASetup(false);
    notifications.show({
      title: "2FA Disabled",
      message: "Two-factor authentication has been disabled.",
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
        <Text fw={500} size="md" mb="lg">Password</Text>
        <Button variant="light" leftSection={<IconKey size={16} />} onClick={openPwd} fullWidth>
          Change password
        </Button>
      </Card>

      {/* 2FA Card */}
      <Card withBorder radius="md" padding="lg" bg={getBg(colorScheme, "white", "#2c2e33")}>
        <Group justify="space-between" mb="lg">
          <Box>
            <Text fw={500} size="md">Two-factor authentication</Text>
            <Text size="xs" c="dimmed">Add an extra layer of security</Text>
          </Box>
          <Switch size="md" checked={twoFactorEnabled} onChange={(e) => handleTwoFactorToggle(e.currentTarget.checked)} />
        </Group>

        <Collapse in={show2FASetup}>
          <Paper withBorder p="md" radius="md" mt="md" bg={getBg(colorScheme, "white", "#2c2e33")}>
            {setupMode === "setup" ? (
              <Stack gap="md">
                <Alert color="blue" variant="light" icon={<IconInfoCircle size={16} />}>
                  Set up a 6-digit PIN
                </Alert>
                <SimpleGrid cols={2}>
                  <PinInput length={6} type="number" value={pinValue} onChange={setPinValue} size="md" />
                  <PinInput length={6} type="number" value={confirmPinValue} onChange={setConfirmPinValue} size="md" />
                </SimpleGrid>
                {pinError && <Text c="red" size="xs">{pinError}</Text>}
                <Group justify="flex-end">
                  <Button size="xs" variant="subtle" onClick={cancel2FASetup}>Cancel</Button>
                  <Button size="xs" onClick={handleEnable2FA}>Enable</Button>
                </Group>
              </Stack>
            ) : (
              <Stack gap="md">
                <Alert color="red" variant="light" icon={<IconAlertTriangle size={16} />}>
                  Disable two-factor authentication?
                </Alert>
                <Group justify="flex-end">
                  <Button size="xs" variant="subtle" onClick={cancel2FASetup}>Cancel</Button>
                  <Button size="xs" color="red" onClick={handleDisable2FA}>Disable</Button>
                </Group>
              </Stack>
            )}
          </Paper>
        </Collapse>
      </Card>

      {/* Login History Card */}
      <Card withBorder radius="md" padding="lg" bg={getBg(colorScheme, "white", "#2c2e33")}>
        <Text fw={500} size="md" mb="lg">Login history</Text>
        <Stack gap="sm">
          <Group justify="space-between">
            <Box>
              <Text size="sm" fw={500}>Current session</Text>
              <Text size="xs" c="dimmed">Addis Ababa, Ethiopia · Chrome on Windows</Text>
            </Box>
          </Group>
        </Stack>
      </Card>

      {/* Change Password Modal */}
      <Modal opened={pwdOpened} onClose={closePwd} title="Change password" centered size="md" radius="md">
        <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)}>
          <Stack gap="md">
            <PasswordInput
              label="Current password"
              {...passwordForm.register("currentPassword")}
              error={passwordForm.formState.errors.currentPassword?.message}
            />
            <PasswordInput
              label="New password"
              {...passwordForm.register("newPassword")}
              error={passwordForm.formState.errors.newPassword?.message}
            />
            {passwordForm.watch("newPassword") && (
              <Box>
                <Group justify="space-between" mb={4}>
                  <Text size="xs" c="dimmed">Password strength</Text>
                  <Text size="xs" fw={600} c={getPasswordStrengthColor()}>{getPasswordStrengthLabel()}</Text>
                </Group>
                <Progress value={passwordStrength} color={getPasswordStrengthColor()} size="sm" />
              </Box>
            )}
            <PasswordInput
              label="Confirm new password"
              {...passwordForm.register("confirmPassword")}
              error={passwordForm.formState.errors.confirmPassword?.message}
            />
            <Button type="submit" color="blue" fullWidth>Update password</Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}