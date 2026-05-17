"use client";
import { Box, Container, Title, Text, Flex, Button, Paper } from "@mantine/core";
import { IconLogin, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { useMediaQuery } from "@mantine/hooks";

export default function HomeEmergencyCTA() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Box py={{ base: 60, md: 100 }} bg="#141517">
      <Container size="xl">
        <Paper shadow="lg" p={{ base: "lg", md: 50 }} radius="lg" bg="linear-gradient(135deg, #2f80ed 0%, #1e56a0 100%)" ta="center">
          <Title order={2} c="white" mb="md">
            Ready to get started?
          </Title>
          <Text size={{ base: "md", md: "lg" }} c="white" mb="xl" maw={600} mx="auto" style={{ opacity: 0.9 }}>
            Join thousands of users who have successfully found their lost
            items and helped others in the community.
          </Text>
          <Flex gap="md" justify="center" direction={{ base: "column", sm: "row" }} align="center">
            <Button size={isMobile ? "md" : "xl"} variant="white" color="blue" radius="xl" leftSection={<IconLogin size={20} />} component={Link} href="/authentication/login" fullWidth={isMobile}>
              Login
            </Button>
            <Button size={isMobile ? "md" : "xl"} bg="black" color="white" radius="xl" rightSection={<IconArrowRight size={20} />} component={Link} href="/authentication/signup" fullWidth={isMobile} style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
              Create Free Account
            </Button>
          </Flex>
        </Paper>
      </Container>
    </Box>
  );
}
