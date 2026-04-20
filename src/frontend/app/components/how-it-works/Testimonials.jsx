import { Box, Title, Text, SimpleGrid, Paper, Group, Avatar } from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";  // Only import once

const testimonials = [
  { name: "Sara Johnson", role: "Found Car in 24 Hours", avatarColor: "blue", content: "I found my car within 24 hours of posting here. The AI detection is incredible!", rating: 5, date: "2 weeks ago" },
  { name: "Kebede M.", role: "Found Missing Brother", avatarColor: "green", content: "The alert system is so fast. Thank you for helping me find my brother.", rating: 5, date: "1 month ago" },
  { name: "Tigist Haile", role: "Vehicle Owner", avatarColor: "orange", content: "My car was stolen and within 3 days, Flega's system spotted it. The police were notified and I got my car back.", rating: 5, date: "3 weeks ago" },
];

export default function Testimonials() {
  return (
    <Box py={40}>
      <Title order={2} fw={800} mb={5} ta="center" style={{ color: "#0034D1" }}>Real Stories, Real Results</Title>
      <Text size="sm" c="dimmed" mb={40} maw={600} mx="auto" ta="center">Hear from families and individuals who have successfully recovered their loved ones and vehicles</Text>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {testimonials.map((testimonial, index) => (
          <Paper key={index} p="xl" radius="md" withBorder shadow="sm">
            <Group gap={2} mb="xs">
              {[...Array(testimonial.rating)].map((_, i) => <IconStarFilled key={i} size={16} color="#FAB005" />)}
            </Group>
            <Text size="sm" mb="md" style={{ lineHeight: 1.6 }}>"{testimonial.content}"</Text>
            <Group gap="sm">
              <Avatar size="md" color={testimonial.avatarColor} radius="xl">
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