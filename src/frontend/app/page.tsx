"use client";
import { useState, useEffect } from "react";
import { Box, useMantineColorScheme } from "@mantine/core";
import HomeHero from "./components/home/HomeHero";
import HomeAbout from "./components/home/HomeAbout";
import HomeFeatures from "./components/home/HomeFeatures";
import HomeStats from "./components/home/HomeStats";
import HomeHowItWorks from "./components/home/HomeHowItWorks";
import HomeShowcase from "./components/home/HomeShowcase";
import HomeTestimonials from "./components/home/HomeTestimonials";
import HomeEmergencyCTA from "./components/home/HomeEmergencyCTA";
import MainFooter from "./components/MainFooter";
import DashboardHeader from "./user/dashboard/DashboardHeader";

export default function RootPage() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    const userData = localStorage.getItem("currentUser");
    if (authStatus === "true" && userData) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(userData));
      } catch (e) {}
    }
  }, []);

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getUserRoute = (path: string) => {
    if (!user) return path;
    if (path === "/login") return "/authentication/login";
    if (path === "/signup") return "/authentication/signup";
    const publicRoutes = ["/"];
    if (publicRoutes.includes(path)) return path;
    if (path.startsWith("/user")) return path;
    return `/user${path}`;
  };

  const getBg = (light: string, dark: string) => (colorScheme === "dark" ? dark : light);

  return (
    <Box style={{ overflowX: "hidden", background: getBg("#f5f7fb", "#090d16") }}>
      <DashboardHeader
        user={user}
        notifications={[]}
        unreadCount={0}
        colorScheme={colorScheme as any}
        toggleColorScheme={toggleColorScheme}
        getUserInitials={getUserInitials}
        getUserRoute={getUserRoute}
        showGoToDashboard={isAuthenticated}
      />

      <HomeHero isAuthenticated={isAuthenticated} />
      
      <HomeFeatures />
      <HomeShowcase />
      <HomeAbout />
      
      <HomeStats />
      
      <HomeTestimonials />
      
      {!isAuthenticated && <HomeEmergencyCTA />}
      
      <MainFooter />
    </Box>
  );
}