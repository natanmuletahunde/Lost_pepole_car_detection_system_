"use client";

import { Box, Paper, Title, Text, Group, Button } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const PRIMARY_GRADIENT = `linear-gradient(135deg, #0034D1 0%, #0066ff 100%)`;

export default function CTASection({ user }: { user?: any }) {
  const router = useRouter();

  const handleClick = (targetUrl: string) => {
    router.push(targetUrl);
  };

  return (
    <Box py={40}>
      <Paper
        p={50}
        radius="lg"
        style={{ background: PRIMARY_GRADIENT, textAlign: "center" }}
      >
        <Title order={2} c="white" mb="md">
          Ready to Get Started?
        </Title>
        <Text c="white" opacity={0.9} mb="xl" maw={500} mx="auto">
          Join hundreds of families who have found their loved ones and vehicles
          with Flega
        </Text>

        <Group justify="center" style={{ gap: 16, flexWrap: "wrap" }}>
          {/* Report a Case */}
          <Button
            size="xl"
            color="white"
            radius="xl"
            onClick={() =>
              handleClick(user ? "/user/register" : "/authentication/signup")
            }
          >
            {user ? "Report a Case" : "Sign Up Free"}
          </Button>

          {/* Report a Sighting */}
          <Button
            size="xl"
            color="white"
            radius="xl"
            variant="outline"
            onClick={() =>
              handleClick(
                user ? "/user/report-sighting" : "/authentication/signup",
              )
            }
          >
            {user ? "Report a Sighting" : "Sign Up First"}
          </Button>

          {/* View Active Alerts */}
          <Button
            size="xl"
            variant="outline"
            color="white"
            radius="xl"
            onClick={() =>
              handleClick(user ? "/user/alert" : "/authentication/signup")
            }
          >
            {user ? "View Active Alerts" : "Sign Up First"}
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
