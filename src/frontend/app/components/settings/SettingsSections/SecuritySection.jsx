import {
  Card,
  Group,
  ThemeIcon,
  Title,
  Text,
  Grid,
  PasswordInput,
  Alert,
  Box,
  Progress,
  Button,
  Divider,
  Modal,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconShieldLock, IconInfoCircle, IconKey, IconAlertTriangle, IconTrash } from "@tabler/icons-react";
import { GRADIENT_WARNING } from "../utils/constants";
import { usePasswordStrength } from "../hooks/usePasswordStrength";
import { useState } from "react";
import { useTranslations } from "next-intl";

export const SecuritySection = (props) => {
  const { formData, handleChange, errors, handleDeleteAccount, router } = props;
  const t = useTranslations("Settings");
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [visibleCurrent, { toggle: toggleCurrent }] = useDisclosure(false);
  const [visibleNew, { toggle: toggleNew }] = useDisclosure(false);
  const [visibleConfirm, { toggle: toggleConfirm }] = useDisclosure(false);
  const passwordStrength = usePasswordStrength(formData.newPassword);
  const strength = passwordStrength.strength;
  const getColor = passwordStrength.getColor;
  const getLabel = passwordStrength.getLabel;

  return (
    <Card
      withBorder={true}
      radius="lg"
      p="xl"
      style={{
        border: "1px solid rgba(65, 88, 208, 0.1)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
      }}
    >
      <Group gap="sm" mb="lg">
        <ThemeIcon size={50} radius="lg" style={{ background: GRADIENT_WARNING }}>
          <IconShieldLock size={24} color="white" />
        </ThemeIcon>
        <div>
          <Title
            order={3}
            style={{
              background: GRADIENT_WARNING,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("securityCredentials")}
          </Title>
          <Text size="sm" c="dimmed">
            {t("securitySubtitle")}
          </Text>
        </div>
      </Group>

      <Alert
        icon={<IconInfoCircle size={16} />}
        title={t("securityTipTitle")}
        color="blue"
        radius="md"
        mb="lg"
        variant="light"
      >
        {t("securityTip")}
      </Alert>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <PasswordInput
            label={t("currentPassword")}
            placeholder={t("currentPasswordPlaceholder")}
            value={formData.currentPassword}
            onChange={(event) => handleChange("currentPassword", event.target.value)}
            error={errors.currentPassword}
            visible={visibleCurrent}
            onVisibilityChange={toggleCurrent}
            leftSection={<IconKey size={16} />}
            size="md"
            radius="md"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <PasswordInput
            label={t("newPassword")}
            placeholder={t("newPasswordPlaceholder")}
            value={formData.newPassword}
            onChange={(event) => handleChange("newPassword", event.target.value)}
            error={errors.newPassword}
            visible={visibleNew}
            onVisibilityChange={toggleNew}
            size="md"
            radius="md"
          />
          {formData.newPassword && (
            <Box mt="xs">
              <Group justify="space-between" mb={5}>
                <Text size="xs" c="dimmed">
                  {t("passwordStrength")}
                </Text>
                <Text size="xs" fw={600} c={getColor()}>
                  {getLabel()}
                </Text>
              </Group>
              <Progress
                value={strength}
                color={getColor()}
                size="sm"
                radius="xl"
                striped={true}
                animated={true}
              />
            </Box>
          )}
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <PasswordInput
            label={t("confirmPassword")}
            placeholder={t("confirmPasswordPlaceholder")}
            value={formData.confirmPassword}
            onChange={(event) => handleChange("confirmPassword", event.target.value)}
            error={errors.confirmPassword}
            visible={visibleConfirm}
            onVisibilityChange={toggleConfirm}
            size="md"
            radius="md"
          />
        </Grid.Col>
      </Grid>

      {/* Danger Zone */}
      <Divider my="xl" label={<Text fw={600} size="sm" c="red">{t("dangerZone")}</Text>} labelPosition="center" />
      
      <Group justify="space-between" align="center" p="md" style={{ border: "1px solid rgba(250, 82, 82, 0.2)", borderRadius: "12px", background: "rgba(250, 82, 82, 0.03)" }}>
        <Box>
          <Text fw={700} c="red" mb={4}>{t("deleteAccount")}</Text>
          <Text size="sm" c="dimmed">{t("deleteAccountDesc")}</Text>
        </Box>
        <Button 
          color="red" 
          variant="light" 
          leftSection={<IconTrash size={16} />}
          onClick={openDeleteModal}
        >
          {t("deleteAccount")}
        </Button>
      </Group>

      {/* Delete Confirmation Modal */}
      <Modal 
        opened={deleteModalOpened} 
        onClose={closeDeleteModal} 
        title={<Group gap="xs"><IconAlertTriangle color="red" /><Text fw={700} c="red">{t("deleteConfirmTitle")}</Text></Group>}
        centered
        overlayProps={{ blur: 3 }}
      >
        <Text size="sm" mb="xl">
          {t("deleteConfirmMsg")}
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={closeDeleteModal} disabled={isDeleting}>{t("cancel")}</Button>
          <Button 
            color="red" 
            loading={isDeleting}
            onClick={async () => {
              setIsDeleting(true);
              const success = await handleDeleteAccount();
              setIsDeleting(false);
              if (success) {
                closeDeleteModal();
                router.push("/authentication/login");
              }
            }}
          >
            {t("deleteConfirmButton")}
          </Button>
        </Group>
      </Modal>

    </Card>
  );
};