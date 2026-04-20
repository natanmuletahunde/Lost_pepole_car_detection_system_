import { Box, Badge, Title, Text } from "@mantine/core";

export default function HowItWorksPageHeader() {
  return (
    <Box mb={40}>
      <Badge size="lg" color="blue" variant="light" mb="md">GUIDE</Badge>
      <Title order={1} fw={900} size={48} style={{ color: "#0034D1" }}>How Flega Works</Title>
      <Text c="dimmed" size="lg" mt={10} maw={600}>A simple 4-step process to report and recover missing persons and vehicles</Text>
    </Box>
  );
}