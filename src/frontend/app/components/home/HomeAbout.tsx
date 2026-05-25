"use client";
import {
  Container,
  Title,
  Text,
  Grid,
  Paper,
  Box,
  Flex,
  useMantineColorScheme,
} from "@mantine/core";
import { IconTarget, IconChartBar, IconGlobe } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

interface AboutCardProps {
  icon: React.ReactNode;
  title: string;
  longText: string;
  gradientNormal?: string;
  span?: any;
  maxWidth?: number;
  mx?: string;
}

function AboutCard({
  icon,
  title,
  longText,
  gradientNormal = "linear-gradient(to right, #2f80ed, #1e56a0)",
  span = { base: 12, md: 6 },
  maxWidth,
  mx,
}: AboutCardProps) {
  const { colorScheme } = useMantineColorScheme();
  const getBg = (light: string, dark: string) =>
    colorScheme === "dark" ? dark : light;

  return (
    <Grid.Col span={span}>
      <Paper
        shadow="md"
        p={0}
        radius="lg"
        withBorder
        h="100%"
        bg={getBg("white", "#2C2E33")}
        style={{
          overflow: "hidden",
          borderColor: getBg("#e9ecef", "#373A3C"),
          transition: "all 0.3s ease",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.05)",
          maxWidth,
          margin: mx,
        }}
      >
        {/* Card Header (Gradient) */}
        <Box
          py="md"
          px="lg"
          style={{
            borderBottom: `1px solid ${getBg("#e9ecef", "#2C2E33")}`,
            background: gradientNormal,
            transition: "all 0.5s ease",
          }}
        >
          <Flex align="center" gap="sm">
            {icon}
            <Title order={3} c="white" fw={800}>
              {title}
            </Title>
          </Flex>
        </Box>

        {/* Card Body - Shows long text directly */}
        <Box
          p="xl"
          bg={getBg("#f0f5ff", "#1C2F4A")}
          style={{
            minHeight: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
          }}
        >
          <Text
            ta="center"
            c={getBg("#2f80ed", "#90caf9")}
            size="md"
            fw={500}
            style={{ lineHeight: 1.7 }}
          >
            {longText}
          </Text>
        </Box>
      </Paper>
    </Grid.Col>
  );
}

export default function HomeAbout() {
  const t = useTranslations("About");
  const { colorScheme } = useMantineColorScheme();

  return (
    <Box id="about" py={{ base: 80, md: 100 }} bg="transparent">
      <Container size="xl">
        <Title
          order={2}
          mb={{ base: 40, md: 60 }}
          ta="center"
          style={{ color: "#2f80ed" }}
          fw={900}
        >
          {t("title")}
        </Title>
        <Grid gutter="xl">
          {/* AIM CARD */}
          <AboutCard
            span={{ base: 12, md: 6 }}
            icon={<IconTarget size={24} color="white" />}
            title={t("aimTitle")}
            longText={t("aimLong")}
            gradientNormal="linear-gradient(to right, #2f80ed, #1e56a0)"
          />

          {/* VISION CARD */}
          <AboutCard
            span={{ base: 12, md: 6 }}
            icon={<IconChartBar size={24} color="white" />}
            title={t("visionTitle")}
            longText={t("visionLong")}
            gradientNormal="linear-gradient(to right, #2f80ed, #1e56a0)"
          />

          {/* STRATEGY CARD */}
          <AboutCard
            span={12}
            maxWidth={800}
            mx="auto"
            icon={<IconGlobe size={24} color="white" />}
            title={t("strategyTitle")}
            longText={t("strategyLong")}
            gradientNormal="linear-gradient(to right, #2f80ed, #1e56a0)"
          />
        </Grid>
      </Container>
    </Box>
  );
}
