"use client";
import { Box, Container, Title, Text, Paper, Group, Avatar, useMantineColorScheme } from "@mantine/core";
import { IconStarFilled, IconQuote } from "@tabler/icons-react";
import { Carousel } from "@mantine/carousel";
import { motion } from "framer-motion";

export default function HomeTestimonials() {
  const { colorScheme } = useMantineColorScheme();
  const getBg = (light: string, dark: string) => (colorScheme === "dark" ? dark : light);

  const testimonials = [
    {
      id: 1,
      name: "Sara Johnson",
      role: "Found Car in 24 Hours",
      avatarColor: "blue",
      quote: "I found my car within 24 hours of posting here. The AI detection is incredible!",
      rating: 5,
      date: "2 weeks ago",
    },
    {
      id: 2,
      name: "Kebede M.",
      role: "Found Missing Brother",
      avatarColor: "green",
      quote: "The alert system is so fast. Thank you for helping me find my brother.",
      rating: 5,
      date: "1 month ago",
    },
    {
      id: 3,
      name: "Michael Chen",
      role: "Recovered Family Heirloom",
      avatarColor: "orange",
      quote: "I thought I lost my grandmother's necklace forever. Community found it in 48 hours.",
      rating: 5,
      date: "3 weeks ago",
    },
    {
      id: 4,
      name: "Amina Hassan",
      role: "Found Stolen Phone",
      avatarColor: "pink",
      quote: "My phone was stolen. Using location tracking, police recovered it same day.",
      rating: 5,
      date: "1 week ago",
    },
  ];

  return (
    <Box py={{ base: 60, md: 100 }} bg="transparent">
      <Container size="xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Title order={2} fw={800} mb={5} ta="center" style={{ color: "#2f80ed" }}>
            Real Stories, Real Results
          </Title>
          <Text size="sm" c="dimmed" mb={40} maw={600} mx="auto" ta="center">
            Hear from families and individuals who have successfully recovered
            their loved ones and vehicles through our advanced detection system
          </Text>
        </motion.div>

        <Carousel slideSize={{ base: "100%", sm: "50%", md: "33.333%" }} slideGap="lg" align="start" loop withIndicators speed={300}>
          {testimonials.map((review) => (
            <Carousel.Slide key={review.id}>
              <Paper p={{ base: "lg", md: "xl" }} radius="lg" withBorder shadow="sm" h="100%" bg={getBg("white", "#2C2E33")}>
                <Box mb="md">
                  <Group gap={2} mb="xs">
                    {[...Array(review.rating)].map((_, i) => (
                      <IconStarFilled key={i} size={16} color="#FAB005" />
                    ))}
                  </Group>
                  <IconQuote size={24} color="var(--mantine-color-blue-3)" style={{ opacity: 0.3, margin: "10px 0" }} />
                  <Text size="sm" mb="md" style={{ lineHeight: 1.6, fontStyle: "italic" }}>
                    "{review.quote}"
                  </Text>
                </Box>
                <Group gap="sm" align="center">
                  <Avatar size="md" color={review.avatarColor} radius="xl" variant="filled">
                    {review.name.split(" ").map((n) => n[0]).join("")}
                  </Avatar>
                  <Box style={{ flex: 1 }}>
                    <Text size="sm" fw={700}>{review.name}</Text>
                    <Text size="xs" c="dimmed">{review.role}</Text>
                    <Text size="xs" c="dimmed">{review.date}</Text>
                  </Box>
                </Group>
              </Paper>
            </Carousel.Slide>
          ))}
        </Carousel>
      </Container>
    </Box>
  );
}
