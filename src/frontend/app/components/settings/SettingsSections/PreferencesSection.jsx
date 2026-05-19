import {
  Card,
  Group,
  ThemeIcon,
  Title,
  Text,
  Grid,
  Select,
  Radio,
} from "@mantine/core";
import {
  IconPalette,
  IconGlobe,
  IconClock,
  IconSun,
  IconMoon,
  IconDeviceLaptop,
} from "@tabler/icons-react";
import { GRADIENT_INFO, languages, timezones } from "../utils/constants";
import { useTranslations } from "next-intl";

export const PreferencesSection = (props) => {
  const { formData, handleChange } = props;
  const t = useTranslations("Settings");
  
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
        <ThemeIcon size={50} radius="lg" style={{ background: GRADIENT_INFO }}>
          <IconPalette size={24} color="white" />
        </ThemeIcon>
        <div>
          <Title
            order={3}
            style={{
              background: GRADIENT_INFO,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("systemPreferences")}
          </Title>
          <Text size="sm" c="dimmed">
            {t("preferencesSubtitle")}
          </Text>
        </div>
      </Group>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Select
            label={t("language")}
            placeholder={t("languagePlaceholder")}
            data={languages}
            value={formData.language}
            onChange={(value) => handleChange("language", value)}
            leftSection={<IconGlobe size={16} />}
            size="md"
            radius="md"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Select
            label={t("timezone")}
            placeholder={t("timezonePlaceholder")}
            data={timezones}
            value={formData.timezone}
            onChange={(value) => handleChange("timezone", value)}
            leftSection={<IconClock size={16} />}
            searchable={true}
            size="md"
            radius="md"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Radio.Group
            label={t("theme")}
            value={formData.theme}
            onChange={(value) => handleChange("theme", value)}
          >
            <Group mt="xs">
              <Radio
                value="light"
                label={t("light")}
                styles={{ radio: { borderColor: '#4158D0' } }}
              />
              <Radio
                value="dark"
                label={t("dark")}
                styles={{ radio: { borderColor: '#4158D0' } }}
              />
              <Radio
                value="system"
                label={t("system")}
                styles={{ radio: { borderColor: '#4158D0' } }}
              />
            </Group>
          </Radio.Group>
        </Grid.Col>
      </Grid>
    </Card>
  );
};