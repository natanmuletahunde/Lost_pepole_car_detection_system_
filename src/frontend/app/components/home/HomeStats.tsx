"use client";
import { Box, Container, Grid, Title, Text, Stack, Paper, Group, Skeleton, Alert } from "@mantine/core";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { 
  IconFileReport, 
  IconCheck, 
  IconUsers, 
  IconDevices,
  IconAlertCircle 
} from "@tabler/icons-react";

export default function HomeStats() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${baseUrl}/public/stats`);
      const data = await res.json();
      
      if (data.success && data.data?.stats) {
        const { totalReports, resolvedCases, activeUsers, devicesConnected } = data.data.stats;
        
        const formatNumber = (num: number) => {
          if (num >= 1000) return (num / 1000).toFixed(1) + "k+";
          return num.toString();
        };

        setStats([
          { value: formatNumber(totalReports), label: "Total Reports", icon: IconFileReport, color: "blue" },
          { value: formatNumber(resolvedCases), label: "Resolved Cases", icon: IconCheck, color: "teal" },
          { value: formatNumber(activeUsers), label: "Active Users", icon: IconUsers, color: "indigo" },
          { value: formatNumber(devicesConnected), label: "Active Devices", icon: IconDevices, color: "cyan" },
        ]);
        setError(null);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setError("Unable to load real-time statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll every 30 seconds for "real-time" updates
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box py={{ base: 80, md: 120 }} bg="#0f172a" style={{ position: "relative", overflow: "hidden" }}>
      {/* Decorative background element */}
      <Box 
        style={{ 
          position: "absolute", 
          top: "50%", 
          left: "50%", 
          width: "60%", 
          height: "60%", 
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%)",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none"
        }} 
      />

      <Container size="xl">
        <Stack align="center" mb={60}>
          <Text 
            variant="gradient" 
            gradient={{ from: "blue.4", to: "cyan.4" }} 
            fw={800} 
            size="sm" 
            style={{ letterSpacing: 2, textTransform: "uppercase" }}
          >
            Live Platform Metrics
          </Text>
          <Title order={2} size={36} fw={900} c="white" ta="center">
            Real-time Impact Tracking
          </Title>
        </Stack>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Connection Error" color="red" mb="xl" variant="light">
            {error}
          </Alert>
        )}

        <Grid gutter={30}>
          {loading ? (
            Array(4).fill(0).map((_, idx) => (
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }} key={`skeleton-${idx}`}>
                <Skeleton height={180} radius="xl" bg="rgba(255,255,255,0.05)" />
              </Grid.Col>
            ))
          ) : (
            stats.map((stat, idx) => (
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }} key={stat.label}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <Paper
                    p={30}
                    radius="24px"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      textAlign: "center",
                      height: "100%",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    }}
                  >
                    <Stack align="center" gap={15}>
                      <Box 
                        p={12} 
                        radius="md" 
                        style={{ 
                          background: `rgba(var(--mantine-color-${stat.color}-6-rgb), 0.1)`,
                          borderRadius: "16px"
                        }}
                      >
                        <stat.icon size={32} color={`var(--mantine-color-${stat.color}-4)`} />
                      </Box>
                      <Title order={1} size={42} fw={900} c="white" style={{ letterSpacing: "-0.02em" }}>
                        {stat.value}
                      </Title>
                      <Text size="sm" fw={700} c="dimmed" style={{ letterSpacing: 1, textTransform: "uppercase" }}>
                        {stat.label}
                      </Text>
                    </Stack>
                  </Paper>
                </motion.div>
              </Grid.Col>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
}
