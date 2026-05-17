"use client";
import { Box, Container, Title, Text, SimpleGrid, Paper, ThemeIcon, useMantineColorScheme } from "@mantine/core";
import { IconReport, IconBrain, IconUsers, IconMapPin, IconHeartHandshake } from "@tabler/icons-react";
import { motion } from "framer-motion";

export default function HomeHowItWorks() {
  const { colorScheme } = useMantineColorScheme();
  const getBg = (light: string, dark: string) => (colorScheme === "dark" ? dark : light);

  const steps = [
    {
      icon: IconReport,
      title: "1. Report Case",
      description: "Submit details and photos of the missing person or vehicle to our platform.",
      color: "blue",
    },
    {
      icon: IconBrain,
      title: "2. AI Analyzes Data",
      description: "Our AI systems process the uploaded data and begin scanning active reports and databases.",
      color: "violet",
    },
    {
      icon: IconUsers,
      title: "3. Community Sightings",
      description: "Alerts are sent to nearby users, who can report real-time sightings directly through the app.",
      color: "grape",
    },
    {
      icon: IconMapPin,
      title: "4. GPS Tracking",
      description: "Live updates and potential location matches are plotted on the interactive map for monitoring.",
      color: "orange",
    },
    {
      icon: IconHeartHandshake,
      title: "5. Recovery Process",
      description: "Once verified, authorities are notified, ensuring a safe and swift recovery process.",
      color: "green",
    },
  ];

  return (
    <Box id="how-it-works" py={{ base: 60, md: 100 }} bg={getBg("white", "#1A1B1E")}>
      <Container size="xl">
        <Title order={2} ta="center" fw={900} mb="sm" style={{ color: "#2f80ed" }}>
          How It Works
        </Title>
        <Text c="dimmed" ta="center" maw={600} mx="auto" mb={50}>
          A seamless, step-by-step process designed to bring your loved ones and valuables back home.
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
