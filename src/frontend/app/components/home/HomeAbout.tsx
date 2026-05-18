"use client";
import { useState } from "react";
import { Container, Title, Text, Grid, Paper, Box, Flex, useMantineColorScheme } from "@mantine/core";
import { IconTarget, IconChartBar, IconGlobe } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface AboutCardProps {
  icon: React.ReactNode;
  title: string;
  shortText: string;
  longText: string;
  gradientNormal?: string;
  gradientHover?: string;
  span?: any;
  maxWidth?: number;
  mx?: string;
}

function AboutCard({
  icon,
  title,
  shortText,
  longText,
  gradientNormal = "linear-gradient(to right, #2f80ed, #1e56a0)",
  gradientHover = "linear-gradient(to right, #00c6ff, #0072ff)",
  span = { base: 12, md: 6 },
  maxWidth,
  mx,
}: AboutCardProps) {
  const [hovered, setHovered] = useState(false);
  const { colorScheme } = useMantineColorScheme();
  const getBg = (light: string, dark: string) => (colorScheme === "dark" ? dark : light);

  return (
    <Grid.Col span={span}>
      <motion.div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={{
          scale: hovered ? 1.05 : 1,
          y: hovered ? -8 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ height: "100%", maxWidth, margin: mx }}
      >
        <Paper
          shadow={hovered ? "xl" : "md"}
          p={0}
          radius="lg"
          withBorder
          h="100%"
          bg={getBg("white", "#2C2E33")}
          style={{
            overflow: "hidden",
            borderColor: hovered ? "#2f80ed" : getBg("#e9ecef", "#373A3C"),
            transition: "all 0.3s ease",
            boxShadow: hovered 
              ? "0 20px 40px rgba(47, 128, 237, 0.15)" 
              : "0 8px 16px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Card Header (Gradient changes color on hover) */}
          <Box
            py="md"
            px="lg"
            style={{
              borderBottom: `1px solid ${getBg("#e9ecef", "#2C2E33")}`,
              background: hovered ? gradientHover : gradientNormal,
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

          {/* Card Body (becomes soft blue-grey on Hover, Light Blue by default) */}
          <Box
            p="xl"
            bg={hovered ? getBg("#f4f6f9", "#25262b") : getBg("#f0f5ff", "#1C2F4A")}
            style={{
              minHeight: 185,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={hovered ? "long" : "short"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                style={{ width: "100%" }}
              >
                <Text
                  ta="center"
                  c={hovered ? getBg("#2C2E33", "#FFFFFF") : getBg("#2f80ed", "#90caf9")}
                  size="md"
                  fw={hovered ? 500 : 600}
                  style={{ lineHeight: 1.7 }}
                >
                  {hovered ? longText : shortText}
                </Text>
              </motion.div>
            </AnimatePresence>
          </Box>
        </Paper>
      </motion.div>
    </Grid.Col>
  );
}

export default function HomeAbout() {
  const t = useTranslations("About");
  const { colorScheme } = useMantineColorScheme();
  const getBg = (light: string, dark: string) => (colorScheme === "dark" ? dark : light);

  return (
    <Box id="about" py={{ base: 80, md: 100 }} bg="transparent">
      <Container size="xl">
        <Title order={2} mb={{ base: 40, md: 60 }} ta="center" style={{ color: "#2f80ed" }} fw={900}>
          {t("title")}
        </Title>
        <Grid gutter="xl">
          {/* AIM CARD */}
          <AboutCard
            span={{ base: 12, md: 6 }}
            icon={<IconTarget size={24} color="white" />}
            title={t("aimTitle")}
            shortText={t("aimShort")}
            longText={t("aimLong")}
            gradientNormal="linear-gradient(to right, #2f80ed, #1e56a0)"
            gradientHover="linear-gradient(to right, #ff4e50, #f9d423)"
          />

          {/* VISION CARD */}
          <AboutCard
            span={{ base: 12, md: 6 }}
            icon={<IconChartBar size={24} color="white" />}
            title={t("visionTitle")}
            shortText={t("visionShort")}
            longText={t("visionLong")}
            gradientNormal="linear-gradient(to right, #2f80ed, #1e56a0)"
            gradientHover="linear-gradient(to right, #00c6ff, #0072ff)"
          />

          {/* STRATEGY CARD */}
          <AboutCard
            span={12}
            maxWidth={800}
            mx="auto"
            icon={<IconGlobe size={24} color="white" />}
            title={t("strategyTitle")}
            shortText={t("strategyShort")}
            longText={t("strategyLong")}
            gradientNormal="linear-gradient(to right, #2f80ed, #1e56a0)"
            gradientHover="linear-gradient(to right, #11998e, #38ef7d)"
          />
        </Grid>
      </Container>
    </Box>
  );
}
