"use client";
import { Box, Container, Title, Text, SimpleGrid, Paper, ThemeIcon, useMantineColorScheme } from "@mantine/core";
import { IconFaceId, IconCar, IconMapPin, IconBellRinging, IconUsers, IconShieldCheck } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function HomeFeatures() {
  const t = useTranslations("Features");
  const { colorScheme } = useMantineColorScheme();
  const getBg = (light: string, dark: string) => (colorScheme === "dark" ? dark : light);

  const features = [
    {
      icon: IconFaceId,
      title: t("faceTitle"),
      description: t("faceDesc"),
      color: "blue",
    },
    {
      icon: IconCar,
      title: t("carTitle"),
      description: t("carDesc"),
      color: "teal",
    },
    {
      icon: IconMapPin,
      title: t("gpsTitle"),
      description: t("gpsDesc"),
      color: "green",
    },
    {
      icon: IconBellRinging,
      title: t("bellTitle"),
      description: t("bellDesc"),
      color: "orange",
    },
    {
      icon: IconUsers,
      title: t("usersTitle"),
      description: t("usersDesc"),
      color: "grape",
    },
    {
      icon: IconShieldCheck,
      title: t("shieldTitle"),
      description: t("shieldDesc"),
      color: "red",
    },
  ];

  return (
    <Box id="features" py={{ base: 60, md: 100 }} bg="transparent">
      <Container size="xl">
        <Title order={2} ta="center" fw={900} mb="sm" style={{ color: "#2f80ed" }}>
          {t("title")}
        </Title>
        <Text c="dimmed" ta="center" maw={600} mx="auto" mb={50}>
          {t("subtitle")}
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Paper p="xl" radius="md" withBorder bg={getBg("white", "#1A1B1E")} style={{ height: "100%", transition: "transform 0.2s", "&:hover": { transform: "translateY(-5px)" } }}>
                <ThemeIcon size={50} radius="md" color={feature.color} variant="light" mb="md">
                  <feature.icon size={26} />
                </ThemeIcon>
                <Title order={4} mb="sm">{feature.title}</Title>
                <Text size="sm" c="dimmed" lh={1.6}>{feature.description}</Text>
              </Paper>
            </motion.div>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
