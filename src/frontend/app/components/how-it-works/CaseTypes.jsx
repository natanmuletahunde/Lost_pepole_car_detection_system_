import { Title, Text, SimpleGrid, Card, ThemeIcon, List } from "@mantine/core";
import { IconCheck, IconUserPlus, IconCar, IconAlertTriangle, IconStethoscope, IconScale, IconShieldCheck, IconFileDescription } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

const PRIMARY_COLOR = "#0034D1";
const PRIMARY_GRADIENT = `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #0066ff 100%)`;

export default function CaseTypes() {
  const t = useTranslations("HowItWorks");

  const caseTypes = [
    {
      title: t("missingPerson"),
      icon: IconUserPlus,
      description: t("missingPersonDesc"),
      features: t.raw("missingPersonFeatures"),
    },
    {
      title: t("missingVehicle"),
      icon: IconCar,
      description: t("missingVehicleDesc"),
      features: t.raw("missingVehicleFeatures"),
    },
    {
      title: t("specialCases"),
      icon: IconAlertTriangle,
      description: t("specialCasesDesc"),
      features: t.raw("specialCasesFeatures"),
      featureIcons: [IconStethoscope, IconScale, IconShieldCheck, IconFileDescription],
    },
  ];

  return (
    <>
      <Title order={2} fw={800} ta="center" mb={10}>{t("reportTitle")}</Title>
      <Text c="dimmed" ta="center" mb={50} maw={600} mx="auto">{t("reportSubtitle")}</Text>
      
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing={30} mb={50}>
        {caseTypes.map((type, idx) => {
          const Icon = type.icon;
          return (
            <Card key={idx} withBorder radius="lg" p="xl">
              <ThemeIcon size={60} radius={60} mx="auto" mb="md" style={{ background: PRIMARY_GRADIENT }}>
                <Icon size={30} color="white" />
              </ThemeIcon>
              <Title order={3} ta="center" mb="sm">{type.title}</Title>
              <Text c="dimmed" ta="center" size="sm" mb="md">{type.description}</Text>
              <List spacing="xs" size="sm" center>
                {type.features.map((feature, i) => (
                  <List.Item key={i} icon={<IconCheck size={16} color={PRIMARY_COLOR} />}>{feature}</List.Item>
                ))}
              </List>
            </Card>
          );
        })}
      </SimpleGrid>
    </>
  );
}