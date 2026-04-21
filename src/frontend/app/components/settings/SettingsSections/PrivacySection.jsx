import {
  Card,
  Group,
  ThemeIcon,
  Title,
  Text,
  Grid,
  Select,
  Switch,
} from "@mantine/core";
import { IconShield, IconEye } from "@tabler/icons-react";
import { GRADIENT_SECONDARY } from "../utils/constants";

export const PrivacySection = (props) => {
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
        <ThemeIcon size={50} radius="lg" style={{ background: GRADIENT_SECONDARY }}>
          <IconShield size={24} color="white" />
        </ThemeIcon>
        <div>
          <Title
            order={3}
            style={{
              background: GRADIENT_SECONDARY,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Privacy
          </Title>
          <Text size="sm" c="dimmed">
            Control your data visibility
          </Text>
        </div>
      </Group>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            label="Profile visibility"
            data={[
              { value: "public", label: "🌍 Public - Anyone can see" },
              { value: "private", label: "🔒 Private - Only you" },
              { value: "friends", label: "👥 Friends only" },
            ]}
            value={formData.profileVisibility}
            onChange={(value) => handleChange("profileVisibility", value)}
            leftSection={<IconEye size={16} />}
            size="md"
            radius="md"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Switch
            label="Show email on profile"
            description="Display your email address publicly"
            checked={formData.showEmail}
            onChange={(event) => handleChange("showEmail", event.currentTarget.checked)}
            mt="md"
          />
          <Switch
            label="Allow data collection"
            description="Help us improve by sharing anonymous usage data"
            checked={formData.allowDataCollection}
            onChange={(event) => handleChange("allowDataCollection", event.currentTarget.checked)}
            mt="md"
          />
        </Grid.Col>
      </Grid>
    </Card>
  );
};