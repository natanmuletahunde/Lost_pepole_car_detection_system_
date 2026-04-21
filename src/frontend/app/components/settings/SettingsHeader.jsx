import { Box, Container, Group, Title, Text, Badge, ActionIcon } from "@mantine/core";
import { IconArrowLeft, IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { GRADIENT_PRIMARY } from "./utils/constants";

export const SettingsHeader = (props) => {
  const { hasUnsavedChanges } = props;
  
  return (
    <Box
      style={{
        background: GRADIENT_PRIMARY,
        padding: "3rem 0",
        marginBottom: "2rem",
        boxShadow: "0 15px 35px rgba(65, 88, 208, 0.3)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background elements */}
      <Box
        style={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          animation: "pulse 3s infinite",
        }}
      />
      <Box
        style={{
          position: "absolute",
          bottom: -80,
          left: -30,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          animation: "pulse 4s infinite",
        }}
      />

      <Container size="xl">
        <Group justify="space-between" align="center">
          <Group gap="md">
            <ActionIcon
              size="lg"
              variant="filled"
              radius="xl"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}
              onClick={() => window.history.back()}
            >
              <IconArrowLeft size={20} color="white" />
            </ActionIcon>
            <div>
              <Title order={1} c="white" style={{ fontSize: "2.5rem", textShadow: "2px 2px 4px rgba(0,0,0,0.2)" }}>
                Profile Settings
              </Title>
              <Text c="white" size="lg" opacity={0.9}>
                Customize your account experience
              </Text>
            </div>
          </Group>
          <Badge
            size="xl"
            variant="filled"
            style={{
              background: hasUnsavedChanges ? "rgba(255, 255, 255, 0.2)" : "rgba(74, 222, 128, 0.3)",
              backdropFilter: "blur(10px)",
              padding: "12px 24px",
              borderRadius: "30px",
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            {hasUnsavedChanges ? (
              <Group gap="xs">
                <IconAlertTriangle size={18} />
                <span>Unsaved Changes</span>
              </Group>
            ) : (
              <Group gap="xs">
                <IconCircleCheck size={18} />
                <span>All Saved</span>
              </Group>
            )}
          </Badge>
        </Group>

        {/* Quick stats */}
        <Group gap="xl" mt="xl">
          <Box>
            <Text size="sm" c="white" opacity={0.8}>Member since</Text>
            <Text fw={700} c="white">March 2024</Text>
          </Box>
          <Box>
            <Text size="sm" c="white" opacity={0.8}>Reports filed</Text>
            <Text fw={700} c="white">12 cases</Text>
          </Box>
          <Box>
            <Text size="sm" c="white" opacity={0.8}>Found items</Text>
            <Text fw={700} c="white">8 items</Text>
          </Box>
        </Group>
      </Container>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.4; }
          100% { transform: scale(1); opacity: 0.3; }
        }
      `}</style>
    </Box>
  );
};