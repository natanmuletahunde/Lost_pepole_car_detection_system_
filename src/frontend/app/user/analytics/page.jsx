'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Title,
  Text,
  Paper,
  Group,
  Button,
  Badge,
  Flex,
  Avatar,
  Select,
  Card,
  SimpleGrid,
  Stack,
  Divider,
  ActionIcon,
  Modal,
  Loader,
  Alert,
  Grid,
  SegmentedControl,
  Progress,
  useMantineTheme,
  Tooltip,
  Tabs,
  NumberInput,
  TextInput,
  Chip,
  Pagination,
  Table,
  Menu,
  CopyButton,
  Center
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconDownload,
  IconEye,
  IconEdit,
  IconTrash,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconClock,
  IconMapPin,
  IconCar,
  IconUser,
  IconPhone,
  IconMail,
  IconCalendar,
  IconSortAscending,
  IconSortDescending,
  IconChevronRight,
  IconCopy,
  IconChartBar,
  IconList,
  IconLayoutGrid,
  IconExternalLink,
  IconBell,
  IconMessageCircle,
  IconStar,
  IconSettings,
  IconPrinter,
  IconShare,
  IconLock,
  IconLockOpen,
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconTarget,
  IconAward,
  IconClockHour4,
  IconMap,
  IconDeviceAnalytics,
  IconChartPie,
  IconChartLine,
  IconChartArea,
  IconChartDonut,
  IconChartBubble,
  IconChartCandle,
  IconChartArrows,
  IconChartInfographic,
  IconChartDots,
  IconChartCircles,
  IconChartPie4
} from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainFooter from '../../components/MainFooter';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslations } from 'next-intl';

// API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const MISSING_PERSONS_API = `${API_BASE_URL}/missingPersons`;
const MISSING_VEHICLES_API = `${API_BASE_URL}/missingVehicles`;

// Primary Colors
const PRIMARY_COLOR = '#0034D1';
const PRIMARY_LIGHT = '#4d79ff';
const PRIMARY_DARK = '#0029a8';
const PRIMARY_GRADIENT = `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #0066ff 100%)`;
const PRIMARY_GRADIENT_HOVER = `linear-gradient(135deg, ${PRIMARY_DARK} 0%, #0052d4 100%)`;
const LIGHT_BG = '#f0f5ff';
const CARD_BG = '#f8fbff';

// Chart colors
const CHART_COLORS = [
  '#2f80ed', '#219653', '#f2c94c', '#eb5757', '#9b51e0', 
  '#2d9cdb', '#27ae60', '#f2994a', '#e74c3c', '#34495e'
];

export default function AnalyticsPage() {
  const t = useTranslations("Analytics");
  const router = useRouter();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  
  // State management
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y
  const [activeTab, setActiveTab] = useState('overview');
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Mock data for charts (replace with actual API data)
  const mockAnalyticsData = {
    // Overview stats
    overview: {
      totalCases: 356,
      activeCases: 124,
      resolvedCases: 189,
      newCases: 43,
      avgResolutionTime: '4.2',
      successRate: '92.3',
      topRegions: [
        { name: 'Addis Ababa', count: 89, change: '+12%' },
        { name: 'Oromia', count: 67, change: '+8%' },
        { name: 'Amhara', count: 45, change: '-3%' },
        { name: 'Tigray', count: 38, change: '+15%' },
        { name: 'SNNP', count: 32, change: '+5%' },
      ],
      caseTypes: [
        { type: 'Person', count: 215, percentage: 60.4 },
        { type: 'Vehicle', count: 141, percentage: 39.6 },
      ]
    },
    
    // Performance metrics
    performance: {
      resolutionRate: 92.3,
      avgResponseTime: '2.4',
      userSatisfaction: 4.7,
      efficiencyScore: 88.5,
      trends: [
        { month: 'Jan', cases: 45, resolved: 38 },
        { month: 'Feb', cases: 52, resolved: 46 },
        { month: 'Mar', cases: 48, resolved: 42 },
        { month: 'Apr', cases: 61, resolved: 56 },
        { month: 'May', cases: 67, resolved: 62 },
        { month: 'Jun', cases: 73, resolved: 68 },
        { month: 'Jul', cases: 58, resolved: 54 },
        { month: 'Aug', cases: 49, resolved: 45 },
      ]
    },
    
    // Case distribution
    distribution: {
      byStatus: [
        { status: 'Active', count: 124, color: CHART_COLORS[0] },
        { status: 'Resolved', count: 189, color: CHART_COLORS[1] },
        { status: 'Investigation', count: 32, color: CHART_COLORS[2] },
        { status: 'Pending', count: 11, color: CHART_COLORS[3] },
      ],
      byPriority: [
        { priority: 'High', count: 89, color: CHART_COLORS[3] },
        { priority: 'Medium', count: 167, color: CHART_COLORS[2] },
        { priority: 'Low', count: 100, color: CHART_COLORS[1] },
      ],
      byRegion: [
        { region: 'Addis Ababa', count: 89, percentage: 25 },
        { region: 'Oromia', count: 67, percentage: 18.8 },
        { region: 'Amhara', count: 45, percentage: 12.6 },
        { region: 'Tigray', count: 38, percentage: 10.7 },
        { region: 'SNNP', count: 32, percentage: 9 },
        { region: 'Others', count: 85, percentage: 23.9 },
      ]
    },
    
    // Recent activity
    recentActivity: [
      { id: 1, type: 'Case Resolved', caseId: 'CASE-2389X', description: 'Missing person found', time: '2 hours ago', icon: <IconCheck size={16} /> },
      { id: 2, type: 'New Report', caseId: 'CASE-2390A', description: 'Vehicle reported missing', time: '4 hours ago', icon: <IconCar size={16} /> },
      { id: 3, type: 'Alert Sent', caseId: 'CASE-2387B', description: 'Community alert distributed', time: '6 hours ago', icon: <IconBell size={16} /> },
      { id: 4, type: 'Case Updated', caseId: 'CASE-2385C', description: 'New leads added', time: '1 day ago', icon: <IconEdit size={16} /> },
      { id: 5, type: 'User Registered', caseId: null, description: 'New community member joined', time: '2 days ago', icon: <IconUser size={16} /> },
    ],
    
    // Top performers (community helpers)
    topPerformers: [
      { id: 1, name: 'Amanuel K.', role: 'Community Volunteer', casesHelped: 23, successRate: '95%', avatar: null },
      { id: 2, name: 'Sarah M.', role: 'Police Liaison', casesHelped: 19, successRate: '92%', avatar: null },
      { id: 3, name: 'Michael T.', role: 'Search Team Lead', casesHelped: 17, successRate: '88%', avatar: null },
      { id: 4, name: 'Elena R.', role: 'Volunteer Coordinator', casesHelped: 15, successRate: '91%', avatar: null },
      { id: 5, name: 'David L.', role: 'Tech Support', casesHelped: 12, successRate: '86%', avatar: null },
    ]
  };

  // Fetch analytics data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user from localStorage
        const userData = localStorage.getItem('currentUser');
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUser(user);
        }

        // Fetch actual data from APIs
        const [personsResponse, vehiclesResponse] = await Promise.all([
          fetch(MISSING_PERSONS_API),
          fetch(MISSING_VEHICLES_API)
        ]);

        const personsData = await personsResponse.json();
        const vehiclesData = await vehiclesResponse.json();

        // Process and combine data for analytics
        // In a real app, you would have a dedicated analytics endpoint
        // For now, we'll use mock data
        setAnalyticsData(mockAnalyticsData);
        
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setAnalyticsData(mockAnalyticsData); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Export analytics data
  const handleExportData = (format) => {
    const fileName = `findr-analytics-${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'csv') {
      // Generate CSV content
      const csvContent = [
        ['Metric', 'Value', 'Change', 'Date Range'],
        ['Total Cases', analyticsData?.overview.totalCases, '-', timeRange],
        ['Active Cases', analyticsData?.overview.activeCases, '-', timeRange],
        ['Resolved Cases', analyticsData?.overview.resolvedCases, '-', timeRange],
        ['Success Rate', analyticsData?.overview.successRate + '%', '-', timeRange],
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.csv`;
      a.click();
    } else if (format === 'pdf') {
      // For PDF, you would use a library like jsPDF
      // This is a placeholder
      alert('PDF export functionality would be implemented here');
    }
    
    setExportModalOpen(false);
  };

  // Format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Calculate percentage for progress bars
  const calculatePercentage = (value, total) => {
    return total > 0 ? (value / total) * 100 : 0;
  };

  // Loading state
  if (loading || !analyticsData) {
    return (
      <Box style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: PRIMARY_GRADIENT
      }}>
        <Flex direction="column" align="center" gap="md">
          <Loader size="xl" color="white" variant="dots" />
          <Text c="white" size="lg" fw={600}>{t("loading")}</Text>
          <Text c="white" size="sm" opacity={0.8}>{t("loadingWait")}</Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box style={{ 
      minHeight: '100vh',
      background: isMobile ? LIGHT_BG : `radial-gradient(circle at 10% 20%, rgba(0, 52, 209, 0.05) 0%, rgba(255, 255, 255, 1) 100%)`,
      position: 'relative'
    }}>
      {/* Header */}
      <Box
        style={{
          backgroundColor: 'white',
          borderBottom: `2px solid ${LIGHT_BG}`,
          boxShadow: `0 2px 15px rgba(0, 52, 209, 0.1)`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Container size="lg">
          <Flex 
            justify="space-between" 
            align="center" 
            py="sm"
            direction={isMobile ? 'column' : 'row'}
            gap={isMobile ? 'md' : 'xs'}
          >
            {/* Logo Section */}
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Flex align="center" gap="md">
                <Box
                  style={{
                    position: 'relative',
                    width: isMobile ? 50 : 60,
                    height: isMobile ? 50 : 60,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: `2px solid ${PRIMARY_COLOR}`,
                    boxShadow: `0 4px 12px ${PRIMARY_COLOR}30`,
                  }}
                >
                  <Image
                    src="/logo.png"
                    alt="FindR Logo"
                    fill
                    style={{ 
                      objectFit: 'cover',
                      padding: 4,
                    }}
                    priority
                  />
                </Box>
                <Box>
                  <Text 
                    size={isMobile ? "lg" : "xl"} 
                    fw={900} 
                    style={{ 
                      color: PRIMARY_COLOR,
                      letterSpacing: '-0.5px',
                    }}
                  >
                    FindR
                  </Text>
                  <Text 
                    size="xs" 
                    c={PRIMARY_DARK} 
                    fw={600}
                    style={{ letterSpacing: '1px' }}
                  >
                    {t("title")}
                  </Text>
                </Box>
              </Flex>
            </Link>

            {/* Navigation */}
            <Flex align="center" gap="lg">
              <Button
                variant="light"
                color="blue"
                leftSection={<IconChevronRight size={16} />}
                component={Link}
                href="/reported-cases"
                size="sm"
              >
                {t("backToCases")}
              </Button>
              
              {/* User Profile */}
              {currentUser && (
                <Flex 
                  align="center" 
                  gap="sm" 
                  style={{ 
                    padding: '8px 16px',
                    background: LIGHT_BG,
                    borderRadius: '30px',
                  }}
                >
                  <Avatar
                    size="sm"
                    radius="xl"
                    src={currentUser?.avatar}
                    style={{ 
                      background: PRIMARY_GRADIENT,
                      border: `2px solid white`,
                    }}
                  >
                    {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                  </Avatar>
                  <Box>
                    <Text size="sm" fw={600} style={{ color: PRIMARY_DARK }}>
                      {currentUser?.firstName} {currentUser?.lastName}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {currentUser?.role}
                    </Text>
                  </Box>
                </Flex>
              )}
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container size="lg" py={isMobile ? 20 : 40}>
        {/* Page Header */}
        <Box mb={40}>
          <Flex justify="space-between" align="center" mb="md" wrap="wrap" gap="md">
            <Box>
              <Title order={1} style={{ color: PRIMARY_DARK, fontWeight: 800 }}>
                {t("title")}
              </Title>
              <Text c="dimmed" size="sm">
                {t("subtitle")}
              </Text>
            </Box>
            <Group gap="sm">
              <Select
                placeholder={t("timeRange")}
                value={timeRange}
                onChange={setTimeRange}
                data={[
                  { value: '7d', label: t("last7Days") },
                  { value: '30d', label: t("last30Days") },
                  { value: '90d', label: t("last90Days") },
                  { value: '1y', label: t("lastYear") },
                  { value: 'all', label: t("allTime") }
                ]}
                size="sm"
                radius="md"
                style={{ minWidth: 150 }}
              />
              <Button
                variant="light"
                color="blue"
                leftSection={<IconRefresh size={16} />}
                onClick={() => window.location.reload()}
                size="sm"
              >
                {t("refresh")}
              </Button>
              <Button
                color="blue"
                leftSection={<IconDownload size={16} />}
                onClick={() => setExportModalOpen(true)}
                size="sm"
                style={{
                  background: PRIMARY_GRADIENT,
                }}
              >
                {t("export")}
              </Button>
            </Group>
          </Flex>

          {/* Tabs */}
          <Tabs value={activeTab} onChange={setActiveTab} mb={40}>
            <Tabs.List grow={isMobile}>
              <Tabs.Tab 
                value="overview" 
                leftSection={<IconChartBar size={18} />}
                style={{
                  background: activeTab === 'overview' ? PRIMARY_GRADIENT : 'transparent',
                  color: activeTab === 'overview' ? 'white' : PRIMARY_COLOR,
                  fontWeight: activeTab === 'overview' ? 700 : 500,
                }}
              >
                {t("overview")}
              </Tabs.Tab>
              <Tabs.Tab 
                value="performance" 
                leftSection={<IconTrendingUp size={18} />}
                style={{
                  background: activeTab === 'performance' ? PRIMARY_GRADIENT : 'transparent',
                  color: activeTab === 'performance' ? 'white' : PRIMARY_COLOR,
                  fontWeight: activeTab === 'performance' ? 700 : 500,
                }}
              >
                {t("performance")}
              </Tabs.Tab>
              <Tabs.Tab 
                value="distribution" 
                leftSection={<IconChartPie size={18} />}
                style={{
                  background: activeTab === 'distribution' ? PRIMARY_GRADIENT : 'transparent',
                  color: activeTab === 'distribution' ? 'white' : PRIMARY_COLOR,
                  fontWeight: activeTab === 'distribution' ? 700 : 500,
                }}
              >
                {t("distribution")}
              </Tabs.Tab>
              <Tabs.Tab 
                value="community" 
                leftSection={<IconUsers size={18} />}
                style={{
                  background: activeTab === 'community' ? PRIMARY_GRADIENT : 'transparent',
                  color: activeTab === 'community' ? 'white' : PRIMARY_COLOR,
                  fontWeight: activeTab === 'community' ? 700 : 500,
                }}
              >
                {t("community")}
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </Box>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <Box>
            {/* Key Metrics Cards */}
            <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} spacing="md" mb={40}>
              <Card padding="lg" radius="lg" withBorder style={{ borderTop: `4px solid ${PRIMARY_COLOR}` }}>
                <Flex align="center" gap="md" mb="md">
                  <Box style={{ background: PRIMARY_GRADIENT, padding: 12, borderRadius: 12 }}>
                    <IconTarget size={24} color="white" />
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text size="sm" c="dimmed">{t("totalCases")}</Text>
                    <Title order={2} style={{ color: PRIMARY_DARK }}>{formatNumber(analyticsData.overview.totalCases)}</Title>
                  </Box>
                </Flex>
                <Flex align="center" gap={4}>
                  <IconTrendingUp size={16} color="#27ae60" />
                  <Text size="sm" c="dimmed">{t("casesGrowth")}</Text>
                </Flex>
              </Card>

              <Card padding="lg" radius="lg" withBorder style={{ borderTop: '4px solid #219653' }}>
                <Flex align="center" gap="md" mb="md">
                  <Box style={{ background: 'linear-gradient(135deg, #219653 0%, #27ae60 100%)', padding: 12, borderRadius: 12 }}>
                    <IconCheck size={24} color="white" />
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text size="sm" c="dimmed">{t("resolvedCases")}</Text>
                    <Title order={2} style={{ color: '#219653' }}>{formatNumber(analyticsData.overview.resolvedCases)}</Title>
                  </Box>
                </Flex>
                <Flex align="center" gap={4}>
                  <IconTrendingUp size={16} color="#27ae60" />
                  <Text size="sm" c="dimmed">{t("successRate", { rate: analyticsData.overview.successRate })}</Text>
                </Flex>
              </Card>

              <Card padding="lg" radius="lg" withBorder style={{ borderTop: '4px solid #f2c94c' }}>
                <Flex align="center" gap="md" mb="md">
                  <Box style={{ background: 'linear-gradient(135deg, #f2c94c 0%, #f2994a 100%)', padding: 12, borderRadius: 12 }}>
                    <IconClockHour4 size={24} color="white" />
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text size="sm" c="dimmed">{t("avgResolutionTime")}</Text>
                    <Title order={2} style={{ color: '#f2994a' }}>{t("avgResolutionTimeVal", { days: analyticsData.overview.avgResolutionTime })}</Title>
                  </Box>
                </Flex>
                <Flex align="center" gap={4}>
                  <IconTrendingDown size={16} color="#eb5757" />
                  <Text size="sm" c="dimmed">{t("avgResolutionGrowth")}</Text>
                </Flex>
              </Card>

              <Card padding="lg" radius="lg" withBorder style={{ borderTop: '4px solid #9b51e0' }}>
                <Flex align="center" gap="md" mb="md">
                  <Box style={{ background: 'linear-gradient(135deg, #9b51e0 0%, #bb6bd9 100%)', padding: 12, borderRadius: 12 }}>
                    <IconUsers size={24} color="white" />
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text size="sm" c="dimmed">{t("activeCases")}</Text>
                    <Title order={2} style={{ color: '#9b51e0' }}>{formatNumber(analyticsData.overview.activeCases)}</Title>
                  </Box>
                </Flex>
                <Flex align="center" gap={4}>
                  <IconTrendingUp size={16} color="#27ae60" />
                  <Text size="sm" c="dimmed">{t("activeCasesGrowth")}</Text>
                </Flex>
              </Card>
            </SimpleGrid>

            {/* Charts Row */}
            <Grid gutter="lg" mb={40}>
              <Grid.Col span={{ base: 12, lg: 6 }}>
                <Card padding="lg" radius="lg" withBorder h="100%">
                  <Flex justify="space-between" align="center" mb="lg">
                    <Box>
                      <Title order={3} size="h4" style={{ color: PRIMARY_DARK }}>{t("caseTypeDistribution")}</Title>
                      <Text size="sm" c="dimmed">{t("caseTypeDesc")}</Text>
                    </Box>
                    <Badge color="blue" variant="light">{t("currentMonth")}</Badge>
                  </Flex>
                  
                  <SimpleGrid cols={2} spacing="lg">
                    {analyticsData.overview.caseTypes.map((item, index) => (
                      <Box key={index}>
                        <Flex justify="space-between" align="center" mb="xs">
                          <Text fw={600} style={{ color: PRIMARY_DARK }}>{item.type === 'Person' ? t("tablePersonCases") : t("tableVehicleCases")}</Text>
                          <Text fw={700}>{item.count} ({item.percentage}%)</Text>
                        </Flex>
                        <Progress 
                          value={item.percentage} 
                          color={index === 0 ? PRIMARY_COLOR : '#219653'}
                          radius="xl"
                          size="lg"
                          animated
                        />
                      </Box>
                    ))}
                  </SimpleGrid>

                  <Divider my="lg" />
                  
                  <SimpleGrid cols={2} spacing="md">
                    <Box>
                      <Text size="sm" c="dimmed" mb={4}>{t("totalPersons")}</Text>
                      <Flex align="center" gap="xs">
                        <IconUser size={16} color={PRIMARY_COLOR} />
                        <Text fw={700} size="lg">{formatNumber(analyticsData.overview.caseTypes[0].count)}</Text>
                      </Flex>
                    </Box>
                    <Box>
                      <Text size="sm" c="dimmed" mb={4}>{t("totalVehicles")}</Text>
                      <Flex align="center" gap="xs">
                        <IconCar size={16} color="#219653" />
                        <Text fw={700} size="lg">{formatNumber(analyticsData.overview.caseTypes[1].count)}</Text>
                      </Flex>
                    </Box>
                  </SimpleGrid>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, lg: 6 }}>
                <Card padding="lg" radius="lg" withBorder h="100%">
                  <Flex justify="space-between" align="center" mb="lg">
                    <Box>
                      <Title order={3} size="h4" style={{ color: PRIMARY_DARK }}>{t("topRegions")}</Title>
                      <Text size="sm" c="dimmed">{t("topRegionsDesc")}</Text>
                    </Box>
                    <Badge color="orange" variant="light">{t("hotspots")}</Badge>
                  </Flex>
                  
                  <Stack gap="md">
                    {analyticsData.overview.topRegions.map((region, index) => (
                      <Box key={index}>
                        <Flex justify="space-between" align="center" mb={4}>
                          <Group gap="sm">
                            <Box
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: CHART_COLORS[index % CHART_COLORS.length]
                              }}
                            />
                            <Text fw={600} style={{ color: PRIMARY_DARK }}>{region.name}</Text>
                          </Group>
                          <Group gap="xs">
                            <Text fw={700}>{t("casesCount", { count: region.count })}</Text>
                            <Badge 
                              color={region.change.startsWith('+') ? 'green' : 'red'} 
                              variant="light" 
                              size="sm"
                            >
                              {region.change}
                            </Badge>
                          </Group>
                        </Flex>
                        <Progress 
                          value={calculatePercentage(region.count, analyticsData.overview.totalCases)} 
                          color={CHART_COLORS[index % CHART_COLORS.length]}
                          radius="xl"
                          size="sm"
                        />
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>

            {/* Recent Activity */}
            <Card padding="lg" radius="lg" withBorder>
              <Flex justify="space-between" align="center" mb="lg">
                <Box>
                  <Title order={3} size="h4" style={{ color: PRIMARY_DARK }}>{t("recentActivity")}</Title>
                  <Text size="sm" c="dimmed">{t("recentActivityDesc")}</Text>
                </Box>
                <Button
                  variant="light"
                  color="blue"
                  size="sm"
                  leftSection={<IconExternalLink size={14} />}
                >
                  {t("viewAll")}
                </Button>
              </Flex>
              
              <Stack gap="md">
                {analyticsData.recentActivity.map((activity) => (
                  <Paper
                    key={activity.id}
                    p="md"
                    radius="md"
                    withBorder
                    style={{
                      borderLeft: `4px solid ${activity.type.includes('Resolved') ? '#219653' : activity.type.includes('Alert') ? '#f2c94c' : PRIMARY_COLOR}`,
                      transition: 'all 0.3s ease',
                      ':hover': {
                        transform: 'translateX(5px)',
                        boxShadow: `0 8px 20px ${PRIMARY_COLOR}15`,
                      }
                    }}
                  >
                    <Flex align="center" gap="md">
                      <Box
                        style={{
                          background: activity.type.includes('Resolved') ? '#d4edda' : activity.type.includes('Alert') ? '#fff3cd' : LIGHT_BG,
                          padding: 10,
                          borderRadius: 10,
                          color: activity.type.includes('Resolved') ? '#219653' : activity.type.includes('Alert') ? '#f2c94c' : PRIMARY_COLOR,
                        }}
                      >
                        {activity.icon}
                      </Box>
                      <Box style={{ flex: 1 }}>
                        <Flex justify="space-between" align="center" mb={2}>
                          <Text fw={600} style={{ color: PRIMARY_DARK }}>{activity.type}</Text>
                          <Text size="sm" c="dimmed">{activity.time}</Text>
                        </Flex>
                        <Text size="sm" c="dimmed">
                          {activity.caseId && (
                            <Text span fw={600} style={{ color: PRIMARY_DARK }} mr={4}>
                              {activity.caseId}
                            </Text>
                          )}
                          {activity.description}
                        </Text>
                      </Box>
                    </Flex>
                  </Paper>
                ))}
              </Stack>
            </Card>
          </Box>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <Box>
            {/* Performance Metrics */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb={40}>
              <Card padding="lg" radius="lg" withBorder>
                <Flex direction="column" align="center" gap="md">
                  <Box
                    style={{
                      position: 'relative',
                      width: 100,
                      height: 100,
                    }}
                  >
                    <Progress
                      value={analyticsData.performance.resolutionRate}
                      color="green"
                      size={100}
                      thickness={8}
                      variant="gradient"
                      gradient={{ from: '#219653', to: '#27ae60' }}
                      style={{ transform: 'rotate(-90deg)' }}
                    />
                    <Center style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                      <Box ta="center">
                        <Text fw={900} size="xl" style={{ color: '#219653' }}>
                          {analyticsData.performance.resolutionRate}%
                        </Text>
                        <Text size="xs" c="dimmed">{t("resolutionRate")}</Text>
                      </Box>
                    </Center>
                  </Box>
                  <Text size="sm" ta="center" c="dimmed">{t("casesSuccessfullyResolved")}</Text>
                </Flex>
              </Card>

              <Card padding="lg" radius="lg" withBorder>
                <Flex direction="column" align="center" gap="md">
                  <Box
                    style={{
                      position: 'relative',
                      width: 100,
                      height: 100,
                    }}
                  >
                    <Progress
                      value={analyticsData.performance.userSatisfaction * 20} // Convert 1-5 scale to percentage
                      color="yellow"
                      size={100}
                      thickness={8}
                      variant="gradient"
                      gradient={{ from: '#f2c94c', to: '#f2994a' }}
                      style={{ transform: 'rotate(-90deg)' }}
                    />
                    <Center style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                      <Box ta="center">
                        <Text fw={900} size="xl" style={{ color: '#f2994a' }}>
                          {analyticsData.performance.userSatisfaction}/5
                        </Text>
                        <Text size="xs" c="dimmed">{t("userSatisfaction")}</Text>
                      </Box>
                    </Center>
                  </Box>
                  <Text size="sm" ta="center" c="dimmed">{t("avgUserRating")}</Text>
                </Flex>
              </Card>

              <Card padding="lg" radius="lg" withBorder>
                <Flex direction="column" align="center" gap="md">
                  <Box
                    style={{
                      background: PRIMARY_GRADIENT,
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconClockHour4 size={48} color="white" />
                  </Box>
                  <Box ta="center">
                    <Text fw={900} size="xl" style={{ color: PRIMARY_DARK }}>
                      {analyticsData.performance.avgResponseTime}h
                    </Text>
                    <Text size="sm" c="dimmed">{t("avgResponseTime")}</Text>
                  </Box>
                  <Text size="xs" ta="center" c="dimmed">{t("timeToFirstResponse")}</Text>
                </Flex>
              </Card>

              <Card padding="lg" radius="lg" withBorder>
                <Flex direction="column" align="center" gap="md">
                  <Box
                    style={{
                      position: 'relative',
                      width: 100,
                      height: 100,
                    }}
                  >
                    <Progress
                      value={analyticsData.performance.efficiencyScore}
                      color="blue"
                      size={100}
                      thickness={8}
                      variant="gradient"
                      gradient={{ from: PRIMARY_COLOR, to: PRIMARY_LIGHT }}
                      style={{ transform: 'rotate(-90deg)' }}
                    />
                    <Center style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                      <Box ta="center">
                        <Text fw={900} size="xl" style={{ color: PRIMARY_COLOR }}>
                          {analyticsData.performance.efficiencyScore}%
                        </Text>
                        <Text size="xs" c="dimmed">{t("efficiencyScore")}</Text>
                      </Box>
                    </Center>
                  </Box>
                  <Text size="sm" ta="center" c="dimmed">{t("overallSystemEfficiency")}</Text>
                </Flex>
              </Card>
            </SimpleGrid>

            {/* Trend Chart */}
            <Card padding="lg" radius="lg" withBorder mb={40}>
              <Flex justify="space-between" align="center" mb="lg">
                <Box>
                  <Title order={3} size="h4" style={{ color: PRIMARY_DARK }}>{t("monthlyTrends")}</Title>
                  <Text size="sm" c="dimmed">{t("casesReportedVsResolved")}</Text>
                </Box>
                <Group gap="sm">
                  <Badge color="blue" variant="light" leftSection={<IconTrendingUp size={12} />}>
                    {t("growthTrend")}
                  </Badge>
                  <Badge color="green" variant="light" leftSection={<IconCheck size={12} />}>
                    {t("improving")}
                  </Badge>
                </Group>
              </Flex>

              {/* Simplified trend visualization */}
              <Box style={{ height: 300, position: 'relative' }}>
                <Flex justify="space-between" align="flex-end" style={{ height: '100%', padding: '20px 0' }}>
                  {analyticsData.performance.trends.map((month, index) => (
                    <Box key={index} style={{ flex: 1, textAlign: 'center' }}>
                      <Flex direction="column" align="center" gap={4}>
                        <Flex align="flex-end" gap={2} style={{ height: 150 }}>
                          {/* Cases reported bar */}
                          <Box
                            style={{
                              width: 12,
                              height: (month.cases / 80) * 150, // Scale to max 80 cases
                              background: PRIMARY_GRADIENT,
                              borderRadius: '4px 4px 0 0',
                              opacity: 0.8,
                            }}
                          />
                          {/* Cases resolved bar */}
                          <Box
                            style={{
                              width: 12,
                              height: (month.resolved / 80) * 150,
                              background: 'linear-gradient(135deg, #219653 0%, #27ae60 100%)',
                              borderRadius: '4px 4px 0 0',
                            }}
                          />
                        </Flex>
                        <Text size="xs" fw={600} style={{ color: PRIMARY_DARK }}>{month.month}</Text>
                        <Text size="xs" c="dimmed">{t("casesCount", { count: month.cases })}</Text>
                      </Flex>
                    </Box>
                  ))}
                </Flex>
                
                {/* Legend */}
                <Flex gap="lg" justify="center" mt="xl">
                  <Flex align="center" gap="xs">
                    <Box style={{ width: 12, height: 12, background: PRIMARY_GRADIENT, borderRadius: 2 }} />
                    <Text size="sm">{t("casesReported")}</Text>
                  </Flex>
                  <Flex align="center" gap="xs">
                    <Box style={{ width: 12, height: 12, background: 'linear-gradient(135deg, #219653 0%, #27ae60 100%)', borderRadius: 2 }} />
                    <Text size="sm">{t("casesResolved")}</Text>
                  </Flex>
                </Flex>
              </Box>
            </Card>

            {/* Performance Insights */}
            <Card padding="lg" radius="lg" withBorder>
              <Title order={3} size="h4" style={{ color: PRIMARY_DARK }} mb="lg">
                {t("performanceInsights")}
              </Title>
              
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                <Paper p="md" withBorder radius="md">
                  <Flex align="center" gap="md" mb="md">
                    <IconTrendingUp size={24} color="#219653" />
                    <Box>
                      <Text fw={600} style={{ color: PRIMARY_DARK }}>{t("positiveTrend")}</Text>
                      <Text size="sm" c="dimmed">{t("improving")}</Text>
                    </Box>
                  </Flex>
                  <Text size="sm">
                    {t("positiveTrendDesc")}
                  </Text>
                </Paper>

                <Paper p="md" withBorder radius="md">
                  <Flex align="center" gap="md" mb="md">
                    <IconClock size={24} color="#f2994a" />
                    <Box>
                      <Text fw={600} style={{ color: PRIMARY_DARK }}>{t("responseTime")}</Text>
                      <Text size="sm" c="dimmed">{t("timeToFirstResponse")}</Text>
                    </Box>
                  </Flex>
                  <Text size="sm">
                    {t("responseTimeDesc")}
                  </Text>
                </Paper>

                <Paper p="md" withBorder radius="md">
                  <Flex align="center" gap="md" mb="md">
                    <IconUsers size={24} color={PRIMARY_COLOR} />
                    <Box>
                      <Text fw={600} style={{ color: PRIMARY_DARK }}>{t("communityGrowth")}</Text>
                      <Text size="sm" c="dimmed">{t("community")}</Text>
                    </Box>
                  </Flex>
                  <Text size="sm">
                    {t("communityGrowthDesc")}
                  </Text>
                </Paper>

                <Paper p="md" withBorder radius="md">
                  <Flex align="center" gap="md" mb="md">
                    <IconMap size={24} color="#9b51e0" />
                    <Box>
                      <Text fw={600} style={{ color: PRIMARY_DARK }}>{t("regionalCoverage")}</Text>
                      <Text size="sm" c="dimmed">{t("tableRegion")}</Text>
                    </Box>
                  </Flex>
                  <Text size="sm">
                    {t("regionalCoverageDesc")}
                  </Text>
                </Paper>
              </SimpleGrid>
            </Card>
          </Box>
        )}

        {/* Distribution Tab */}
        {activeTab === 'distribution' && (
          <Box>
            {/* Distribution Charts */}
            <Grid gutter="lg" mb={40}>
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Card padding="lg" radius="lg" withBorder h="100%">
                  <Title order={3} size="h4" style={{ color: PRIMARY_DARK }} mb="lg">
                    {t("byStatus")}
                  </Title>
                  
                  <Stack gap="md">
                    {analyticsData.distribution.byStatus.map((item, index) => (
                      <Box key={index}>
                        <Flex justify="space-between" align="center" mb={4}>
                          <Group gap="xs">
                            <Box
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: item.color
                              }}
                            />
                            <Text fw={600} style={{ color: PRIMARY_DARK }}>{item.status === 'Active' ? t("activeCases") : item.status === 'Resolved' ? t("resolvedCases") : item.status}</Text>
                          </Group>
                          <Text fw={700}>{item.count}</Text>
                        </Flex>
                        <Progress 
                          value={calculatePercentage(item.count, analyticsData.overview.totalCases)} 
                          color={item.color}
                          radius="xl"
                          size="sm"
                        />
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Card padding="lg" radius="lg" withBorder h="100%">
                  <Title order={3} size="h4" style={{ color: PRIMARY_DARK }} mb="lg">
                    {t("byPriority")}
                  </Title>
                  
                  <Stack gap="md">
                    {analyticsData.distribution.byPriority.map((item, index) => (
                      <Box key={index}>
                        <Flex justify="space-between" align="center" mb={4}>
                          <Group gap="xs">
                            <Box
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: item.color
                              }}
                            />
                            <Text fw={600} style={{ color: PRIMARY_DARK }}>{item.priority}</Text>
                          </Group>
                          <Text fw={700}>{item.count}</Text>
                        </Flex>
                        <Progress 
                          value={calculatePercentage(item.count, analyticsData.overview.totalCases)} 
                          color={item.color}
                          radius="xl"
                          size="sm"
                        />
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Card padding="lg" radius="lg" withBorder h="100%">
                  <Title order={3} size="h4" style={{ color: PRIMARY_DARK }} mb="lg">
                    {t("byRegion")}
                  </Title>
                  
                  <Stack gap="md">
                    {analyticsData.distribution.byRegion.map((region, index) => (
                      <Box key={index}>
                        <Flex justify="space-between" align="center" mb={4}>
                          <Group gap="xs">
                            <Box
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: CHART_COLORS[index % CHART_COLORS.length]
                              }}
                            />
                            <Text fw={600} style={{ color: PRIMARY_DARK }}>{region.region}</Text>
                          </Group>
                          <Group gap="xs">
                            <Text fw={700}>{region.count}</Text>
                            <Badge size="sm" variant="light">{region.percentage}%</Badge>
                          </Group>
                        </Flex>
                        <Progress 
                          value={region.percentage} 
                          color={CHART_COLORS[index % CHART_COLORS.length]}
                          radius="xl"
                          size="sm"
                        />
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>

            {/* Detailed Distribution Table */}
            <Card padding="lg" radius="lg" withBorder>
              <Flex justify="space-between" align="center" mb="lg">
                <Box>
                  <Title order={3} size="h4" style={{ color: PRIMARY_DARK }}>{t("detailedDistribution")}</Title>
                  <Text size="sm" c="dimmed">{t("detailedDistributionDesc")}</Text>
                </Box>
                <Select
                  placeholder={t("filterBy")}
                  data={['All Cases', 'Active Only', 'Resolved Only', 'High Priority']}
                  size="sm"
                  style={{ minWidth: 150 }}
                />
              </Flex>

              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t("tableRegion")}</Table.Th>
                    <Table.Th>{t("tablePersonCases")}</Table.Th>
                    <Table.Th>{t("tableVehicleCases")}</Table.Th>
                    <Table.Th>{t("tableTotal")}</Table.Th>
                    <Table.Th>{t("tableStatus")}</Table.Th>
                    <Table.Th>{t("tableSuccessRate")}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {analyticsData.distribution.byRegion.map((region, index) => {
                    const personCases = Math.round(region.count * 0.6);
                    const vehicleCases = region.count - personCases;
                    const successRate = 85 + Math.random() * 15;
                    
                    return (
                      <Table.Tr key={index}>
                        <Table.Td>
                          <Flex align="center" gap="xs">
                            <Box
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: CHART_COLORS[index % CHART_COLORS.length]
                              }}
                            />
                            <Text fw={600}>{region.region}</Text>
                          </Flex>
                        </Table.Td>
                        <Table.Td>{personCases}</Table.Td>
                        <Table.Td>{vehicleCases}</Table.Td>
                        <Table.Td>
                          <Text fw={700}>{region.count}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={region.percentage > 15 ? 'blue' : region.percentage > 10 ? 'green' : 'yellow'}
                            variant="light"
                          >
                            {region.percentage > 15 ? 'High Activity' : region.percentage > 10 ? 'Medium' : 'Low'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Flex align="center" gap="xs">
                            <Progress
                              value={successRate}
                              color={successRate > 90 ? 'green' : successRate > 80 ? 'blue' : 'yellow'}
                              size="sm"
                              style={{ flex: 1 }}
                            />
                            <Text fw={600} size="sm">{successRate.toFixed(1)}%</Text>
                          </Flex>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Card>
          </Box>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <Box>
            {/* Community Metrics */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" mb={40}>
              <Card padding="lg" radius="lg" withBorder>
                <Flex direction="column" align="center" gap="md">
                  <Box
                    style={{
                      background: PRIMARY_GRADIENT,
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconUsers size={36} color="white" />
                  </Box>
                  <Box ta="center">
                    <Title order={2} style={{ color: PRIMARY_DARK }}>1,245</Title>
                    <Text size="sm" c="dimmed">{t("activeVolunteers")}</Text>
                  </Box>
                  <Badge color="green" variant="light" leftSection={<IconTrendingUp size={12} />}>
                    {t("volunteersGrowth")}
                  </Badge>
                </Flex>
              </Card>

              <Card padding="lg" radius="lg" withBorder>
                <Flex direction="column" align="center" gap="md">
                  <Box
                    style={{
                      background: 'linear-gradient(135deg, #219653 0%, #27ae60 100%)',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconAward size={36} color="white" />
                  </Box>
                  <Box ta="center">
                    <Title order={2} style={{ color: '#219653' }}>289</Title>
                    <Text size="sm" c="dimmed">{t("successfulMatches")}</Text>
                  </Box>
                  <Badge color="blue" variant="light" leftSection={<IconCheck size={12} />}>
                    {t("successRate", { rate: "92" })}
                  </Badge>
                </Flex>
              </Card>

              <Card padding="lg" radius="lg" withBorder>
                <Flex direction="column" align="center" gap="md">
                  <Box
                    style={{
                      background: 'linear-gradient(135deg, #9b51e0 0%, #bb6bd9 100%)',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconMessageCircle size={36} color="white" />
                  </Box>
                  <Box ta="center">
                    <Title order={2} style={{ color: '#9b51e0' }}>5,678</Title>
                    <Text size="sm" c="dimmed">{t("communityMessages")}</Text>
                  </Box>
                  <Badge color="grape" variant="light" leftSection={<IconTrendingUp size={12} />}>
                    {t("messagesGrowth")}
                  </Badge>
                </Flex>
              </Card>
            </SimpleGrid>

            {/* Top Performers */}
            <Card padding="lg" radius="lg" withBorder mb={40}>
              <Flex justify="space-between" align="center" mb="lg">
                <Box>
                  <Title order={3} size="h4" style={{ color: PRIMARY_DARK }}>{t("topCommunityHelpers")}</Title>
                  <Text size="sm" c="dimmed">{t("topCommunityHelpersDesc")}</Text>
                </Box>
                <Button
                  variant="light"
                  color="blue"
                  size="sm"
                  leftSection={<IconAward size={14} />}
                >
                  {t("viewRankings")}
                </Button>
              </Flex>

              <Stack gap="md">
                {analyticsData.topPerformers.map((performer, index) => (
                  <Paper
                    key={performer.id}
                    p="md"
                    radius="md"
                    withBorder
                    style={{
                      background: index === 0 ? `${PRIMARY_COLOR}08` : 'white',
                      borderLeft: index === 0 ? `4px solid gold` : `4px solid ${PRIMARY_COLOR}`,
                    }}
                  >
                    <Flex align="center" gap="md">
                      <Flex align="center" gap="sm" style={{ flex: 1 }}>
                        <Badge
                          color={index === 0 ? 'yellow' : index === 1 ? 'gray' : index === 2 ? 'orange' : 'blue'}
                          variant="light"
                          size="lg"
                          style={{ minWidth: 30 }}
                        >
                          #{index + 1}
                        </Badge>
                        <Avatar
                          size="md"
                          radius="xl"
                          src={performer.avatar}
                          style={{ 
                            background: PRIMARY_GRADIENT,
                            border: `2px solid ${index === 0 ? 'gold' : 'white'}`,
                          }}
                        >
                          {performer.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box style={{ flex: 1 }}>
                          <Text fw={700} style={{ color: PRIMARY_DARK }}>{performer.name}</Text>
                          <Text size="sm" c="dimmed">{performer.role}</Text>
                        </Box>
                      </Flex>
                      <Flex gap="lg" align="center">
                        <Box ta="center">
                          <Text fw={900} size="xl" style={{ color: PRIMARY_DARK }}>
                            {performer.casesHelped}
                          </Text>
                          <Text size="xs" c="dimmed">{t("casesHelped")}</Text>
                        </Box>
                        <Box ta="center">
                          <Text fw={900} size="xl" style={{ color: '#219653' }}>
                            {performer.successRate}
                          </Text>
                          <Text size="xs" c="dimmed">{t("tableSuccessRate")}</Text>
                        </Box>
                        <Button
                          variant="light"
                          color="blue"
                          size="xs"
                          leftSection={<IconMessageCircle size={12} />}
                        >
                          {t("contact")}
                        </Button>
                      </Flex>
                    </Flex>
                  </Paper>
                ))}
              </Stack>
            </Card>

            {/* Community Activity */}
            <Card padding="lg" radius="lg" withBorder>
              <Title order={3} size="h4" style={{ color: PRIMARY_DARK }} mb="lg">
                {t("communityActivityMap")}
              </Title>

              <Box
                style={{
                  height: 300,
                  background: `linear-gradient(135deg, ${LIGHT_BG} 0%, #e6f0ff 100%)`,
                  borderRadius: '12px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Simplified map visualization */}
                <Box style={{ position: 'relative', width: '100%', height: '100%' }}>
                  {/* This would be replaced with an actual map component */}
                  <Center style={{ height: '100%' }}>
                    <Flex direction="column" align="center" gap="md">
                      <IconMap size={64} color={PRIMARY_COLOR} opacity={0.5} />
                      <Text style={{ color: PRIMARY_DARK, fontWeight: 600 }}>{t("communityActivityMap")}</Text>
                      <Text size="sm" c="dimmed" ta="center">
                        {t("communityActivityMapDesc")}
                      </Text>
                      <Button
                        variant="light"
                        color="blue"
                        leftSection={<IconExternalLink size={14} />}
                      >
                        {t("openInteractiveMap")}
                      </Button>
                    </Flex>
                  </Center>
                  
                  {/* Map markers would go here */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Box
                      key={i}
                      style={{
                        position: 'absolute',
                        left: `${20 + i * 15}%`,
                        top: `${30 + i * 10}%`,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: i % 2 === 0 ? PRIMARY_COLOR : '#219653',
                        border: '2px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        animation: 'pulse 2s infinite',
                      }}
                    />
                  ))}
                </Box>
              </Box>
              
              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mt="lg">
                <Box ta="center">
                  <Text fw={700} size="lg" style={{ color: PRIMARY_DARK }}>12</Text>
                  <Text size="sm" c="dimmed">{t("activeNow")}</Text>
                </Box>
                <Box ta="center">
                  <Text fw={700} size="lg" style={{ color: PRIMARY_DARK }}>89</Text>
                  <Text size="sm" c="dimmed">{t("onlineToday")}</Text>
                </Box>
                <Box ta="center">
                  <Text fw={700} size="lg" style={{ color: PRIMARY_DARK }}>24</Text>
                  <Text size="sm" c="dimmed">{t("newThisWeek")}</Text>
                </Box>
                <Box ta="center">
                  <Text fw={700} size="lg" style={{ color: PRIMARY_DARK }}>1,245</Text>
                  <Text size="sm" c="dimmed">{t("totalVolunteers")}</Text>
                </Box>
              </SimpleGrid>
            </Card>
          </Box>
        )}

        {/* Quick Stats Footer */}
        <Card padding="lg" radius="lg" withBorder mt={40} style={{ background: CARD_BG }}>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            <Box>
              <Text size="xs" c="dimmed" mb={2}>{t("dataUpdated")}</Text>
              <Text fw={700} style={{ color: PRIMARY_DARK }}>
                {new Date().toLocaleDateString()}
              </Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed" mb={2}>{t("processingTime")}</Text>
              <Text fw={700} style={{ color: PRIMARY_DARK }}>{t("realTime")}</Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed" mb={2}>{t("dataAccuracy")}</Text>
              <Text fw={700} style={{ color: PRIMARY_DARK }}>99.8%</Text>
            </Box>
            <Box>
              <Text size="xs" c="dimmed" mb={2}>{t("reportGenerated")}</Text>
              <Text fw={700} style={{ color: PRIMARY_DARK }}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Box>
          </SimpleGrid>
        </Card>
      </Container>

      {/* Export Modal */}
      <Modal
        opened={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title={t("exportAnalyticsData")}
        radius="lg"
        centered
        size="md"
      >
        <Stack gap="lg">
          <Text>{t("exportModalDesc")}</Text>
          
          <Select
            label={t("exportFormat")}
            placeholder={t("selectFormat")}
            data={[
              { value: 'csv', label: 'CSV (Excel compatible)' },
              { value: 'pdf', label: 'PDF Report' },
              { value: 'json', label: 'JSON Data' }
            ]}
            defaultValue="csv"
          />
          
          <Select
            label={t("timeRange")}
            placeholder={t("timeRange")}
            data={[
              { value: '7d', label: t("last7Days") },
              { value: '30d', label: t("last30Days") },
              { value: '90d', label: t("last90Days") },
              { value: '1y', label: t("lastYear") },
              { value: 'all', label: t("allTime") }
            ]}
            defaultValue={timeRange}
          />
          
          <Select
            label={t("dataType")}
            placeholder={t("selectDataType")}
            data={[
              { value: 'overview', label: t("overview") },
              { value: 'detailed', label: t("detailedDistribution") },
              { value: 'all', label: t("allTime") }
            ]}
            defaultValue="overview"
          />
          
          <Flex gap="sm" justify="flex-end" mt="md">
            <Button
              variant="light"
              color="gray"
              onClick={() => setExportModalOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              color="blue"
              leftSection={<IconDownload size={16} />}
              onClick={() => handleExportData('csv')}
              style={{ background: PRIMARY_GRADIENT }}
            >
              {t("exportNow")}
            </Button>
          </Flex>
        </Stack>
      </Modal>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        
        .analytics-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .analytics-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 52, 209, 0.15);
        }
        
        .metric-badge {
          background: ${PRIMARY_COLOR}15;
          color: ${PRIMARY_COLOR};
          border: 1px solid ${PRIMARY_COLOR}30;
        }
        
        .trend-up {
          color: #27ae60;
        }
        
        .trend-down {
          color: #eb5757;
        }
        
        /* Print styles for analytics */
        @media print {
          .no-print {
            display: none !important;
          }
          
          .print-full {
            width: 100% !important;
            max-width: 100% !important;
          }
          
          .analytics-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <MainFooter />
    </Box>
  );
}