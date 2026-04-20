"use client";

import { useState, useEffect } from "react";
import { Card, Text, Group, Badge, Button, Stack, Loader, Box } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

const getBg = (colorScheme, light, dark) => (colorScheme === "dark" ? dark : light);
const getTextColor = (colorScheme, light, dark) => (colorScheme === "dark" ? dark : light);
const getBorderColor = (colorScheme) => (colorScheme === "dark" ? "#2c2e33" : "#eaeef2");

export default function AlertHistoryTab({ colorScheme }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const userData = localStorage.getItem("currentUser");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserId(parsedUser.id);
        }

        // Fetch alerts from JSON Server
        const [vehiclesRes, personsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/missingVehicles`),
          fetch(`${API_BASE_URL}/missingPersons`),
        ]);

        const vehicles = await vehiclesRes.json();
        const persons = await personsRes.json();

        // Transform and combine alerts
        const vehicleAlerts = vehicles.map((v) => ({
          id: v.id,
          type: "Vehicle",
          location: v.lastSeenLocation || "Unknown",
          time: v.reportDate ? new Date(v.reportDate).toLocaleDateString() : "Unknown",
          status: v.status || "Active",
        }));

        const personAlerts = persons.map((p) => ({
          id: p.id,
          type: "Person",
          location: p.lastSeenLocation || "Unknown",
          time: p.reportDate ? new Date(p.reportDate).toLocaleDateString() : "Unknown",
          status: p.status || "Active",
        }));

        const allAlerts = [...vehicleAlerts, ...personAlerts].sort((a, b) => b.id - a.id);
        setAlerts(allAlerts.slice(0, 10)); // Show last 10 alerts
      } catch (error) {
        console.error("Error fetching alerts:", error);
        // Fallback mock data
        setAlerts([
          { id: 1, type: "Person", location: "Front Gate", time: "Feb 5, 2026", status: "Reviewed" },
          { id: 2, type: "Vehicle", location: "Driveway", time: "Feb 5, 2026", status: "Active" },
          { id: 3, type: "Person", location: "Backyard", time: "Feb 4, 2026", status: "Reviewed" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <Card withBorder radius="md" padding="lg" bg={getBg(colorScheme, "white", "#2c2e33")}>
        <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <Loader size="md" color="blue" />
        </Box>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" padding="lg" bg={getBg(colorScheme, "white", "#2c2e33")}>
      <Text fw={500} size="md" mb="lg" c={getTextColor(colorScheme, "black", "white")}>
        Alert History
      </Text>

      <Stack gap="sm">
        {alerts.length === 0 ? (
          <Text ta="center" c="dimmed" py="xl">No alerts found</Text>
        ) : (
          alerts.map((alert) => (
            <Group
              key={alert.id}
              justify="space-between"
              py="sm"
              style={{ borderBottom: `1px solid ${getBorderColor(colorScheme)}` }}
            >
              <Group gap="sm">
                <Badge color={alert.type === "Person" ? "blue" : "green"} size="sm">
                  {alert.type}
                </Badge>
                <Box>
                  <Text size="sm" fw={500} c={getTextColor(colorScheme, "black", "white")}>
                    {alert.location}
                  </Text>
                  <Text size="xs" c="dimmed">{alert.time}</Text>
                </Box>
              </Group>
              <Badge color={alert.status === "Active" ? "yellow" : "gray"} size="sm" variant="light">
                {alert.status}
              </Badge>
            </Group>
          ))
        )}
      </Stack>

      <Button variant="subtle" fullWidth mt="md" onClick={() => window.location.href = "/alert"}>
        View all alerts
      </Button>
    </Card>
  );
}