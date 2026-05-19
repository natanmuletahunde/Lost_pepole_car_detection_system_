"use client";
import { Box, Container, Title, Text, SimpleGrid, Paper, ThemeIcon, useMantineColorScheme } from "@mantine/core";
import { IconReport, IconBrain, IconUsers, IconMapPin, IconHeartHandshake } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function HomeHowItWorks() {
  const t = useTranslations("HowItWorks");
  const { colorScheme } = useMantineColorScheme();
  const getBg = (light: string, dark: string) => (colorScheme === "dark" ? dark : light);

  const steps = [
    {
      icon: IconReport,
      title: t("step1Title"),
      description: t("step1Desc"),
      color: "blue",
    },
    {
      icon: IconBrain,
      title: t("step2Title"),
      description: t("step2Desc"),
      color: "violet",
    },
    {
      icon: IconUsers,
      title: t("step3Title"),
      description: t("step3Desc"),
      color: "grape",
    },
    {
      icon: IconMapPin,
      title: t("step4Title"),
      description: t("step4Desc"),
      color: "orange",
    },
    {
      icon: IconHeartHandshake,
      title: t("step5Title"),
      description: t("step5Desc"),
      color: "green",
    },
  ];

  return (
    <Box id="how-it-works" py={{ base: 60, md: 100 }} bg={getBg("white", "#1A1B1E")}>
      <Container size="xl">
        <Title order={2} ta="center" fw={900} mb="sm" style={{ color: "#2f80ed" }}>
          {t("title")}
        </Title>
        <Text c="dimmed" ta="center" maw={600} mx="auto" mb={50}>
          {t("subtitle")}
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }} spacing="md">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Paper p="md" radius="md" ta="center" bg={getBg("#f8f9fa", "#2C2E33")} style={{ height: "100%" }}>
                <ThemeIcon size={60} radius="xl" color={step.color} variant="light" mb="md" mx="auto">
                  <step.icon size={30} />
                </ThemeIcon>
                <Title order={4} mb="xs">{step.title}</Title>
                <Text size="sm" c="dimmed">{step.description}</Text>
              </Paper>
            </motion.div>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
