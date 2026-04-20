"use client";

import { Box, Paper, Title, Text, SimpleGrid, Card, Badge, List, Group, Button, useMantineColorScheme } from "@mantine/core";
import { IconCheck, IconBuildingBank, IconWallet, IconCreditCard } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const PRIMARY_COLOR = "#0034D1";

export default function PricingSection({ user }) {
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme(); // ← CHANGE 1: ADD THIS

  return (
    <Box py={20} mb={30}>
      <Paper bg={colorScheme === "dark" ? "#1a1b2f" : "blue.0"} p={40} radius="lg"> {/* ← CHANGE 2: OUTER PAPER */}
        <Title order={2} mb="xl" style={{ color: PRIMARY_COLOR }}>Simple, Transparent Pricing</Title>
        <Text size="lg" mb="xl" maw={500}>First registration is FREE. After that, choose a plan that works for you.</Text>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={30}>
          {/* Free Plan */}
          <Card withBorder radius="lg" p="xl" bg={colorScheme === "dark" ? "#2C2E33" : "white"}> {/* ← CHANGE 3: INNER CARD */}
            <Badge color="blue" size="lg" mb="md">FREE</Badge>
            <Title order={3} mb="sm">First Registration</Title>
            <Text size="sm" c="dimmed" mb="md">Perfect for one-time reports</Text>
            <List spacing="xs" size="sm">
              {["1 free report (person or vehicle)", "Full camera detection", "Email notifications", "Alert dashboard access"].map((item, i) => (
                <List.Item key={i} icon={<IconCheck size={16} color="green" />}>{item}</List.Item>
              ))}
            </List>
            <Button fullWidth mt="xl" variant="outline" color="blue" onClick={() => router.push(user ? "/register-person" : "/signup")}>
              {user ? "Start Free Report" : "Sign Up Free"}
            </Button>
          </Card>

          {/* Premium Plan */}
          <Card withBorder radius="lg" p="xl" bg={colorScheme === "dark" ? "#2C2E33" : "white"}> {/* ← CHANGE 4: INNER CARD */}
            <Badge color="green" size="lg" mb="md">PREMIUM</Badge>
            <Title order={3} mb="sm">Unlimited Reports</Title>
            <Text size="sm" c="dimmed" mb="md">Starting at 360 birr/month</Text>
            <List spacing="xs" size="sm">
              {["Unlimited reports", "Priority camera detection", "SMS & Telegram alerts", "24/7 support"].map((item, i) => (
                <List.Item key={i} icon={<IconCheck size={16} color="green" />}>{item}</List.Item>
              ))}
            </List>
            <Group grow mt="xl">
              <Button color="green" onClick={() => router.push("/subscribe?plan=monthly")}>Monthly 400 birr</Button>
              <Button color="green" variant="outline" onClick={() => router.push("/subscribe?plan=annual")}>Annual 360/mo</Button>
            </Group>
          </Card>
        </SimpleGrid>

        <Group mt="md" justify="center">
          <IconBuildingBank size={16} color={PRIMARY_COLOR} />
          <IconWallet size={16} color={PRIMARY_COLOR} />
          <IconCreditCard size={16} color={PRIMARY_COLOR} />
          <Text size="sm" c="dimmed">All payment methods accepted</Text>
        </Group>
      </Paper>
    </Box>
  );
}