// app/user/dashboard/page.tsx (or app/dashboard/page.tsx)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Loader,
  Center,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import DashboardHeader from "./DashboardHeader";
import DashboardHero from "./DashboardHero";
import DashboardMainContent from "./DashboardMainContent";
import DashboardBottomSections from "./DashboardBottomSections";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
const MISSING_PERSONS_API = `${API_BASE_URL}/missingPersons`;
const MISSING_VEHICLES_API = `${API_BASE_URL}/missingVehicles`;
const SIGHTINGS_API = `${API_BASE_URL}/sightings`;
const NOTIFICATIONS_API = `${API_BASE_URL}/notifications`;

export default function Dashboard() {
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missingPersons, setMissingPersons] = useState([]);
  const [missingVehicles, setMissingVehicles] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [recentSightings, setRecentSightings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);

  // ---------- Helper functions ----------
  const getUserInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "blue";
      case "resolved":
        return "green";
      case "investigation":
        return "orange";
      default:
        return "gray";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "red";
      case "medium":
        return "yellow";
      case "low":
        return "green";
      default:
        return "gray";
    }
  };

  const getUserRoute = (path) => {
    if (!user) return path;
    const publicRoutes = ["/login", "/signup", "/how-it-works", "/"];
    if (publicRoutes.includes(path)) return path;
    if (path.startsWith("/user")) return path;
    return `/user${path}`;
  };

  // ---------- Authentication check & redirect ----------
  useEffect(() => {
    const checkAuth = async () => {
      const userData = localStorage.getItem("currentUser");

      if (!userData) {
        router.push("/login");
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        // Optional: redirect admin users to admin panel
        if (parsedUser.role && parsedUser.role.toLowerCase() === "admin") {
          router.push("/admin");
          return;
        }
        setUser(parsedUser);
      } catch (error) {
        router.push("/login");
        return;
      }
      setLoading(false);
    };

    checkAuth();

    const handleStorageChange = (e) => {
      if (e.key === "currentUser") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router]);

  // ---------- Fetch missing persons and vehicles ----------
  useEffect(() => {
    const fetchMissingData = async () => {
      setDataLoading(true);
      try {
        const [personsRes, vehiclesRes] = await Promise.all([
          fetch(MISSING_PERSONS_API),
          fetch(MISSING_VEHICLES_API),
        ]);

        if (personsRes.ok) {
          const persons = await personsRes.json();
          setMissingPersons(persons.filter((p) => p.status === "Active"));
        }
        if (vehiclesRes.ok) {
          const vehicles = await vehiclesRes.json();
          setMissingVehicles(vehicles.filter((v) => v.status === "Active"));
        }
      } catch (error) {
        console.error("Error fetching missing data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchMissingData();
  }, []);

  // ---------- Fetch recent sightings ----------
  useEffect(() => {
    const fetchSightings = async () => {
      try {
        const res = await fetch(SIGHTINGS_API);
        if (res.ok) {
          const data = await res.json();
          const sorted = data.sort(
            (a, b) => new Date(b.reportDate) - new Date(a.reportDate)
          );
          setRecentSightings(sorted.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching sightings:", error);
      }
    };
    fetchSightings();
  }, []);

  // ---------- Fetch notifications ----------
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(NOTIFICATIONS_API);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.read).length);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        // Fallback demo data
        const demo = [
          { id: 1, message: "New sighting of your reported car", time: "5 min ago", read: false },
          { id: 2, message: "Case #123 status changed to Resolved", time: "1 hour ago", read: false },
          { id: 3, message: "Someone commented on your report", time: "yesterday", read: true },
        ];
        setNotifications(demo);
        setUnreadCount(demo.filter((n) => !n.read).length);
      }
    };
    fetchNotifications();
  }, []);

  // ---------- Fetch user's reports if logged in ----------
  useEffect(() => {
    const fetchUserReports = async () => {
      if (!user) return;

      try {
        const [personsRes, vehiclesRes] = await Promise.all([
          fetch(MISSING_PERSONS_API),
          fetch(MISSING_VEHICLES_API),
        ]);

        let reports = [];

        if (personsRes.ok) {
          const persons = await personsRes.json();
          reports = reports.concat(
            persons.filter((p) => p.reportedBy?.userId === user.id)
          );
        }
        if (vehiclesRes.ok) {
          const vehicles = await vehiclesRes.json();
          reports = reports.concat(
            vehicles.filter((v) => v.reportedBy?.userId === user.id)
          );
        }

        setUserReports(reports);
      } catch (error) {
        console.error("Error fetching user reports:", error);
      }
    };

    fetchUserReports();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentUser");
    setUser(null);
    router.push("/login");
  };

  // Show loader while checking authentication
  if (loading) {
    return (
      <Center
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Box
          style={{
            background: colorScheme === "dark" ? "#1A1B1E" : "white",
            padding: 40,
            borderRadius: 20,
            textAlign: "center",
          }}
        >
          <Loader size="xl" color="#2f80ed" />
          <Text mt="md">Loading your dashboard...</Text>
        </Box>
      </Center>
    );
  }

  return (
    <Box
      bg={colorScheme === "dark" ? "#1A1B1E" : "white"}
      style={{ minHeight: "100vh" }}
    >
      <DashboardHeader
        user={user}
        notifications={notifications}
        unreadCount={unreadCount}
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
        onLogout={handleLogout}
        getUserInitials={getUserInitials}
        getUserRoute={getUserRoute}
      />

      <DashboardHero
        user={user}
        isMobile={isMobile}
        getUserRoute={getUserRoute}
      />

      <DashboardMainContent
        user={user}
        missingPersons={missingPersons}
        missingVehicles={missingVehicles}
        userReports={userReports}
        recentSightings={recentSightings}
        dataLoading={dataLoading}
        colorScheme={colorScheme}
        getUserRoute={getUserRoute}
        getStatusColor={getStatusColor}
        getPriorityColor={getPriorityColor}
      />

      <DashboardBottomSections
        user={user}
        missingPersons={missingPersons}
        missingVehicles={missingVehicles}
        userReports={userReports}
        colorScheme={colorScheme}
        getUserRoute={getUserRoute}
      />
    </Box>
  );
}