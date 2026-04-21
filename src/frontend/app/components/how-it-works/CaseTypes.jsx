import { Title, Text, SimpleGrid, Card, ThemeIcon, List } from "@mantine/core";
import { IconCheck, IconUserPlus, IconCar, IconAlertTriangle, IconStethoscope, IconScale, IconShieldCheck, IconFileDescription } from "@tabler/icons-react";

const PRIMARY_COLOR = "#0034D1";
const PRIMARY_GRADIENT = `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #0066ff 100%)`;

const caseTypes = [
  {
    title: "Missing Person",
    icon: IconUserPlus,
    description: "Report a missing family member or individual. Include photos, description, and last seen location.",
    features: ["Full name and age", "Physical description", "Last known location", "Recent photos"],
  },
  {
    title: "Missing Vehicle",
    icon: IconCar,
    description: "Report stolen or missing vehicles. Include license plate, model, and identifying features.",
    features: ["Brand and model", "License plate number", "Color and features", "Vehicle images"],
  },
  {
    title: "Special Cases",
    icon: IconAlertTriangle,
    description: "Report mentally ill persons or criminal background cases. Requires official documentation.",
    features: ["Doctor's report (mentally ill)", "Court order/arrest warrant", "Admin verification", "Official documents"],
    featureIcons: [IconStethoscope, IconScale, IconShieldCheck, IconFileDescription],
  },
];

export default function CaseTypes() {
  return (
    <>
      <Title order={2} fw={800} ta="center" mb={10}>What Can You Report?</Title>
      <Text c="dimmed" ta="center" mb={50} maw={600} mx="auto">Three types of cases you can register in our system</Text>
      
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing={30} mb={50}>
        {caseTypes.map((type, idx) => {
          const Icon = type.icon;
          return (
            <Card key={idx} withBorder radius="lg" p="xl">
              <ThemeIcon size={60} radius={60} mx="auto" mb="md" style={{ background: PRIMARY_GRADIENT }}>
                <Icon size={30} color="white" />
              </ThemeIcon>
              <Title order={3} ta="center" mb="sm">{type.title}</Title>
              <Text c="dimmed" ta="center" size="sm" mb="md">{type.description}</Text>
              <List spacing="xs" size="sm" center>
                {type.features.map((feature, i) => (
                  <List.Item key={i} icon={<IconCheck size={16} color={PRIMARY_COLOR} />}>{feature}</List.Item>
                ))}
              </List>
            </Card>
          );
        })}
      </SimpleGrid>
    </>
  );
}