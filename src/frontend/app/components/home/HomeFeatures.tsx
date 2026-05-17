"use client";
import { Box, Container, Title, Text, SimpleGrid, Paper, ThemeIcon, useMantineColorScheme } from "@mantine/core";
import { IconFaceId, IconCar, IconMapPin, IconBellRinging, IconUsers, IconShieldCheck } from "@tabler/icons-react";
import { motion } from "framer-motion";

export default function HomeFeatures() {
  const { colorScheme } = useMantineColorScheme();
  const getBg = (light: string, dark: string) => (colorScheme === "dark" ? dark : light);

  const features = [
    {
      icon: IconFaceId,
      title: "AI Face Detection",
      description: "Advanced facial recognition algorithms to quickly identify and match missing persons from community uploads.",
      color: "blue",
    },
    {
      icon: IconCar,
      title: "Vehicle Recognition",
      description: "Automated license plate and vehicle model detection to locate stolen or missing cars efficiently.",
      color: "teal",
    },
    {
      icon: IconMapPin,
      title: "Live GPS Tracking",
      description: "Real-time location tracking for registered smart belts, ensuring constant safety monitoring.",
      color: "green",
    },
    {
      icon: IconBellRinging,
      title: "Real-time Notifications",
      description: "Instant alerts sent to nearby community members and authorities when a new case is reported.",
      color: "orange",
    },
    {
      icon: IconUsers,
      title: "Community Sightings",
      description: "A collaborative platform where users can report sightings to help resolve active cases faster.",
      color: "grape",
    },
    {
      icon: IconShieldCheck,
      title: "Smart Emergency Alerts",
      description: "Automated verification and prioritized routing of emergency SOS signals for immediate response.",
      color: "red",
    },
  ];

  return (
    <Box id="features" py={{ base: 60, md: 100 }} bg="transparent">
      <Container size="xl">
        <Title order={2} ta="center" fw={900} mb="sm" style={{ color: "#2f80ed" }}>
          Platform Features
        </Title>
        <Text c="dimmed" ta="center" maw={600} mx="auto" mb={50}>
          Our system leverages cutting-edge technology and community engagement to provide the most effective recovery platform.
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
