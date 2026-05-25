"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Container,
  Title,
  Text,
  Group,
  Button,
  Paper,
  Stack,
  Avatar,
  Badge,
  SimpleGrid,
  ActionIcon,
  ScrollArea,
  Table,
  Grid,
  Loader,
  Card,
  Divider,
  Pagination,
  TextInput,
  Menu,
  UnstyledButton,
  useMantineTheme,
  useMantineColorScheme,
  Modal,
  Textarea,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconMapPin,
  IconCalendar,
  IconArrowLeft,
  IconDownload,
  IconFilter,
  IconTable,
  IconMap,
  IconMapPinFilled,
  IconCar,
  IconCamera,
  IconClock,
  IconEye,
  IconShield,
  IconCheck,
  IconStar,
  IconChevronRight,
  IconSearch,
  IconHome,
  IconUser,
  IconBell,
  IconShieldCheck,
  IconHistory,
  IconSettings,
  IconLogout,
  IconBike,
  IconTruck,
  IconBattery,
  IconRefresh,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import Image from "next/image";
import MainFooter from "../../../../components/MainFooter";
import { apiClient } from "../../../../lib/apiClient";
import DashboardHeader from "../../../dashboard/DashboardHeader";
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

// ---------- API Configuration ----------
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
const MISSING_VEHICLES_API = `${API_BASE_URL}/missing-vehicles`;
const MISSING_PERSONS_API = `${API_BASE_URL}/missing-persons`;
const MY_SIGHTINGS_API = `${API_BASE_URL}/sightings/my-sightings`;

const extractData = (payload: any) => payload?.data ?? payload;
const extractArray = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

// ---------- Helper Functions ----------
const determineVehicleType = (vehicle: any) => {
  if (vehicle.type) return vehicle.type;
  if (vehicle.brand?.toLowerCase().includes('motor') || vehicle.model?.toLowerCase().includes('motor')) return 'motorcycle';
  if (vehicle.brand?.toLowerCase().includes('truck') || vehicle.model?.toLowerCase().includes('truck')) return 'truck';
  if (vehicle.technicalSpecs?.electric) return 'electric';
  return 'car';
};

const calculateDuration = (reportDate: any) => {
  if (!reportDate) return 'Unknown';
  const days = Math.floor((new Date().getTime() - new Date(reportDate).getTime()) / (1000 * 60 * 60 * 24));
  return `${days} day${days !== 1 ? 's' : ''}`;
};

const getImageUrl = (path: any) => {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const baseUrl = API_BASE_URL.replace("/api/v1", "");
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

const getVehicleIcon = (type: any, size = 24) => {
  switch (type) {
    case 'motorcycle': return <IconBike size={size} />;
    case 'truck': return <IconTruck size={size} />;
    case 'electric': return <IconBattery size={size} />;
    case 'person': return <IconUser size={size} />;
    default: return <IconCar size={size} />;
  }
};

// Transform a raw vehicle/person into the base alert object
const transformAlert = (item: any, type: any) => {
  return {
    id: item._id || item.id,
    code: item.caseId || `CASE-${item._id || item.id}`,
    brand: type === 'person'
      ? `${item.firstName || ''} ${item.middleName || ''} ${item.lastName || ''}`.trim()
      : `${item.brand || ''} ${item.model || ''} ${item.submodel || ''}`.trim(),
    type: type,
    status: item.status?.toLowerCase() || 'active',
    location: item.lastSeenLocation || item.location || 'Unknown',
    date: item.lastSeenDate ? new Date(item.lastSeenDate).toLocaleDateString() : 
           item.reportDate ? new Date(item.reportDate).toLocaleDateString() : 'Unknown',
    startTime: item.lastSeenTime || item.reportTime || 'Unknown',
    description: item.vehicleDescription || item.description || 'No description provided',
    lastSeen: item.lastSeenLocation || 'Unknown',
    mapLocation: item.lastSeenLocation || 'Unknown',
    reportDate: item.reportDate,
    duration: calculateDuration(item.reportDate),
    // Detection history will be populated separately from sightings
    detectionHistory: [],
    cctvInfo: item.cctvInfo || { confidence: 'N/A' },
    title: type === 'person' ? 'Missing Person Alert' : 'Missing Vehicle Alert',
    imageUrl: type === 'person' 
      ? getImageUrl(item.images?.[0]) || "/default-person.jpg"
      : getImageUrl(item.imagePreview) || "/default-car.jpg",
  };
};

const getBg = (colorScheme: any, light: any, dark: any) => (colorScheme === 'dark' ? dark : light);
const getTextColor = (colorScheme: any, light: any, dark: any) => (colorScheme === 'dark' ? dark : light);

export default function AlertDetailPage() {
  const router = useRouter();
  const params = useParams();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [alertData, setAlertData] = useState<any>(null);
  const [detectionHistory, setDetectionHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [activePage, setActivePage] = useState(1);
  const [selectedDetection, setSelectedDetection] = useState<any>(null);
  const mapRef = useRef<any>(null);
  const leafletMap = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const itemsPerPage = 10;

  // Current user state for logging
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Analysis statistics
  const [confirmedSightings, setConfirmedSightings] = useState<number>(0);
  const [confirmedSightingIds, setConfirmedSightingIds] = useState<Set<string>>(new Set());

  // Confirmation modal state
  const [foundModalOpen, setFoundModalOpen] = useState(false);
  const [foundNotes, setFoundNotes] = useState("");
  const [submittingFound, setSubmittingFound] = useState(false);

  // Dynamic colors
  const mainBg = getBg(colorScheme, 'white', theme.colors.dark[7]);
  const headerBg = getBg(colorScheme, 'white', theme.colors.dark[6]);
  const borderColor = getBg(colorScheme, '#E9ECEF', theme.colors.dark[5]);
  const paperBg = getBg(colorScheme, 'white', theme.colors.dark[6]);
  const lightBlueBg = getBg(colorScheme, '#f0f9ff', theme.colors.blue[9] + '40');
  const mapBorder = getBg(colorScheme, '#bfdbfe', theme.colors.blue[8]);
  const tableHeaderBg = getBg(colorScheme, '#dbeafe', theme.colors.blue[9]);
  const tableHeaderText = getBg(colorScheme, '#1e40af', theme.colors.blue[2]);
  const paginationBg = getBg(colorScheme, '#dbeafe', theme.colors.blue[9]);
  const paginationText = getBg(colorScheme, '#1e40af', theme.colors.blue[2]);
  const backButtonBg = '#399afc';
  const selectedRowBg = getBg(colorScheme, '#f0f9ff', theme.colors.blue[9] + '30');
  const selectedRowBorder = '#3b82f6';

  // Load current user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (e) { /* ignore */ }
    }
  }, []);

  // Load confirmed sighting IDs from localStorage (for immediate UI feedback)
  useEffect(() => {
    const confirmedIdsData = JSON.parse(localStorage.getItem('confirmedSightingIds') || '[]');
    setConfirmedSightingIds(new Set(confirmedIdsData));
  }, [params?.id]);

  // Calculate confirmed sightings from database data
  useEffect(() => {
    if (detectionHistory.length > 0) {
      const confirmedCount = detectionHistory.filter(d => d.status === 'confirmed').length;
      console.log('Detection history:', detectionHistory.map(d => ({ id: d.id, status: d.status })));
      console.log('Confirmed count:', confirmedCount);
      setConfirmedSightings(confirmedCount);
    }
  }, [detectionHistory]);

  // Logging function
  const createActionLog = async (action: any, details: any = {}) => {
    try {
      if (!currentUser) return;
      let ip = 'unknown';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        ip = ipData.ip;
      } catch (e) { /* ignore */ }

      const logEntry = {
        userId: currentUser.id,
        userEmail: currentUser.email,
        action,
        ...details,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        ipAddress: ip,
      };

      // Logging is currently disabled for JSON Server cleanup.
      // Add a backend logging endpoint later if needed.
    } catch (error) {
      console.error('Logging failed:', error);
      // Non-blocking
    }
  };

  // Logout handler
  const handleLogout = () => {
    createActionLog('logout', { fromPage: 'alert_detail' });
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    router.push('/');
  };

  // Refresh sightings data
  const handleRefreshSightings = async () => {
    try {
      setLoading(true);
      setError(null);

      const alertId = params?.id;
      if (!alertId) throw new Error('No alert ID provided');

      // Fetch sightings linked to this alert
      let sightingsUrl = `${MY_SIGHTINGS_API}?caseId=${alertId}`;
      let sightingsRes = await apiClient(sightingsUrl);
      let sightings = [];
      if (sightingsRes.ok) {
        sightings = extractArray(await sightingsRes.json());
        console.log('Sightings from API:', sightings.map(s => ({ id: s._id || s.id, status: s.status })));
      }

      // Transform sightings into detection objects
      const detections = sightings.map((s: any, idx: number) => ({
        id: s._id || s.id,
        name: s.type === 'Person' ? s.name : s.plateNumber || `Sighting ${idx + 1}`,
        location: s.location?.address || s.location || 'Unknown',
        date: s.date ? new Date(s.date).toLocaleDateString() : (s.reportedAt ? new Date(s.reportedAt).toLocaleDateString() : 'Unknown'),
        time: s.time || (s.reportedAt ? new Date(s.reportedAt).toLocaleTimeString() : '00:00'),
        accuracy: (s.type === 'person' || s.type === 'Person') ? null : (s.confidence || '85%'),
        type: (s.type === 'person' || s.type === 'Person') ? 'Person' : 'CCTV',
        status: s.status || 'active',
        startDate: s.date || s.reportedAt,
        startTime: s.time || (s.reportedAt ? new Date(s.reportedAt).toLocaleTimeString() : '00:00'),
        lat: s.latitude || (s.location?.coordinates ? s.location.coordinates[1] : null) || 9.03 + (Math.random() - 0.5) * 0.1,
        lng: s.longitude || (s.location?.coordinates ? s.location.coordinates[0] : null) || 38.74 + (Math.random() - 0.5) * 0.1,
      }));

      console.log('Transformed detections:', detections.map(d => ({ id: d.id, status: d.status })));
      setDetectionHistory(detections);
      setLoading(false);
      notifications.show({
        title: 'Sightings Refreshed',
        message: 'Sighting data has been updated',
        color: 'green',
      });
    } catch (err: any) {
      console.error('Error refreshing sightings:', err);
      setError(err.message || 'Failed to refresh sightings');
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAlertAndSightings = async () => {
      try {
        setLoading(true);
        setError(null);

        const alertId = params?.id;
        if (!alertId) throw new Error('No alert ID provided');

        // 1. Fetch the main alert (vehicle or person)
        let alert = null;
        let response = await apiClient(`${MISSING_VEHICLES_API}/${alertId}`);
        if (response.ok) {
          const vehiclePayload = await response.json();
          const vehicle = extractData(vehiclePayload)?.vehicle || extractData(vehiclePayload);
          alert = transformAlert(vehicle, determineVehicleType(vehicle));
        } else {
          response = await apiClient(`${MISSING_PERSONS_API}/${alertId}`);
          if (response.ok) {
            const personPayload = await response.json();
            const person = extractData(personPayload)?.person || extractData(personPayload);
            alert = transformAlert(person, 'person');
          } else {
            throw new Error('Alert not found');
          }
        }

        // 2. Fetch sightings linked to this alert
        // Use the new MY_SIGHTINGS_API which users have access to, and filter by caseId
        let sightingsUrl = `${MY_SIGHTINGS_API}?caseId=${alert.id}`;
        let sightingsRes = await apiClient(sightingsUrl);
        let sightings = [];
        if (sightingsRes.ok) {
          sightings = extractArray(await sightingsRes.json());
        }

        // 3. Transform sightings into detection objects
        const detections = sightings.map((s: any, idx: number) => ({
          id: s._id || s.id,
          name: s.type === 'Person' ? s.name : s.plateNumber || `Sighting ${idx + 1}`,
          location: s.location?.address || s.location || 'Unknown',
          date: s.date ? new Date(s.date).toLocaleDateString() : (s.reportedAt ? new Date(s.reportedAt).toLocaleDateString() : 'Unknown'),
          time: s.time || (s.reportedAt ? new Date(s.reportedAt).toLocaleTimeString() : '00:00'),
          accuracy: (s.type === 'person' || s.type === 'Person') ? null : (s.confidence || '85%'),
          type: (s.type === 'person' || s.type === 'Person') ? 'Person' : 'CCTV',
          status: s.status || 'active',
          startDate: s.date || s.reportedAt,
          startTime: s.time || (s.reportedAt ? new Date(s.reportedAt).toLocaleTimeString() : '00:00'),
          lat: s.latitude || (s.location?.coordinates ? s.location.coordinates[1] : null) || 9.03 + (Math.random() - 0.5) * 0.1,
          lng: s.longitude || (s.location?.coordinates ? s.location.coordinates[0] : null) || 38.74 + (Math.random() - 0.5) * 0.1,
        }));

        setAlertData(alert);
        setDetectionHistory(detections);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching alert and sightings:', err);
        setError(err.message || 'Failed to load alert data');
        setLoading(false);
      }
    };

    fetchAlertAndSightings();
  }, [params?.id]);

  // Initialize Leaflet map when alertData or detectionHistory changes
  useEffect(() => {
    if (!mapRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      // Dynamically import Leaflet to prevent SSR "window is not defined" errors
      const L = (await import('leaflet')).default;
      
      // Fix Leaflet default icon paths dynamically using CDN to bypass Next.js Turbopack image loader issues
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!isMounted) return;

      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }

      const map = L.map(mapRef.current).setView([9.03, 38.74], 12);
      leafletMap.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      detectionHistory.forEach((detection) => {
        if (detection.lat && detection.lng) {
          const marker = L.marker([detection.lat, detection.lng])
            .bindPopup(`
              <b>${detection.name}</b><br>
              ${detection.location}<br>
              ${detection.date} ${detection.time}<br>
              ${detection.type !== 'Person' ? `Accuracy: ${detection.accuracy}` : `Type: Person`}
            `)
            .on('click', () => {
              setSelectedDetection(detection);
            });
          marker.addTo(map);
          markersRef.current.push(marker);
        }
      });

      if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current);
        const mapBounds = group.getBounds();
        map.fitBounds(mapBounds, { padding: [50, 50] });
        
        // Add user's current location if available
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLat = position.coords.latitude;
              const userLng = position.coords.longitude;
              
              // Add a distinct circle marker for the user
              L.circleMarker([userLat, userLng], {
                color: '#ffffff', // White border
                fillColor: '#2563eb', // Blue fill
                fillOpacity: 1,
                radius: 10,
                weight: 3
              }).addTo(map).bindPopup('<b>📍 Your Current Location</b>');
              
              // Adjust bounds to include both the user and all sightings
              mapBounds.extend([userLat, userLng]);
              map.fitBounds(mapBounds, { padding: [50, 50] });
            },
            (err) => {
              console.warn('Geolocation error:', err);
              notifications.show({
                title: 'Location Unavailable',
                message: 'Could not access your location. Please check your browser permissions.',
                color: 'orange',
              });
            }
          );
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [detectionHistory]);

  // Fly to selected detection when it changes
  useEffect(() => {
    if (leafletMap.current && selectedDetection && selectedDetection.lat && selectedDetection.lng) {
      leafletMap.current.flyTo([selectedDetection.lat, selectedDetection.lng], 15, {
        duration: 1.5
      });
      markersRef.current.forEach(marker => {
        const latLng = marker.getLatLng();
        if (latLng.lat === selectedDetection.lat && latLng.lng === selectedDetection.lng) {
          marker.openPopup();
        } else {
          marker.closePopup();
        }
      });
    }
  }, [selectedDetection]);

  if (loading) {
    return (
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: mainBg,
        }}
      >
        <Loader size="lg" />
      </Box>
    );
  }

  if (error || !alertData) {
    return (
      <Box style={{ padding: "40px", textAlign: "center", backgroundColor: mainBg }}>
        <Title order={2}>{error || 'Alert Not Found'}</Title>
        <Button onClick={() => router.push("/alert")} mt="md">
          Back to Alerts
        </Button>
      </Box>
    );
  }

  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedData = detectionHistory.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const totalPages = Math.ceil(detectionHistory.length / itemsPerPage);

  const handleDetectionClick = (detection: any) => {
    setSelectedDetection(detection);
    createActionLog('detection_selected', {
      detectionId: detection.id,
      detectionName: detection.name,
      alertId: alertData.id,
    });
  };

  const handleRowClick = (detection: any, e: any) => {
    if (!e.target.closest(".arrow-button")) {
      handleDetectionClick(detection);
    }
  };

  const handleArrowClick = (detection: any, e: any) => {
    e.stopPropagation();
    createActionLog('detection_detail_navigate', {
      detectionId: detection.id,
      alertId: alertData.id,
    });
    router.push(`/user/alert/alert-detail/${params.id}/detection/${detection.id}`);
  };

  const handleExportClick = () => {
    createActionLog('export_clicked', { alertId: alertData.id });
    // actual export logic here
  };

  const handleFilterClick = () => {
    createActionLog('filter_clicked', { alertId: alertData.id });
    // actual filter logic here
  };

  const handleDownloadReport = () => {
    createActionLog('download_report_clicked', { alertId: alertData.id });
    // actual download logic here
  };

  const handleFoundConfirm = async () => {
    if (!alertData?.id) return;
    setSubmittingFound(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
      const caseType = (alertData.type === 'person') ? 'person' : 'vehicle';
      const resolveUrl = caseType === 'person'
        ? `${API_BASE}/missing-persons/${alertData.id}/resolve`
        : `${API_BASE}/missing-vehicles/${alertData.id}/resolve`;

      // 1. Mark case as Resolved via user-accessible endpoint
      await apiClient(resolveUrl, { method: 'PATCH' });

      // 2. Notify all admins
      await apiClient(`${API_BASE}/notifications/send-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `✅ ${caseType === 'person' ? 'Missing Person' : 'Missing Vehicle'} Found!`,
          message: `The reporter has confirmed that "${alertData.brand}" (Case: ${alertData.code}) has been found.${foundNotes ? ` Notes: ${foundNotes}` : ''}`,
          type: 'success',
        }),
      });

      setFoundModalOpen(false);
      notifications.show({
        title: '🎉 Great news!',
        message: 'The case has been marked as resolved. Thank you for letting us know!',
        color: 'green',
      });

      // 3. Redirect to feedback page
      router.push('/user/feedback');
    } catch (err: any) {
      console.error(err);
      notifications.show({
        title: 'Error',
        message: 'Could not mark as resolved. Please try again.',
        color: 'red',
      });
    } finally {
      setSubmittingFound(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        backgroundColor: mainBg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Reusable Unified Header ── */}
      <DashboardHeader />

      {/* Back to Alerts Section */}
      <Box style={{ padding: "24px 16px 16px 16px" }}>
        <Container fluid px="md">
          <Group>
            <Button
              variant="subtle"
              color="white"
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => router.push("/user/alert")}
              size="md"
              style={{ backgroundColor: backButtonBg, padding: "10px" }}
            />
            <Box style={{ marginLeft: "16px" }}>
              <Text fw={800} size="xl" style={{ color: getTextColor(colorScheme, '#212529', theme.colors.gray[3]) }}>
                Alert Detail
              </Text>
              <Text size="sm" c="dimmed">
                ID: {alertData.code} • {alertData.brand} • {alertData.location}
              </Text>
            </Box>
          </Group>
        </Container>
      </Box>

      {/* Main Content */}
      <Box px="md" py={40} style={{ flex: 1 }}>
        {/* Alert Header */}
        <Paper p="xl" mb="xl" withBorder radius="md" bg={paperBg}>
          <Group justify="space-between" mb="md" wrap="wrap">
            <Group gap="xl">
              <Avatar 
                src={alertData.imageUrl} 
                size={120} 
                radius="md" 
                style={{ border: `2px solid ${borderColor}` }}
              />
              <Box>
                <Title order={2} mb="xs">
                  {alertData.title || alertData.brand}
                </Title>
              <Group gap="lg" wrap="wrap">
                <Badge size="lg" color={alertData.status === "active" ? "red" : "green"}>
                  {alertData.status.toUpperCase()}
                </Badge>
                <Group gap="xs">
                  <IconMapPin size={16} />
                  <Text>{alertData.location}</Text>
                </Group>
                <Group gap="xs">
                  <IconCalendar size={16} />
                  <Text>{alertData.date} • {alertData.startTime}</Text>
                </Group>
                <Group gap="xs">
                  <IconCar size={16} />
                  <Text>{alertData.type}</Text>
                </Group>
              </Group>
            </Box>
          </Group>
          <Group>
              {/* ========== CHANGED to custom handler ========== */}
              <Button 
                leftSection={<IconDownload size={18} />} 
                variant="light" 
                size="sm" 
                visibleFrom="xs"
                onClick={handleExportClick}
              >
                Export
              </Button>
              {/* ========== CHANGED to custom handler ========== */}
              <Button 
                leftSection={<IconFilter size={18} />} 
                variant="light" 
                size="sm" 
                visibleFrom="xs"
                onClick={handleFilterClick}
              >
                Filter
              </Button>
            </Group>
          </Group>
          <Text size="lg" c="dimmed">
            {alertData.description}
          </Text>
        </Paper>

        {/* Stats Grid */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} mb="xl">
          <Paper p="md" withBorder radius="md" ta="center">
            <Group justify="center" mb="xs">
              <IconEye size={20} />
              <Text size="sm" c="dimmed">Total Sightings</Text>
            </Group>
            <Title order={2}>{detectionHistory.length || 0}</Title>
          </Paper>
          <Paper p="md" withBorder radius="md" ta="center">
            <Group justify="center" mb="xs">
              <IconCheck size={20} />
              <Text size="sm" c="dimmed">Confirmed Sightings</Text>
            </Group>
            <Title order={2}>{confirmedSightings || 0}</Title>
          </Paper>
          <Paper p="md" withBorder radius="md" ta="center">
            <Group justify="center" mb="xs">
              <IconClock size={20} />
              <Text size="sm" c="dimmed">Active Duration</Text>
            </Group>
            <Title order={2}>{alertData.duration || "N/A"}</Title>
          </Paper>
          <Paper p="md" withBorder radius="md" ta="center">
            <Group justify="center" mb="xs">
              <IconShield size={20} />
              <Text size="sm" c="dimmed">Status</Text>
            </Group>
            <Title order={2}>{alertData.status === "active" ? "Active" : "Resolved"}</Title>
          </Paper>
        </SimpleGrid>

        {/* Analysis Section */}
        <Paper p="xl" mb="xl" withBorder radius="md" bg={paperBg}>
          <Group justify="space-between" mb="md">
            <Group>
              <IconAlertCircle size={24} color="#3b82f6" />
              <Text fw={700} size="lg">Sighting Analysis</Text>
            </Group>
            <Badge color="blue" variant="light" size="lg">
              {detectionHistory.length > 0 ? ((confirmedSightings / detectionHistory.length) * 100).toFixed(1) : 0}% Confirmation Rate
            </Badge>
          </Group>
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            {/* Pie Chart */}
            <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <Box
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: `conic-gradient(
                    #22c55e 0deg ${detectionHistory.length > 0 ? (confirmedSightings / detectionHistory.length) * 360 : 0}deg,
                    #eab308 ${detectionHistory.length > 0 ? (confirmedSightings / detectionHistory.length) * 360 : 0}deg 360deg
                  )`,
                  position: 'relative',
                }}
              >
                <Box
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: paperBg,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text fw={800} size="xl" c="#3b82f6">{detectionHistory.length || 0}</Text>
                  <Text size="xs" c="dimmed">Total</Text>
                </Box>
              </Box>
            </Box>
            {/* Legend */}
            <Stack gap="md" style={{ justifyContent: 'center' }}>
              <Group gap="xs">
                <Box style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#22c55e' }} />
                <Text fw={600}>Confirmed Sightings</Text>
                <Badge color="green" variant="light">{confirmedSightings || 0}</Badge>
              </Group>
              <Group gap="xs">
                <Box style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#eab308' }} />
                <Text fw={600}>Pending Review</Text>
                <Badge color="yellow" variant="light">{(detectionHistory.length || 0) - confirmedSightings}</Badge>
              </Group>
              <Divider />
              <Group gap="xs">
                <Text size="sm" c="dimmed">Confirmation Rate:</Text>
                <Text fw={700} size="lg" c="#3b82f6">
                  {detectionHistory.length > 0 ? ((confirmedSightings / detectionHistory.length) * 100).toFixed(1) : 0}%
                </Text>
              </Group>
            </Stack>
          </SimpleGrid>
        </Paper>

        {/* Map + Table */}
        <Grid gutter="xl">
          {/* Map Section */}
          <Grid.Col span={12}>
            <Paper withBorder radius="md" style={{ height: "auto", minHeight: 400 }}>
              <Box
                p="md"
                style={{
                  borderBottom: `1px solid ${borderColor}`,
                  backgroundColor: "#1e40af",
                  color: "white",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <Group>
                  <IconMap size={20} />
                  <Text fw={600}>
                    Sighting Map -{" "}
                    {selectedDetection ? selectedDetection.location : alertData.location}
                  </Text>
                </Group>
                {selectedDetection && (
                  <Badge color="white" variant="filled" size="lg">
                    Selected: {selectedDetection.name}
                  </Badge>
                )}
              </Box>
              <div
                ref={mapRef}
                style={{
                  height: "clamp(300px, 50vh, 400px)",
                  width: "100%",
                  background: lightBlueBg,
                  borderRadius: "0 0 8px 8px",
                  zIndex: 1,
                }}
              />
            </Paper>
          </Grid.Col>

          {/* Table Section */}
          <Grid.Col span={12}>
            <Paper
              withBorder
              radius="md"
              style={{
                height: "auto",
                minHeight: 400,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                p="md"
                style={{
                  borderBottom: `1px solid ${borderColor}`,
                  backgroundColor: "#3b82f6",
                  color: "white",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                }}
              >
                <Group justify="space-between" wrap="wrap" gap="xs">
                  <Group>
                    <IconTable size={20} />
                    <Text fw={600}>Sightings History</Text>
                  </Group>
                  <Group>
                    <Badge color="white" variant="filled" size="lg">
                      {detectionHistory.filter(a => a.status === "active").length} Active
                    </Badge>
                    <Badge color="white" variant="filled" size="lg">
                      {detectionHistory.length} Total
                    </Badge>
                    <ActionIcon
                      variant="light"
                      color="white"
                      size="lg"
                      onClick={handleRefreshSightings}
                      title="Refresh sightings"
                    >
                      <IconRefresh size={20} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Box>

              <Box style={{ flex: 1, overflowX: "auto" }}>
                <ScrollArea style={{ height: "100%", minWidth: "100%" }}>
                  <Table striped highlightOnHover style={{ minWidth: 800 }}>
                    <Table.Thead style={{ backgroundColor: tableHeaderBg }}>
                      <Table.Tr>
                        <Table.Th style={{ textAlign: "center", fontWeight: 700, color: tableHeaderText }}>Sighting</Table.Th>
                        <Table.Th style={{ textAlign: "center", fontWeight: 700, color: tableHeaderText }}>Location</Table.Th>
                        <Table.Th style={{ textAlign: "center", fontWeight: 700, color: tableHeaderText }}>Date</Table.Th>
                        <Table.Th style={{ textAlign: "center", fontWeight: 700, color: tableHeaderText }}>Time</Table.Th>
                        <Table.Th style={{ textAlign: "center", fontWeight: 700, color: tableHeaderText }}>Accuracy</Table.Th>
                        <Table.Th style={{ textAlign: "center", fontWeight: 700, color: tableHeaderText }}>Type</Table.Th>
                        <Table.Th style={{ textAlign: "center", fontWeight: 700, color: tableHeaderText }}>Status</Table.Th>
                        <Table.Th style={{ textAlign: "center", fontWeight: 700, color: tableHeaderText }}>Confirmed</Table.Th>
                        <Table.Th style={{ textAlign: "center", fontWeight: 700, color: tableHeaderText }}>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {paginatedData.map((detection) => {
                        const accuracy = detection.accuracy || "--";
                        const isSelected = selectedDetection?.id === detection.id;

                        return (
                          <Table.Tr
                            key={detection.id}
                            style={{
                              backgroundColor: isSelected ? selectedRowBg : undefined,
                              cursor: "pointer",
                              borderLeft: isSelected ? `4px solid ${selectedRowBorder}` : "none",
                            }}
                            onClick={(e) => handleRowClick(detection, e)}
                          >
                            <Table.Td style={{ textAlign: "center" }}>
                              <Group justify="center" gap="xs">
                                <IconAlertCircle size={16} color={detection.type === "Suggestion" ? "#f59e0b" : "#ef4444"} />
                                <Text fw={600}>{detection.name}</Text>
                              </Group>
                            </Table.Td>
                            <Table.Td style={{ textAlign: "center" }}>
                              <Group justify="center" gap="xs">
                                <IconMapPin size={14} color="#3b82f6" />
                                <Text>{detection.location}</Text>
                              </Group>
                            </Table.Td>
                            <Table.Td style={{ textAlign: "center" }}>
                              <Group justify="center" gap="xs">
                                <IconCalendar size={14} color="#3b82f6" />
                                <Text>{detection.date}</Text>
                              </Group>
                            </Table.Td>
                            <Table.Td style={{ textAlign: "center" }}>
                              {detection.time}
                            </Table.Td>
                            <Table.Td style={{ textAlign: "center" }}>
                              {detection.type === "Person" || !accuracy || accuracy === "--" ? (
                                <Text c="dimmed">--</Text>
                              ) : (
                                <Badge
                                  color={
                                    parseFloat(accuracy) >= 80 ? "green" :
                                    parseFloat(accuracy) >= 60 ? "yellow" : "red"
                                  }
                                  variant="light"
                                  size="sm"
                                >
                                  {accuracy}
                                </Badge>
                              )}
                            </Table.Td>
                            <Table.Td style={{ textAlign: "center" }}>
                              <Group justify="center" gap="xs">
                                {detection.type === "Person" ? (
                                  <IconUser size={14} color="#3b82f6" />
                                ) : detection.type === "Suggestion" ? (
                                  <IconStar size={14} color="#f59e0b" />
                                ) : (
                                  <IconCamera size={14} color="#3b82f6" />
                                )}
                                <Badge
                                  color={detection.type === "Suggestion" ? "yellow" : "blue"}
                                  variant="light"
                                  size="sm"
                                >
                                  {detection.type || "CCTV"}
                                </Badge>
                              </Group>
                            </Table.Td>
                            <Table.Td style={{ textAlign: "center" }}>
                              <Badge
                                color={detection.status === "active" ? "red" : "green"}
                                variant="filled"
                                size="sm"
                              >
                                {detection.status === "active" ? "ACTIVE" : "RESOLVED"}
                              </Badge>
                            </Table.Td>
                            <Table.Td style={{ textAlign: "center" }}>
                              {detection.status === 'confirmed' || confirmedSightingIds.has(detection.id) ? (
                                <Badge color="green" variant="filled" size="sm" leftSection={<IconCheck size={12} />}>
                                  Confirmed
                                </Badge>
                              ) : (
                                <Badge color="gray" variant="light" size="sm">
                                  Pending
                                </Badge>
                              )}
                            </Table.Td>
                            <Table.Td style={{ textAlign: "center" }}>
                              <ActionIcon
                                variant="subtle"
                                color="blue"
                                size="lg"
                                className="arrow-button"
                                onClick={(e) => handleArrowClick(detection, e)}
                                style={{
                                  backgroundColor: isSelected
                                    ? getBg(colorScheme, '#dbeafe', theme.colors.blue[9])
                                    : "transparent",
                                  borderRadius: "50%",
                                }}
                              >
                                <IconChevronRight size={18} />
                              </ActionIcon>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Box>

              {/* Pagination */}
              <Box
                p="md"
                style={{
                  borderTop: `1px solid ${borderColor}`,
                  backgroundColor: paginationBg,
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Text size="sm" c={paginationText} fw={500}>
                  Page {activePage} of {totalPages} • {detectionHistory.length} total sightings
                  {selectedDetection && ` • Selected: ${selectedDetection.name}`}
                </Text>
                <Pagination
                  value={activePage}
                  onChange={setActivePage}
                  total={totalPages}
                  size="sm"
                  radius="sm"
                  withEdges
                  siblings={1}
                  color="blue"
                />
              </Box>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Actions */}
        <Group justify="center" mt="xl">
          <Button
            size="lg"
            variant="light"
            color="gray"
            leftSection={<IconArrowLeft size={18} />}
            onClick={() => router.push("/user/alert")}
          >
            Back to Alerts
          </Button>
          <Button
            size="lg"
            color="blue"
            leftSection={<IconDownload size={18} />}
            onClick={handleDownloadReport}
          >
            Download Full Report
          </Button>
          {alertData.status !== 'resolved' && (
            <Button
              size="lg"
              color="green"
              leftSection={<IconCheck size={18} />}
              onClick={() => setFoundModalOpen(true)}
            >
              ✅ Resolve Case
            </Button>
          )}
        </Group>
      </Box>

      {/* Found Confirmation Modal */}
      <Modal
        opened={foundModalOpen}
        onClose={() => setFoundModalOpen(false)}
        title={
          <Group gap="xs">
            <Text fw={800} size="xl">🎉 Confirm Found</Text>
          </Group>
        }
        centered
        size="md"
        radius="lg"
      >
        <Stack gap="md">
          <Paper p="md" bg="#f0fdf4" radius="md" withBorder style={{ borderColor: '#86efac' }}>
            <Text fw={600} c="green.8" size="sm" mb={4}>You are about to mark this case as RESOLVED</Text>
            <Text size="sm" c="dimmed">
              Confirming that <strong>{alertData?.brand}</strong> (Case: {alertData?.code}) has been found.
              The admin team will be notified and you will be redirected to leave feedback.
            </Text>
          </Paper>

          <Textarea
            label="Additional Notes (Optional)"
            placeholder="Any additional details about how/where you found them..."
            value={foundNotes}
            onChange={(e) => setFoundNotes(e.currentTarget.value)}
            minRows={3}
            radius="md"
          />

          <Group grow mt="xs">
            <Button
              variant="light"
              color="gray"
              onClick={() => setFoundModalOpen(false)}
              disabled={submittingFound}
            >
              Cancel
            </Button>
            <Button
              color="green"
              leftSection={<IconCheck size={16} />}
              onClick={handleFoundConfirm}
              loading={submittingFound}
            >
              Yes, confirm found!
            </Button>
          </Group>
        </Stack>
      </Modal>

      <MainFooter />
    </Box>
  );
}