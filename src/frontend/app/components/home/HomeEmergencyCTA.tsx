"use client";
import { Box, Container, Title, Text, Flex, Button, Paper } from "@mantine/core";
import { IconLogin, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { useMediaQuery } from "@mantine/hooks";
import { useTranslations } from "next-intl";

export default function HomeEmergencyCTA() {
  const t = useTranslations("EmergencyCTA");
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Box py={{ base: 60, md: 100 }} bg="#141517">
      <Container size="xl">
        <Paper shadow="lg" p={{ base: "lg", md: 50 }} radius="lg" bg="linear-gradient(135deg, #2f80ed 0%, #1e56a0 100%)" ta="center">
          <Title order={2} c="white" mb="md">
            {t("title")}
          </Title>
          <Text size={isMobile ? "md" : "lg"} c="white" mb="xl" maw={600} mx="auto" style={{ opacity: 0.9 }}>
            {t("subtitle")}
          </Text>
          <Flex gap="md" justify="center" direction={{ base: "column", sm: "row" }} align="center">
            <Button size={isMobile ? "md" : "xl"} variant="white" color="blue" radius="xl" leftSection={<IconLogin size={20} />} component={Link} href="/authentication/login" fullWidth={isMobile}>
              {t("login")}
            </Button>
            <Button size={isMobile ? "md" : "xl"} bg="black" color="white" radius="xl" rightSection={<IconArrowRight size={20} />} component={Link} href="/authentication/signup" fullWidth={isMobile} style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
              {t("createAccount")}
            </Button>
          </Flex>
        </Paper>
      </Container>
    </Box>
  );
}
