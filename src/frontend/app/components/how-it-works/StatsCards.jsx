import { SimpleGrid, Paper, ThemeIcon, Text } from "@mantine/core";
import { IconUsers, IconHeartHandshake, IconCamera, IconClock } from "@tabler/icons-react";

const PRIMARY_COLOR = "#0034D1";
const PRIMARY_GRADIENT = `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #0066ff 100%)`;

export default function StatsCards() {
  const stats = [
    { value: "500+", label: "Active Cases", icon: IconUsers },
    { value: "150+", label: "Successful Reunions", icon: IconHeartHandshake },
    { value: "24/7", label: "Camera Monitoring", icon: IconCamera },
    { value: "24 hrs", label: "System Active", icon: IconClock },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb={50}>
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Paper key={idx} p="xl" radius="md" withBorder style={{ textAlign: "center" }}>
            <ThemeIcon size={60} radius={60} mx="auto" mb="md" style={{ background: PRIMARY_GRADIENT }}>
              <Icon size={30} color="white" />
            </ThemeIcon>
            <Text fw={700} size="2rem" style={{ color: PRIMARY_COLOR }}>{stat.value}</Text>
            <Text c="dimmed">{stat.label}</Text>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}