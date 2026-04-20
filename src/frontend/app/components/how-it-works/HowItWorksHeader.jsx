"use client";

import { Box, Container, Group, TextInput, ActionIcon, Button, Menu, Avatar, UnstyledButton, Text, Badge, Stack, Divider } from "@mantine/core";
import { IconSearch, IconHome, IconMail, IconUser, IconFileReport, IconBell, IconHistory, IconSettings, IconLogout, IconLogin, IconUserPlus } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const getBg = (colorScheme, light, dark) => (colorScheme === "dark" ? dark : light);
const getUserInitials = (firstName, lastName) => `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();

export default function HowItWorksHeader({ user, isMobile, colorScheme }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  return (
    <Box
      bg={getBg(colorScheme, "white", "#1A1B1E")}
      py={{ base: "xs", md: "sm" }}
      style={{
        borderBottom: `1px solid ${getBg(colorScheme, "#e9ecef", "#2C2E33")}`,
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(10px)",
      }}
    >
      <Container size="xl">
        <Group justify="space-between" wrap="nowrap">
          <Link href="/" style={{ flexShrink: 0 }}>
            <Image src="/logo.jpg" alt="Logo" width={120} height={40} style={{ height: "40px", width: "auto" }} />
          </Link>

          <TextInput
            placeholder="Search lost items, cars, or people..."
            leftSection={<IconSearch size={16} />}
            style={{ flex: 1, maxWidth: isMobile ? "200px" : "400px" }}
            radius="xl"
            variant="filled"
          />

          <Group gap={isMobile ? "xs" : "md"} wrap="nowrap">
            <Button variant="subtle" component={Link} href="/user/about" radius="xl" style={{ color: colorScheme === "dark" ? "#e0e0e0" : "#333333" }}>About Us</Button>
            <ActionIcon component={Link} href="/" variant="subtle" color="gray" size="lg"><IconHome size={24} /></ActionIcon>

            {user ? <UserMenu user={user} isMobile={isMobile} onLogout={handleLogout} colorScheme={colorScheme} /> : <AuthButtons isMobile={isMobile} />}
          </Group>
        </Group>
      </Container>
    </Box>
  );
}

// Sub-component: User Menu
function UserMenu({ user, isMobile, onLogout, colorScheme }) {
  const getBg = (light, dark) => (colorScheme === "dark" ? dark : light);
  
  return (
    <Menu shadow="md" width={320} radius="md">
      <Menu.Target>
        <UnstyledButton>
          <Group gap="sm" wrap="nowrap">
            {!isMobile && (
              <Box ta="right">
                <Text fw={800} size="sm" truncate>{user.firstName} {user.lastName}</Text>
                <Text size="xs" c="dimmed" style={{ display: "flex", alignItems: "center", gap: 4 }}><IconMail size={10} /> {user.email}</Text>
              </Box>
            )}
            <Avatar src={null} color="blue" size={isMobile ? "sm" : "md"} radius="xl" style={{ border: "2px solid #2f80ed" }}>
              {getUserInitials(user.firstName, user.lastName)}
            </Avatar>
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown bg={getBg("white", "#1A1B1E")}>
        {/* Profile section */}
        <Box mb="md" pb="md" style={{ borderBottom: `1px solid ${getBg("#e9ecef", "#2C2E33")}` }}>
          <Group mb="xs">
            <Avatar src={null} color="blue" size="lg" radius="xl" style={{ border: "3px solid #2f80ed" }}>{getUserInitials(user.firstName, user.lastName)}</Avatar>
            <Box style={{ flex: 1 }}>
              <Text size="md" fw={700}>{user.firstName} {user.lastName}</Text>
              <Text size="sm" c="dimmed">{user.email}</Text>
              <Badge size="xs" color={user.role === "admin" ? "red" : "blue"} variant="light" mt={4}>{user.role}</Badge>
            </Box>
          </Group>
          <Button fullWidth variant="light" component={Link} href="/profile" leftSection={<IconUser size={16} />} size="sm">View Profile</Button>
        </Box>
        
        {/* Menu items */}
        <Stack gap={4}>
          <Menu.Item leftSection={<IconUser size={18} />} component={Link} href="/profile">My Profile</Menu.Item>
          <Menu.Item leftSection={<IconFileReport size={18} />} component={Link} href="/reported-cases">Reported Cases</Menu.Item>
          <Menu.Item leftSection={<IconBell size={18} />} onClick={() => router.push("/alert")}>My Notifications</Menu.Item>
          <Menu.Item leftSection={<IconHistory size={18} />} component={Link} href="/history">Search History</Menu.Item>
          <Menu.Item leftSection={<IconSettings size={18} />} component={Link} href="/settings">Account Settings</Menu.Item>
        </Stack>
        <Menu.Divider />
        <Menu.Item color="red" leftSection={<IconLogout size={18} />} onClick={onLogout}>Logout</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

// Sub-component: Auth Buttons
function AuthButtons({ isMobile }) {
  return (
    <Group gap={isMobile ? "xs" : "sm"} wrap="nowrap">
      <Button variant="outline" color="blue" leftSection={<IconLogin size={16} />} component={Link} href="/login" radius="xl" size={isMobile ? "xs" : "sm"}>{isMobile ? "Login" : "Sign In"}</Button>
      <Button color="blue" leftSection={<IconUserPlus size={16} />} component={Link} href="/signup" radius="xl" size={isMobile ? "xs" : "sm"} style={{ background: "linear-gradient(135deg, #2f80ed 0%, #1e56a0 100%)" }}>{isMobile ? "Join" : "Sign Up"}</Button>
    </Group>
  );
}