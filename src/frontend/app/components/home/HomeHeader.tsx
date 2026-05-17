"use client";

import { useEffect, useState } from "react";
import {
  Group,
  Button,
  UnstyledButton,
  Text,
  Divider,
  Box,
  Burger,
  Drawer,
  ScrollArea,
  rem,
  useMantineTheme,
  Container,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomeHeader() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const theme = useMantineTheme();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    const userData = localStorage.getItem("currentUser");
    
    if (authStatus === "true" && userData) {
      setIsAuthenticated(true);
      try {
        const parsed = JSON.parse(userData);
        setUserRole(parsed.role);
      } catch(e) {}
    }
  }, []);

  const handleDashboardRedirect = () => {
    if (userRole && userRole.toLowerCase() === "admin") {
      router.push("/admin");
    } else {
      router.push("/user/dashboard");
    }
    closeDrawer();
  };

  return (
    <Box bg="white" style={{ position: "sticky", top: 0, zIndex: 1000, borderBottom: "1px solid #e9ecef" }}>
      <Container size="xl" h={70}>
        <Group justify="space-between" h="100%">
          <Link href="/user/homepage" style={{ flexShrink: 0 }}>
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={120}
              height={40}
              style={{ height: "40px", width: "auto" }}
            />
          </Link>

          <Group h="100%" gap={0} visibleFrom="sm">
            <UnstyledButton component={Link} href="#about" p="md" fw={500}>About</UnstyledButton>
            <UnstyledButton component={Link} href="#features" p="md" fw={500}>Features</UnstyledButton>
            <UnstyledButton component={Link} href="#how-it-works" p="md" fw={500}>How it works</UnstyledButton>
            <UnstyledButton component={Link} href="#cases" p="md" fw={500}>Recent Cases</UnstyledButton>
          </Group>

          <Group visibleFrom="sm" gap="md">
            <TextInput
              placeholder="Search..."
              leftSection={<IconSearch size={16} />}
              radius="xl"
              size="sm"
            />
            {isAuthenticated ? (
              <Button color="blue" onClick={handleDashboardRedirect}>Go to Dashboard</Button>
            ) : (
              <>
                <Button variant="default" component={Link} href="/authentication/login">Log in</Button>
                <Button component={Link} href="/authentication/signup" color="blue">Sign up</Button>
              </>
            )}
          </Group>

          <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
        </Group>
      </Container>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title={
          <Image
            src="/logo.jpg"
            alt="Logo"
            width={120}
            height={40}
            style={{ height: "40px", width: "auto" }}
          />
        }
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Divider my="sm" />
          <UnstyledButton component={Link} href="/user/about" w="100%" p="md" fw={500} onClick={closeDrawer}>About</UnstyledButton>
          <UnstyledButton component={Link} href="#features" w="100%" p="md" fw={500} onClick={closeDrawer}>Features</UnstyledButton>
          <UnstyledButton component={Link} href="/user/how-it-works" w="100%" p="md" fw={500} onClick={closeDrawer}>How it works</UnstyledButton>
          <UnstyledButton component={Link} href="#cases" w="100%" p="md" fw={500} onClick={closeDrawer}>Recent Cases</UnstyledButton>
          <Divider my="sm" />
          <Group justify="center" grow pb="xl" px="md">
            {isAuthenticated ? (
              <Button color="blue" onClick={handleDashboardRedirect}>Go to Dashboard</Button>
            ) : (
              <>
                <Button variant="default" component={Link} href="/authentication/login" onClick={closeDrawer}>Log in</Button>
                <Button component={Link} href="/authentication/signup" color="blue" onClick={closeDrawer}>Sign up</Button>
              </>
            )}
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
