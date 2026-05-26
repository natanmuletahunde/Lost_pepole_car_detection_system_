"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Title,
  Text,
  Group,
  Box,
  Paper,
  SimpleGrid,
  TextInput,
  Table,
  Badge,
  Avatar,
  ActionIcon,
  Button,
  Select,
  Pagination,
  Tooltip,
  useMantineColorScheme,
  useMantineTheme,
  Loader,
  Tabs,
  Drawer,
  Textarea,
  Modal,
  Stack,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconSearch,
  IconDownload,
  IconEye,
  IconRefresh,
  IconCar,
  IconEyeOff,
  IconFileCheck,
  IconChevronLeft,
  IconChevronRight,
  IconSettings,
  IconBell,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconShieldCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import { adminFetchPaginatedList, adminFetch, uploadUrl } from "@/app/lib/adminApi";

const getBg = (colorScheme, light, dark) => (colorScheme === "dark" ? dark : light);
const getTextColor = (colorScheme, light, dark) => (colorScheme === "dark" ? dark : light);

const mapSightingToDoc = (s) => {
  const u = s.user;
  const name = u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "Unknown";
  const img = Array.isArray(s.images) && s.images[0] ? uploadUrl(s.images[0]) : "";
  return {
    id: s._id,
    uploader: name || u?.email || "Unknown",
    type: s.type === "vehicle" ? "Vehicle sighting" : "Person sighting",
    preview: img,
    submittedAt: s.reportedAt || s.createdAt,
    status: s.status || "pending",
    raw: s,
  };
};

const mapVehicleToDoc = (v) => {
  const u = v.reportedBy;
  const name = u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "Unknown";
  let imgArray = [];
  if (Array.isArray(v.ownershipDocumentUrl)) {
    imgArray = v.ownershipDocumentUrl.map(uploadUrl);
  } else if (typeof v.ownershipDocumentUrl === 'string') {
    imgArray = [uploadUrl(v.ownershipDocumentUrl)];
  }

  return {
    id: v._id,
    uploader: name || u?.email || "Unknown",
    type: "Vehicle Ownership",
    preview: imgArray[0] || "",
    previews: imgArray,
    submittedAt: v.createdAt,
    status: v.verificationStatus || "Pending",
    raw: v,
  };
};

export default function DocumentValidationPage() {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  const mainBg = getBg(colorScheme, "#F4F7FE", theme.colors.dark[7]);
  const primaryText = getTextColor(colorScheme, "#2B3674", theme.colors.gray[3]);
  const headerBg = getBg(colorScheme, "white", theme.colors.dark[6]);
  const cardBg = getBg(colorScheme, "white", theme.colors.dark[6]);

  const [activeTab, setActiveTab] = useState("sightings");

  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewDocId, setPreviewDocId] = useState(null);
  const [previewReason, setPreviewReason] = useState("");

  // ── Confirmation Modal State ──
  const [confirmModal, setConfirmModal] = useState({
    opened: false,
    id: null,
    action: null,       // "approve" | "reject"
    category: null,     // "sighting" | "vehicle"
    uploader: "",
    type: "",
  });
  const [confirmReason, setConfirmReason] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const previewUrl = previewUrls[previewIndex] || "";

  const [docs, setDocs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  
  const [activePage, setActivePage] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 320);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setActivePage(1);
  }, [debouncedSearch, activeTab]);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(activePage));
      params.set("limit", String(parseInt(pageSize, 10) || 10));
      if (debouncedSearch) params.set("search", debouncedSearch);

      if (activeTab === "sightings") {
        params.set("status", "pending");
        const { data, meta } = await adminFetchPaginatedList(`/sightings?${params.toString()}`);
        setDocs((data || []).map(mapSightingToDoc));
        setTotalPages(meta?.pages || 1);
      } else {
        const { data } = await adminFetchPaginatedList(`/admin/vehicles/pending-validation?${params.toString()}`);
        setVehicles((data?.vehicles || []).map(mapVehicleToDoc));
        setTotalPages(data?.pagination?.pages || 1);
      }
    } catch (err) {
      console.error(err);
      notifications.show({ title: "Error", message: "Could not load data", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [activePage, pageSize, debouncedSearch, activeTab]);

  const currentList = activeTab === "sightings" ? docs : vehicles;

  const filtered = useMemo(() => {
    let res = [...currentList];
    if (statusFilter && statusFilter !== "All") {
      res = res.filter((d) => {
        if (activeTab === "sightings") return d.status === statusFilter;
        return d.status.toLowerCase() === statusFilter.toLowerCase();
      });
    }
    return res;
  }, [currentList, statusFilter, activeTab]);

  const openPreview = (urls, id) => {
    const arr = Array.isArray(urls) ? urls.filter(Boolean) : (urls ? [urls] : []);
    if (arr.length === 0) {
      notifications.show({
        title: "No preview",
        message: "No document/image available",
        color: "yellow",
      });
      return;
    }
    setPreviewUrls(arr);
    setPreviewIndex(0);
    setPreviewDocId(id);
    setPreviewReason("");
    setPreviewDrawerOpen(true);
  };

  // ── Open confirmation modal (from table row OR drawer) ──
  const openConfirmModal = (id, action, category, uploader = "", type = "") => {
    setConfirmModal({ opened: true, id, action, category, uploader, type });
    setConfirmReason("");
    setConfirmLoading(false);
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, opened: false }));
    setConfirmReason("");
    setConfirmLoading(false);
  };

  // ── Execute the confirmed action ──
  const executeConfirmedAction = async () => {
    const { id, action, category } = confirmModal;
    setConfirmLoading(true);

    try {
      if (category === "sighting") {
        if (action === "approve") {
          await adminFetch(`/admin/sightings/${id}/approve`, { method: "PATCH", body: JSON.stringify({}) });
          notifications.show({ title: "Approved", message: "Sighting confirmed successfully", color: "green", icon: <IconCheck size={18} /> });
        } else {
          await adminFetch(`/admin/sightings/${id}/reject`, {
            method: "PATCH",
            body: JSON.stringify({ reason: confirmReason }),
          });
          notifications.show({ title: "Rejected", message: "Sighting marked as reviewed", color: "orange", icon: <IconX size={18} /> });
        }
      } else {
        // vehicle
        await adminFetch(`/admin/vehicles/${id}/verify`, {
          method: "PATCH",
          body: JSON.stringify({ action, reason: confirmReason }),
        });
        notifications.show({
          title: action === "approve" ? "Document Verified" : "Document Rejected",
          message: `Vehicle ownership document ${action === "approve" ? "verified" : "rejected"} successfully`,
          color: action === "approve" ? "green" : "orange",
          icon: action === "approve" ? <IconCheck size={18} /> : <IconX size={18} />,
        });
      }

      fetchDocs();
      setPreviewDrawerOpen(false);
      closeConfirmModal();
    } catch (err) {
      console.error(err);
      notifications.show({ title: "Error", message: err?.message || "Action failed. Please try again.", color: "red" });
      setConfirmLoading(false);
    }
  };

  // Legacy wrappers kept for the Drawer buttons (they pass reason from drawer textarea)
  const approveSighting = (id, skipConfirm = false) => {
    const doc = docs.find(d => d.id === id);
    openConfirmModal(id, "approve", "sighting", doc?.uploader || "", doc?.type || "Sighting");
  };

  const rejectSighting = (id, reasonInput, skipConfirm = false) => {
    const doc = docs.find(d => d.id === id);
    setConfirmReason(skipConfirm ? reasonInput : "");
    openConfirmModal(id, "reject", "sighting", doc?.uploader || "", doc?.type || "Sighting");
  };

  const verifyVehicle = (id, action, reasonInput, skipConfirm = false) => {
    const doc = vehicles.find(d => d.id === id);
    setConfirmReason(skipConfirm ? (reasonInput || "") : "");
    openConfirmModal(id, action, "vehicle", doc?.uploader || "", doc?.type || "Vehicle Ownership");
  };

  const exportToCSV = () => {
    const headers = ["ID", "Uploader", "Type", "Submitted At", "Status"];
    const rows = filtered.map((d) => [d.id, d.uploader, d.type, d.submittedAt, d.status]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notifications.show({ title: "Exported", message: `${filtered.length} rows`, color: "green" });
  };

  return (
    <Box bg={mainBg} style={{ minHeight: "100vh" }} p="xl">
      <Group justify="space-between" mb="xl">
        <Group>
          <Title order={2} fw={700} c={primaryText}>
            Document Validation
          </Title>
          <Badge size="lg" variant="light" color="blue">
            {activeTab === 'sightings' ? 'Pending sightings' : 'Pending vehicles'}
          </Badge>
        </Group>
        <Group bg={headerBg} p={8} style={{ borderRadius: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <TextInput
            placeholder="Search..."
            leftSection={<IconSearch size={16} />}
            radius="md"
            w={200}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            styles={{ input: { backgroundColor: 'transparent', height: '30px' } }}
          />
          <Tooltip label="Settings">
            <Link href="/admin/settings" passHref style={{ textDecoration: 'none' }}>
              <ActionIcon variant="subtle" color="blue" size="lg">
                <IconSettings size={22} />
              </ActionIcon>
            </Link>
          </Tooltip>
          <Tooltip label="Notifications">
            <Link href="/admin/notification" passHref style={{ textDecoration: 'none' }}>
              <ActionIcon variant="subtle" color="red" size="lg">
                <IconBell size={22} />
              </ActionIcon>
            </Link>
          </Tooltip>
          <Tooltip label="Refresh">
            <ActionIcon variant="subtle" color="blue" size="lg" onClick={fetchDocs}>
              <IconDownload size={22} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="sightings" leftSection={<IconEyeOff size={16} />}>
            Sightings Validation
          </Tabs.Tab>
          <Tabs.Tab value="vehicles" leftSection={<IconCar size={16} />}>
            Vehicle Ownership Documents
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
        <Paper p="md" radius="md" withBorder bg={cardBg}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Queue
          </Text>
          <Text size="xl" fw={800}>
            {currentList.length}
          </Text>
          <Text size="xs" c="dimmed">
            Current page (pending)
          </Text>
        </Paper>
      </SimpleGrid>

      <Paper p="md" radius="lg" withBorder bg={cardBg}>
        <Group justify="space-between" mb="md">
          <Select
            placeholder="Status"
            data={
              activeTab === "sightings" 
                ? ["All", "pending", "reviewed", "confirmed", "resolved"]
                : ["All", "Pending", "Verified", "Rejected"]
            }
            value={statusFilter}
            onChange={setStatusFilter}
            w={200}
            clearable
          />
          <Button leftSection={<IconDownload size={16} />} variant="light" onClick={exportToCSV}>
            Export CSV
          </Button>
        </Group>

        <Table.ScrollContainer minWidth={800}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead style={{ background: "#4318FF" }}>
              <Table.Tr>
                <Table.Th c="white">Document Preview</Table.Th>
                <Table.Th c="white">Reporter</Table.Th>
                <Table.Th c="white">Type</Table.Th>
                <Table.Th c="white">Submitted</Table.Th>
                <Table.Th c="white">Status</Table.Th>
                <Table.Th c="white" style={{ textAlign: "right" }}>
                  Actions
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Group justify="center" py="xl">
                      <Loader />
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ) : filtered.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text ta="center" c="dimmed" py="xl">
                      No pending {activeTab}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filtered.map((d) => (
                  <Table.Tr key={d.id}>
                    <Table.Td>
                      {d.previews && d.previews.length > 0 ? (
                        <Group gap="xs">
                          {d.previews.slice(0, 3).map((pUrl, idx) => (
                            <Avatar key={idx} src={pUrl} radius="sm" size={48} style={{ cursor: 'pointer', outline: idx === 0 ? '2px solid #4318FF' : 'none' }} onClick={() => openPreview(d.previews, d.id)} />
                          ))}
                          {d.previews.length > 3 && (
                            <Badge color="blue" variant="filled" style={{ cursor: 'pointer' }} onClick={() => openPreview(d.previews, d.id)}>+{d.previews.length - 3}</Badge>
                          )}
                        </Group>
                      ) : d.preview ? (
                        <Avatar src={d.preview} radius="sm" size={48} style={{ cursor: 'pointer' }} onClick={() => openPreview([d.preview], d.id)} />
                      ) : (
                        <Badge color="gray">No Document</Badge>
                      )}
                    </Table.Td>
                    <Table.Td>{d.uploader}</Table.Td>
                    <Table.Td>{d.type}</Table.Td>
                    <Table.Td>{new Date(d.submittedAt).toLocaleString()}</Table.Td>
                    <Table.Td>
                      <Badge color={d.status.toLowerCase() === 'pending' ? 'yellow' : d.status.toLowerCase() === 'verified' ? 'green' : 'red'}>
                        {d.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} justify="flex-end">
                        <ActionIcon variant="subtle" color="blue" onClick={() => openPreview(d.previews?.length ? d.previews : [d.preview], d.id)} disabled={!d.preview && !(d.previews?.length)}>
                          <IconEye size={18} />
                        </ActionIcon>
                        {activeTab === "sightings" ? (
                          <>
                            <Button size="xs" color="green" onClick={() => openConfirmModal(d.id, "approve", "sighting", d.uploader, d.type)}>
                              Approve
                            </Button>
                            <Button size="xs" color="red" variant="light" onClick={() => openConfirmModal(d.id, "reject", "sighting", d.uploader, d.type)}>
                              Reject
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="xs" color="green" onClick={() => openConfirmModal(d.id, "approve", "vehicle", d.uploader, d.type)}>
                              Verify
                            </Button>
                            <Button size="xs" color="red" variant="light" onClick={() => openConfirmModal(d.id, "reject", "vehicle", d.uploader, d.type)}>
                              Reject
                            </Button>
                          </>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <Group justify="space-between" mt="md">
          <Select
            size="xs"
            w={80}
            data={["10", "20", "50"]}
            value={pageSize}
            onChange={(v) => setPageSize(v || "10")}
          />
          <Pagination total={totalPages} value={activePage} onChange={setActivePage} size="sm" />
        </Group>
      </Paper>

      <Drawer
        opened={previewDrawerOpen}
        onClose={() => setPreviewDrawerOpen(false)}
        position="right"
        title={<Text fw={700} size="lg">Document Action Panel</Text>}
        size="lg"
      >
        <Box style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
          {previewUrl && (
            <Paper withBorder style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden', borderRadius: '8px' }} mb="md">
               {previewUrl.toLowerCase().endsWith('.pdf') ? (
                  <iframe src={previewUrl} width="100%" height="100%" style={{ border: 'none' }} title="PDF Preview" />
               ) : (
                  <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
               )}
               {previewUrls.length > 1 && (
                 <>
                   <ActionIcon
                     variant="filled"
                     color="dark"
                     radius="xl"
                     size="lg"
                     style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', opacity: 0.8, zIndex: 10 }}
                     onClick={() => setPreviewIndex(i => (i - 1 + previewUrls.length) % previewUrls.length)}
                     disabled={previewUrls.length <= 1}
                   >
                     <IconChevronLeft size={20} />
                   </ActionIcon>
                   <ActionIcon
                     variant="filled"
                     color="dark"
                     radius="xl"
                     size="lg"
                     style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', opacity: 0.8, zIndex: 10 }}
                     onClick={() => setPreviewIndex(i => (i + 1) % previewUrls.length)}
                     disabled={previewUrls.length <= 1}
                   >
                     <IconChevronRight size={20} />
                   </ActionIcon>
                   <Text size="xs" style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 10px', borderRadius: 12 }}>
                     {previewIndex + 1} / {previewUrls.length}
                   </Text>
                 </>
               )}
            </Paper>
          )}
          
          <Box>
            <Textarea
              label="Review Notes (Optional)"
              placeholder="Add reason for rejection or approval notes..."
              value={previewReason}
              onChange={(e) => setPreviewReason(e.currentTarget.value)}
              minRows={3}
              mb="md"
            />
            <Group grow>
              <Button 
                color="red" 
                variant="light" 
                onClick={() => {
                  if (activeTab === "sightings") rejectSighting(previewDocId, previewReason, true);
                  else verifyVehicle(previewDocId, "reject", previewReason, true);
                }}
              >
                Reject
              </Button>
              <Button 
                color="green" 
                onClick={() => {
                  if (activeTab === "sightings") approveSighting(previewDocId, true);
                  else verifyVehicle(previewDocId, "approve", previewReason, true);
                }}
              >
                Approve
              </Button>
            </Group>
          </Box>
        </Box>
      </Drawer>

      {/* ═══════════════ Confirmation Modal ═══════════════ */}
      <Modal
        opened={confirmModal.opened}
        onClose={closeConfirmModal}
        centered
        radius="lg"
        size="md"
        withCloseButton={false}
        overlayProps={{ backgroundOpacity: 0.45, blur: 4 }}
        styles={{
          content: {
            overflow: 'visible',
          },
        }}
      >
        <Stack align="center" gap="md" py="sm">
          {/* Icon */}
          <ThemeIcon
            size={72}
            radius="xl"
            variant="light"
            color={confirmModal.action === "approve" ? "green" : "red"}
            style={{
              boxShadow: confirmModal.action === "approve"
                ? '0 0 24px rgba(64,192,87,0.3)'
                : '0 0 24px rgba(250,82,82,0.3)',
            }}
          >
            {confirmModal.action === "approve"
              ? <IconShieldCheck size={36} />
              : <IconAlertTriangle size={36} />
            }
          </ThemeIcon>

          {/* Title */}
          <Title order={3} ta="center">
            {confirmModal.action === "approve" ? "Approve" : "Reject"}{" "}
            {confirmModal.category === "sighting" ? "Sighting" : "Vehicle Document"}?
          </Title>

          {/* Description */}
          <Text size="sm" c="dimmed" ta="center" maw={380}>
            {confirmModal.action === "approve"
              ? `You are about to approve this ${confirmModal.category === "sighting" ? "sighting report" : "vehicle ownership document"} submitted by `
              : `You are about to reject this ${confirmModal.category === "sighting" ? "sighting report" : "vehicle ownership document"} submitted by `
            }
            <Text span fw={600} c={confirmModal.action === "approve" ? "green" : "red"}>
              {confirmModal.uploader || "Unknown"}
            </Text>
            . This action cannot be undone.
          </Text>

          <Divider w="100%" />

          {/* Reason textarea (always shown, labeled appropriately) */}
          <Textarea
            w="100%"
            label={confirmModal.action === "reject" ? "Rejection Reason" : "Approval Notes (Optional)"}
            placeholder={
              confirmModal.action === "reject"
                ? "Please provide a reason for rejection..."
                : "Add any notes about this approval..."
            }
            value={confirmReason}
            onChange={(e) => setConfirmReason(e.currentTarget.value)}
            minRows={3}
            maxRows={5}
            autosize
            styles={{
              input: {
                borderColor: confirmModal.action === "reject" ? '#ffe3e3' : undefined,
                '&:focus': {
                  borderColor: confirmModal.action === "reject" ? '#fa5252' : '#40c057',
                },
              },
            }}
          />

          {/* Action buttons */}
          <Group w="100%" grow>
            <Button
              variant="default"
              radius="md"
              size="md"
              onClick={closeConfirmModal}
              disabled={confirmLoading}
            >
              Cancel
            </Button>
            <Button
              radius="md"
              size="md"
              color={confirmModal.action === "approve" ? "green" : "red"}
              variant={confirmModal.action === "approve" ? "filled" : "filled"}
              loading={confirmLoading}
              onClick={executeConfirmedAction}
              leftSection={
                confirmModal.action === "approve"
                  ? <IconCheck size={18} />
                  : <IconX size={18} />
              }
            >
              {confirmModal.action === "approve" ? "Yes, Approve" : "Yes, Reject"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
