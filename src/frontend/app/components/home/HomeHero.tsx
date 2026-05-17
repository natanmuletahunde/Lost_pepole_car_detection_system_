"use client";

import {
  Box,
  Title,
  Text,
  Button,
  Group,
  Stack,
  useMantineColorScheme,
} from "@mantine/core";
import { IconArrowRight, IconShieldCheck } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMediaQuery } from "@mantine/hooks";

export default function HomeHero({
  isAuthenticated,
}: {
  isAuthenticated?: boolean;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Box
      style={{
        height: isMobile ? "auto" : "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "relative",
        // Stunning premium deep space gradient that transitions from velvety dark navy on the left to rich sapphire and glowing emerald-teal on the right
        background: isDark
          ? "linear-gradient(135deg, #020617 0%, #090d16 35%, #1e1b4b 70%, #064e3b 100%)"
          : "linear-gradient(135deg, #030712 0%, #0c1a30 35%, #1e3a8a 70%, #0d9488 100%)",
      }}
    >
      {!isMobile && (
        <Box
          style={{
            position: "absolute",
            top: "0",
            bottom: "0",
            right: "0%",
            width: "65%", // Larger width to allow full illustration scaling
            height: "100%", // Set to 100% to completely cover the top gap
            zIndex: 1,
          }}
        >
          <Image
            src="/heropic.png"
            alt="Finding what's lost"
            fill
            style={{ objectFit: "contain", objectPosition: "right bottom" }}
            priority
          />
        </Box>
      )}

      {/* Content */}
      <Box
        style={{
          position: "relative",
          zIndex: 2,
          height: isMobile ? "auto" : "100%",
          display: "flex",
          alignItems: "center",
          paddingLeft: isMobile ? 24 : "6vw",
          paddingRight: isMobile ? 24 : "42%",
          paddingTop: isMobile ? 100 : 0,
          paddingBottom: isMobile ? 80 : 0,
        }}
      >
        <Stack gap="xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <BadgeSection />

            {/* Main Heading */}
            <Title
              order={1}
              size={isMobile ? 40 : 68}
              fw={900}
              c="white"
              mt="xl"
              style={{
                lineHeight: 1.05,
                letterSpacing: "-0.05em",
                maxWidth: 700,
              }}
            >
              If you{" "}
              <Text
                component="span"
                variant="gradient"
                gradient={{ from: "blue.3", to: "cyan.3" }}
                inherit
              >
                lost it
              </Text>
              ,
              <br />
              we will{" "}
              <Text
                component="span"
                variant="gradient"
                gradient={{ from: "cyan.3", to: "teal.3" }}
                inherit
              >
                find it
              </Text>
            </Title>

            {/* Subtitle */}
            <Title
              order={2}
              size={isMobile ? 20 : 30}
              fw={700}
              c="blue.1"
              mt="lg"
              style={{
                opacity: 0.95,
              }}
            >
              Join thousands who recovered their lost belongings
            </Title>

            {/* Description */}
            <Text
              size={isMobile ? "md" : "xl"}
              c="gray.3"
              mt="md"
              mb={42}
              fw={500}
              maw={560}
              style={{
                lineHeight: 1.7,
              }}
            >
              Returning lost items is now faster and smarter with
              Flegas™ Black Lions™ AI-powered cloud platform — accessible
              from any device, anytime.
            </Text>

            {/* Buttons */}
            <Group
              gap="md"
              wrap={isMobile ? "wrap" : "nowrap"}
            >
              <Button
                component={Link}
                href={
                  isAuthenticated
                    ? "/user/register"
                    : "/authentication/signup"
                }
                size={isMobile ? "lg" : "xl"}
                radius="xl"
                px={40}
                h={58}
                bg="blue.6"
                rightSection={<IconArrowRight size={22} />}
                fullWidth={isMobile}
                style={{
                  boxShadow:
                    "0 20px 45px rgba(37, 99, 235, 0.35)",
                  fontSize: 18,
                  fontWeight: 700,
                  transition: "all 0.3s ease",
                }}
              >
                {isAuthenticated
                  ? "Register Case"
                  : "Get Started Free"}
              </Button>

              <Button
                component={Link}
                href="/user/how-it-works"
                size={isMobile ? "lg" : "xl"}
                variant="outline"
                color="white"
                radius="xl"
                px={40}
                h={58}
                fullWidth={isMobile}
                style={{
                  borderWidth: 2,
                  fontSize: 18,
                  fontWeight: 700,
                  backdropFilter: "blur(12px)",
                  background:
                    "rgba(255,255,255,0.08)",
                  borderColor:
                    "rgba(255,255,255,0.25)",
                  transition: "all 0.3s ease",
                }}
              >
                How it works
              </Button>
            </Group>
          </motion.div>
        </Stack>
      </Box>
    </Box>
  );
}

function BadgeSection() {
  return (
    <Box
      style={{
        display: "inline-block",
        background: "rgba(255,255,255,0.10)",
        backdropFilter: "blur(14px)",
        padding: "10px 18px",
        borderRadius: 100,
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow:
          "0 8px 25px rgba(0,0,0,0.15)",
      }}
    >
      <Group gap={10}>
        <IconShieldCheck
          size={18}
          color="#4dabf7"
        />
        <Text
          size="xs"
          fw={800}
          c="blue.1"
          style={{
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          AI-Powered Recovery Platform
        </Text>
      </Group>
    </Box>
  );
}