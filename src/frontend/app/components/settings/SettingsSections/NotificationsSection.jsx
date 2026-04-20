import {
  Card,
  Group,
  ThemeIcon,
  Title,
  Text,
  SimpleGrid,
  Switch,
} from "@mantine/core";
import { IconBellRinging } from "@tabler/icons-react";
import { GRADIENT_SUCCESS } from "../utils/constants";

export const NotificationsSection = (props) => {
  const { formData, handleChange } = props;
  
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
        <ThemeIcon size={50} radius="lg" style={{ background: GRADIENT_SUCCESS }}>
          <IconBellRinging size={24} color="white" />
        </ThemeIcon>
        <div>
          <Title
            order={3}
            style={{
              background: GRADIENT_SUCCESS,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Notifications
          </Title>
          <Text size="sm" c="dimmed">
            Choose how we contact you
          </Text>
        </div>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Switch
          label="Email notifications"
          description="Receive updates via email"
          checked={formData.emailNotifications}
          onChange={(event) => handleChange("emailNotifications", event.currentTarget.checked)}
          size="lg"
          styles={{
            track: {
              backgroundColor: formData.emailNotifications ? '#4158D0' : undefined,
            },
          }}
        />
        <Switch
          label="Push notifications"
          description="Receive browser push notifications"
          checked={formData.pushNotifications}
          onChange={(event) => handleChange("pushNotifications", event.currentTarget.checked)}
          size="lg"
        />
        <Switch
          label="Marketing emails"
          description="Receive newsletters and promotions"
          checked={formData.marketingEmails}
          onChange={(event) => handleChange("marketingEmails", event.currentTarget.checked)}
          size="lg"
        />
        <Switch
          label="SMS alerts"
          description="Get text messages for urgent updates"
          checked={false}
          onChange={() => {}}
          size="lg"
        />
      </SimpleGrid>
    </Card>
  );
};