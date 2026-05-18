import { Box, Title, Text, SimpleGrid, Paper, Group, Avatar } from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export default function Testimonials() {
  const t = useTranslations("HowItWorks");

  const avatarColors = ["blue", "green", "orange"];
  const testimonialsList = t.raw("testimonialsList");

  return (
    <Box py={40}>
      <Title order={2} fw={800} mb={5} ta="center" style={{ color: "#0034D1" }}>{t("testimonialTitle")}</Title>
      <Text size="sm" c="dimmed" mb={40} maw={600} mx="auto" ta="center">{t("testimonialSubtitle")}</Text>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {testimonialsList.map((testimonial, index) => (
          <Paper key={index} p="xl" radius="md" withBorder shadow="sm">
            <Group gap={2} mb="xs">
              {[...Array(5)].map((_, i) => <IconStarFilled key={i} size={16} color="#FAB005" />)}
            </Group>
            <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>"{testimonial.content}"</Text>
            <Group gap="sm">
              <Avatar size="md" color={avatarColors[index % 3]} radius="xl">
                {testimonial.name.split(" ").map(n => n[0]).join("")}
              </Avatar>
              <Box>
                <Text size="sm" fw={700}>{testimonial.name}</Text>
                <Text size="xs" c="dimmed">{testimonial.role}</Text>
                <Text size="xs" c="dimmed">{testimonial.date}</Text>
              </Box>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
    </Box>
  );
}