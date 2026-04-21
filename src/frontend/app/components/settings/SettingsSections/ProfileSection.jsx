import {
  Card,
  Group,
  ThemeIcon,
  Title,
  Text,
  Grid,
  Stack,
  TextInput,
  Divider,
  Badge,
  Avatar,
  Tooltip,
  ActionIcon,
  Box,
} from "@mantine/core";
import {
  IconUser,
  IconMail,
  IconCheck,
  IconAlertTriangle,
  IconCamera,
} from "@tabler/icons-react";
import { GRADIENT_PRIMARY } from "../utils/constants";

export const ProfileSection = (props) => {
  const { formData, handleChange, errors } = props;

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
        <ThemeIcon
          size={50}
          radius="lg"
          style={{ background: GRADIENT_PRIMARY }}
        >
          <IconUser size={24} color="white" />
        </ThemeIcon>
        <div>
          <Title
            order={3}
            style={{
              background: GRADIENT_PRIMARY,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Profile Information
          </Title>
          <Text size="sm" c="dimmed">
            Update your personal details and profile picture
          </Text>
        </div>
      </Group>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Stack align="center" gap="md">
            <Box style={{ position: "relative" }}>
              <Avatar
                size={180}
                radius={180}
                src={
                  formData.avatar && typeof formData.avatar === "string"
                    ? formData.avatar
                    : formData.avatar instanceof File
                      ? URL.createObjectURL(formData.avatar)
                      : null
                }
                color="blue"
                style={{
                  border: "4px solid white",
                  boxShadow: "0 15px 30px rgba(65, 88, 208, 0.2)",
                }}
              >
                {!formData.avatar && formData.displayName ? (
                  <span style={{ fontSize: "4rem" }}>
                    {formData.displayName.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <IconUser size={80} />
                )}
              </Avatar>
              <Tooltip label="Change photo" position="bottom" withArrow={true}>
                <ActionIcon
                  component="label"
                  size="lg"
                  style={{
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                    background: GRADIENT_PRIMARY,
                    border: "3px solid white",
                    cursor: "pointer",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                  }}
                >
                  <IconCamera size={20} color="white" />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(event) =>
                      handleChange("avatar", event.target.files?.[0])
                    }
                  />
                </ActionIcon>
              </Tooltip>
            </Box>
            <Text size="sm" c="dimmed">
              Click camera icon to update
            </Text>
            <Badge color="blue" variant="light" size="lg">
              Active Account
            </Badge>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 8 }}>
          <Stack gap="md">
            <TextInput
              label={<Text fw={600}>Display name</Text>}
              placeholder="Enter your name"
              value={formData.displayName}
              onChange={(event) =>
                handleChange("displayName", event.target.value)
              }
              error={errors.displayName}
              required={true}
              leftSection={<IconUser size={16} />}
              size="md"
              radius="md"
              styles={{
                input: {
                  "&:focus": {
                    borderColor: "#4158D0",
                    boxShadow: "0 0 0 3px rgba(65, 88, 208, 0.1)",
                  },
                },
              }}
            />
            <TextInput
              label={<Text fw={600}>Email address</Text>}
              placeholder="you@example.com"
              type="email"
              value={formData.email}
              onChange={(event) => handleChange("email", event.target.value)}
              error={errors.email}
              required={true}
              leftSection={<IconMail size={16} />}
              size="md"
              radius="md"
            />
            <Divider label="Account Verification" labelPosition="center" />
            <Group>
              <Badge
                color="green"
                variant="light"
                leftSection={<IconCheck size={12} />}
              >
                Email Verified
              </Badge>
              <Badge
                color="yellow"
                variant="light"
                leftSection={<IconAlertTriangle size={12} />}
              >
                Phone Pending
              </Badge>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  );
};
