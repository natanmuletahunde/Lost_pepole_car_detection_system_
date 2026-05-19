import { Title, Text, Grid, Card, ThemeIcon } from "@mantine/core";
import { useTranslations } from "next-intl";

const PRIMARY_GRADIENT = `linear-gradient(135deg, #0034D1 0%, #0066ff 100%)`;

export default function StepGuide() {
  const t = useTranslations("HowItWorks");

  const steps = [
    { number: "1", title: t("step1Title"), description: t("step1Desc") },
    { number: "2", title: t("step2Title"), description: t("step2Desc") },
    { number: "3", title: t("step3Title"), description: t("step3Desc") },
    { number: "4", title: t("step4Title"), description: t("step4Desc") },
  ];

  return (
    <>
      <Title order={2} fw={800} ta="center" mb={10}>{t("processTitle")}</Title>
      <Text c="dimmed" ta="center" mb={50} maw={600} mx="auto">{t("processSubtitle")}</Text>
      
      <Grid gutter={30} mb={50}>
        {steps.map((step) => (
          <Grid.Col key={step.number} span={{ base: 12, md: 3 }}>
            <Card withBorder radius="lg" p="xl" style={{ height: "100%" }}>
              <ThemeIcon size={50} radius={50} mb="md" style={{ background: PRIMARY_GRADIENT }}>
                <Text fw={900} size="xl">{step.number}</Text>
              </ThemeIcon>
              <Title order={4} mb="sm">{step.title}</Title>
              <Text c="dimmed" size="sm">{step.description}</Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </>
  );
}