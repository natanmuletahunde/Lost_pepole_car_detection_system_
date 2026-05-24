"use client";

import { useState, useEffect } from "react";
import { Box, Paper, Title, Text, Group, Button } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useRouter, usePathname } from "next/navigation";

const PRIMARY_GRADIENT = `linear-gradient(135deg, #0034D1 0%, #0066ff 100%)`;

export default function CTASection() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Helper to get token from storage (try multiple keys)
  const getToken = () => {
    const token = 
      localStorage.getItem('auth_token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('auth_token');
    if (token) console.log('✅ Token found:', token.substring(0, 20) + '...');
    else console.log('❌ No token found in storage');
    return token;
  };

  // Check auth on mount and whenever pathname changes (e.g., after login redirect)
  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, [pathname]);

  // Handle protected buttons – check token again inside the handler (bypasses state)
  const handleProtectedClick = (targetUrl: string) => {
    const token = getToken(); // direct check, no stale state
    if (!token) {
      sessionStorage.setItem('returnUrl', targetUrl);
      router.push('/authentication/signup'); // change to your actual signup route
    } else {
      router.push(targetUrl);
    }
  };

  // Public button
  const handlePublicClick = (url: string) => {
    router.push(url);
  };

  return (
    <Box py={40}>
      <Paper p={50} radius="lg" style={{ background: PRIMARY_GRADIENT, textAlign: "center" }}>
        <Title order={2} c="white" mb="md">Ready to Get Started?</Title>
        <Text c="white" opacity={0.9} mb="xl" maw={500} mx="auto">
          Join hundreds of families who have found their loved ones and vehicles with Flega
        </Text>

        <Group justify="center">
          {/* Report a Case */}
          <Button
            size="xl"
            color="white"
            radius="xl"
            onClick={() => handleProtectedClick("/user/register")}
          >
            {isLoggedIn ? "Report a Case" : "Sign Up Free"}
          </Button>

          {/* Report a Sighting */}
          <Button
            size="xl"
            color="white"
            radius="xl"
            variant="outline"
            onClick={() => handleProtectedClick("/user/report-sighting")}
          >
            {isLoggedIn ? "Report a Sighting" : "Sign Up First"}
          </Button>

          {/* View Active Alerts – public */}
          <Button
            size="xl"
            variant="outline"
            color="white"
            radius="xl"
            onClick={() => handlePublicClick("/user/alert")}
          >
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