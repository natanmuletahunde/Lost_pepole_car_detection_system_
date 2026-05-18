import { Box, Paper, Title, Text, Group, Button } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const PRIMARY_GRADIENT = `linear-gradient(135deg, #0034D1 0%, #0066ff 100%)`;

export default function CTASection({ user }) {
  const router = useRouter();
  const t = useTranslations("HowItWorks");

  return (
    <Box py={40}>
      <Paper p={50} radius="lg" style={{ background: PRIMARY_GRADIENT, textAlign: "center" }}>
        <Title order={2} c="white" mb="md">{t("ctaTitle")}</Title>
        <Text c="white" opacity={0.9} mb="xl" maw={500} mx="auto">{t("ctaSubtitle")}</Text>
        
        <Group justify="center">
          <Button size="xl" color="white" radius="xl" onClick={() => router.push(user ? "/register-person" : "/signup")}>
            {user ? t("reportCase") : t("signUpFree")}
          </Button>
          <Button size="xl" color="white" radius="xl" onClick={() => router.push(user ? "/report-sighting" : "/signup")} variant="outline">
            {user ? t("reportSighting") : t("signUpFirst")}
          </Button>
          <Button size="xl" variant="outline" color="white" radius="xl" onClick={() => router.push("/alert")}>
            {t("viewActiveAlerts")}
          </Button>
        </Group>
        
        <Text size="sm" c="white" opacity={0.8} mt="xl">
          <IconLock size={14} style={{ display: "inline", marginRight: 5 }} />
          {t("ctaFooter")}
        </Text>
      </Paper>
    </Box>
  );
}