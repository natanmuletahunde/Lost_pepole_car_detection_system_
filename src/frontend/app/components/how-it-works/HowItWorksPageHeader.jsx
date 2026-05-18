import { Box, Badge, Title, Text } from "@mantine/core";
import { useTranslations } from "next-intl";

export default function HowItWorksPageHeader() {
  const t = useTranslations("HowItWorks");
  return (
    <Box mb={40}>
      <Badge size="lg" color="blue" variant="light" mb="md">{t("badge")}</Badge>
      <Title order={1} fw={900} size={48} style={{ color: "#0034D1" }}>{t("title")}</Title>
      <Text c="dimmed" size="lg" mt={10} maw={600}>{t("subtitle")}</Text>
    </Box>
  );
}