import { Title, Text, Grid, Card, ThemeIcon } from "@mantine/core";

const PRIMARY_GRADIENT = `linear-gradient(135deg, #0034D1 0%, #0066ff 100%)`;

const steps = [
  { number: "1", title: "Create Account", description: "Register for free. First registration is always free! No hidden fees." },
  { number: "2", title: "Report Case", description: "Choose between Person, Vehicle, or Special Case. Upload photos and details." },
  { number: "3", title: "Camera Detection", description: "Our 24/7 camera system scans for matches. When detected, you get instant alerts." },
  { number: "4", title: "Get Alerted", description: "Receive notifications via email, SMS, or Telegram. Case resolved!" },
];

export default function StepGuide() {
  return (
    <>
      <Title order={2} fw={800} ta="center" mb={10}>Simple 4-Step Process</Title>
      <Text c="dimmed" ta="center" mb={50} maw={600} mx="auto">Four simple steps to find what you've lost or report what you've found</Text>
      
      <Grid gutter={30} mb={50}>
        {steps.map((step) => (
          <Grid.Col key={step.number} span={{ base: 12, md: 3 }}>
            <Card withBorder radius="lg" p="xl" style={{ height: "100%" }}>
              <ThemeIcon size={50} radius={50} mb="md" style={{ background: PRIMARY_GRADIENT }}>
                <Text fw={900} size="xl">{step.number}</Text>
              </ThemeIcon>
              <Title order={4} mb="sm">{step.title}</Title>
              <Text c="dimmed" size="sm">{step.description}</Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </>
  );
}