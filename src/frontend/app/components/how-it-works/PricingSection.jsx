"use client";

import { Box, Paper, Title, Text, SimpleGrid, Card, Badge, List, Group, Button, useMantineColorScheme } from "@mantine/core";
import { IconCheck, IconBuildingBank, IconWallet, IconCreditCard } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const PRIMARY_COLOR = "#0034D1";

export default function PricingSection({ user }) {
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme();
  const t = useTranslations("HowItWorks");

  return (
    <Box py={20} mb={30}>
      <Paper bg={colorScheme === "dark" ? "#1a1b2f" : "blue.0"} p={40} radius="lg">
        <Title order={2} mb="xl" style={{ color: PRIMARY_COLOR }}>{t("pricingTitle")}</Title>
        <Text size="lg" mb="xl" maw={500}>{t("pricingSubtitle")}</Text>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={30}>
          {/* Free Plan */}
          <Card withBorder radius="lg" p="xl" bg={colorScheme === "dark" ? "#2C2E33" : "white"}>
            <Badge color="blue" size="lg" mb="md">{t("freePlanBadge")}</Badge>
            <Title order={3} mb="sm">{t("freePlanTitle")}</Title>
            <Text size="sm" c="dimmed" mb="md">{t("freePlanDesc")}</Text>
            <List spacing="xs" size="sm">
              {t.raw("freePlanFeatures").map((item, i) => (
                <List.Item key={i} icon={<IconCheck size={16} color="green" />}>{item}</List.Item>
              ))}
            </List>
            <Button fullWidth mt="xl" variant="outline" color="blue" onClick={() => router.push(user ? "/register-person" : "/signup")}>
              {user ? t("startFreeReport") : t("signUpFree")}
            </Button>
          </Card>

          {/* Premium Plan */}
          <Card withBorder radius="lg" p="xl" bg={colorScheme === "dark" ? "#2C2E33" : "white"}>
            <Badge color="green" size="lg" mb="md">{t("premiumPlanBadge")}</Badge>
            <Title order={3} mb="sm">{t("premiumPlanTitle")}</Title>
            <Text size="sm" c="dimmed" mb="md">{t("premiumPlanDesc")}</Text>
            <List spacing="xs" size="sm">
              {t.raw("premiumPlanFeatures").map((item, i) => (
                <List.Item key={i} icon={<IconCheck size={16} color="green" />}>{item}</List.Item>
              ))}
            </List>
            <Group grow mt="xl">
              <Button color="green" onClick={() => router.push("/subscribe?plan=monthly")}>{t("monthlyPrice")}</Button>
              <Button color="green" variant="outline" onClick={() => router.push("/subscribe?plan=annual")}>{t("annualPrice")}</Button>
            </Group>
          </Card>
        </SimpleGrid>

        <Group mt="md" justify="center">
          <IconBuildingBank size={16} color={PRIMARY_COLOR} />
          <IconWallet size={16} color={PRIMARY_COLOR} />
          <IconCreditCard size={16} color={PRIMARY_COLOR} />
          <Text size="sm" c="dimmed">{t("allPaymentsAccepted")}</Text>
        </Group>
      </Paper>
    </Box>
  );
}