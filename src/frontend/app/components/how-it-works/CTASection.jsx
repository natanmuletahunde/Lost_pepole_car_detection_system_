import { Box, Paper, Title, Text, Group, Button } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const PRIMARY_GRADIENT = `linear-gradient(135deg, #0034D1 0%, #0066ff 100%)`;

export default function CTASection({ user }) {
  const router = useRouter();

  return (
    <Box py={40}>
      <Paper p={50} radius="lg" style={{ background: PRIMARY_GRADIENT, textAlign: "center" }}>
        <Title order={2} c="white" mb="md">Ready to Get Started?</Title>
        <Text c="white" opacity={0.9} mb="xl" maw={500} mx="auto">Join hundreds of families who have found their loved ones and vehicles with Flega</Text>
        
        <Group justify="center">
          <Button size="xl" color="white" radius="xl" onClick={() => router.push(user ? "/register-person" : "/signup")}>
            {user ? "Report a Case" : "Sign Up Free"}
          </Button>
          <Button size="xl" color="white" radius="xl" onClick={() => router.push(user ? "/report-sighting" : "/signup")} variant="outline">
            {user ? "Report a Sighting" : "Sign Up First"}
          </Button>
          <Button size="xl" variant="outline" color="white" radius="xl" onClick={() => router.push("/alert")}>
            View Active Alerts
          </Button>
        </Group>
        
        <Text size="sm" c="white" opacity={0.8} mt="xl">
          <IconLock size={14} style={{ display: "inline", marginRight: 5 }} />
          Your data is encrypted and secure. First registration is always free.
        </Text>
      </Paper>
    </Box>
  );
}