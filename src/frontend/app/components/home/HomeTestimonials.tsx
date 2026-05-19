"use client";
import { Box, Container, Title, Text, Paper, Group, Avatar, useMantineColorScheme } from "@mantine/core";
import { IconStarFilled, IconQuote } from "@tabler/icons-react";
import { Carousel } from "@mantine/carousel";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const CustomCarousel = Carousel as any;

export default function HomeTestimonials() {
  const t = useTranslations("Testimonials");
  const { colorScheme } = useMantineColorScheme();
  const getBg = (light: string, dark: string) => (colorScheme === "dark" ? dark : light);

  const testimonials = [
    {
      id: 1,
      name: "Sara Johnson",
      role: t("role1"),
      avatarColor: "blue",
      quote: t("quote1"),
      rating: 5,
      date: t("date1"),
    },
    {
      id: 2,
      name: "Kebede M.",
      role: t("role2"),
      avatarColor: "green",
      quote: t("quote2"),
      rating: 5,
      date: t("date2"),
    },
    {
      id: 3,
      name: "Michael Chen",
      role: t("role3"),
      avatarColor: "orange",
      quote: t("quote3"),
      rating: 5,
      date: t("date3"),
    },
    {
      id: 4,
      name: "Amina Hassan",
      role: t("role4"),
      avatarColor: "pink",
      quote: t("quote4"),
      rating: 5,
      date: t("date4"),
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
            {t("title")}
          </Title>
          <Text size="sm" c="dimmed" mb={40} maw={600} mx="auto" ta="center">
            {t("subtitle")}
          </Text>
        </motion.div>

        <CustomCarousel slideSize={{ base: "100%", sm: "50%", md: "33.333%" }} slideGap="lg" align="start" loop withIndicators speed={300}>
          {testimonials.map((review) => (
            <CustomCarousel.Slide key={review.id}>
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
            </CustomCarousel.Slide>
          ))}
        </CustomCarousel>
      </Container>
    </Box>
  );
}
