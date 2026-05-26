"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Title, Text, Paper, Group, Avatar, Badge, Grid,
  Button, Divider, Alert, ActionIcon, Loader,
  Container, Stack, Modal
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconEdit, IconAlertCircle, IconCheck, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { adminFetch, uploadUrl } from '@/app/lib/adminApi';

const getReporterLabel = (reportedBy: unknown) => {
  if (!reportedBy) return 'N/A';
  if (typeof reportedBy === 'string') return reportedBy;
  const o = reportedBy as Record<string, string>;
  const name = `${o.firstName || ''} ${o.lastName || ''}`.trim();
  return name || o.email || 'N/A';
};

export default function RecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [sightings, setSightings] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [confirmModalOpened, confirmModalHandlers] = useDisclosure(false);
  const [verifyAction, setVerifyAction] = useState<'approve' | 'reject' | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'loading' | 'success' | 'error' | null>(null);

  const rawIdParam = params.id as string;
  const m = rawIdParam?.match(/^(person|vehicle)-(.+)$/);
  const type = m ? m[1] : null;
  const id = m ? m[2] : null;

  const fetchRecord = async () => {
    if (!rawIdParam || !m) {
      setError('Invalid record ID format');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const payload: any = await adminFetch(`/admin/cases/${type}/${id}`);
      const c = payload.case as Record<string, unknown>;
      const isPerson = type === 'person';
      const title = isPerson
        ? `${c.firstName || ''} ${c.lastName || ''}`.trim()
        : `${c.brand || ''} ${c.model || ''}`.trim();
      const plate = isPerson ? 'N/A' : String(c.plateNumber || 'N/A');
      const reportDate = isPerson
        ? c.reportDate || c.createdAt
        : c.createdAt || c.lastSeenDate;

      setRecord({
        id: rawIdParam,
        mongoId: id,
        title: title || 'Record',
        model: isPerson ? 'Person' : 'Vehicle',
        user: getReporterLabel(c.reportedBy),
        plate,
        date: new Date(reportDate as string).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        status: c.status || 'Active',
        verified: c.verified ?? false,
        raw: c,
      });
      setSightings(payload.sightings || []);
    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'Failed to load record');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleVerifyClick = (action: 'approve' | 'reject') => {
    if (!type || !id) return;

    if (type === 'vehicle' && action === 'approve') {
      const rawObj = record?.raw as Record<string, any>;
      if (rawObj?.verificationStatus !== 'Verified') {
        notifications.show({
          title: 'Approval Blocked',
          message: 'The ownership document for this vehicle is not verified yet. Please approve the document in Document Validation first.',
          color: 'red',
          autoClose: 8000,
        });
        return;
      }
    }

    setVerifyAction(action);
    setApprovalStatus(null);
    confirmModalHandlers.open();
  };

  const confirmVerify = async () => {
    if (!type || !id || !verifyAction) return;
    setApprovalStatus('loading');

    try {
      await adminFetch(`/admin/cases/${type}/${id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ action: verifyAction }),
      });

      setApprovalStatus('success');
      await fetchRecord();
    } catch (err) {
      console.error(err);
      setApprovalStatus('error');
    }
  };

  const closeConfirmModal = () => {
    confirmModalHandlers.close();
    setVerifyAction(null);
    setApprovalStatus(null);
  };

  if (loading) {
    return (
      <Box p="xl" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader size="xl" />
      </Box>
    );
  }

  if (error || !record) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Not Found" color="red">
          {error || `Record with ID ${params.id} does not exist.`}
        </Alert>
        <Button component={Link} href="/admin/registered_data" leftSection={<IconArrowLeft size={16} />} mt="md">
          Back to Data Management
        </Button>
      </Container>
    );
  }

  const raw = record.raw as Record<string, unknown>;
  const rawImgs = (raw.images as string[] | undefined) || [];
  const imgs = rawImgs.length > 0 ? rawImgs : (raw.imagePreview ? [raw.imagePreview as string] : []);
  const isVerified = Boolean(record.verified);
  const isVehicleDocPending = record.model === 'Vehicle' && raw.verificationStatus !== 'Verified';

  return (
    <Box p="xl" bg="#F4F7FE" style={{ minHeight: '100vh' }}>
      <Container size="lg">
        <Group justify="space-between" mb="lg">
          <Group>
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => router.push('/admin/registered_data')}
              size="lg"
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={2} fw={700} c="#2B3674">
              Record Details
            </Title>
          </Group>
          <Button
            leftSection={<IconEdit size={16} />}
            variant="light"
            color="blue"
            component={Link}
            href="/admin/registered_data"
          >
            Back to list
          </Button>
        </Group>

        {isVehicleDocPending && (
          <Alert icon={<IconAlertCircle size={16} />} title="Ownership Document Pending Verification" color="yellow" mb="lg" radius="md">
            The ownership document for this stolen car case has not been verified. 
            You must review and approve the document in the <Link href="/admin/document_validation" style={{ fontWeight: 600, color: '#228be6', textDecoration: 'underline' }}>Document Validation</Link> section before this case can be approved and published.
          </Alert>
        )}

        <Paper p="xl" radius="lg" shadow="md" withBorder>
          <Group gap="xl" mb="lg" justify="space-between" align="flex-start">
            <Group gap="xl">
              <Avatar size={100} radius="xl" color="blue" src={imgs[0] ? uploadUrl(imgs[0]) : undefined}>
                {String(record.title).charAt(0)}
              </Avatar>
              <Box>
                <Text fw={700} size="xxl" style={{ fontSize: '2rem' }}>
                  {String(record.title)}
                </Text>
                <Group gap="xs" mt="xs">
                  <Badge size="lg" color={record.status === 'Resolved' ? 'green' : 'gray'}>
                    {String(record.status)}
                  </Badge>
                  <Badge size="lg" color="blue">
                    {String(record.model)}
                  </Badge>
                  <Badge size="lg" color={isVerified ? 'teal' : 'orange'} variant="filled">
                    {isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                  </Badge>
                </Group>
              </Box>
            </Group>

            {/* Approve / Reject Action Buttons */}
            <Group gap="sm">
              {isVerified ? (
                <Button
                  color="red"
                  variant="light"
                  leftSection={<IconX size={16} />}
                  loading={verifying}
                  onClick={() => handleVerifyClick('reject')}
                >
                  Revoke Approval
                </Button>
              ) : (
                <>
                  <Button
                    color="red"
                    variant="light"
                    leftSection={<IconX size={16} />}
                    loading={verifying}
                    onClick={() => handleVerifyClick('reject')}
                  >
                    Reject
                  </Button>
                  <Button
                    color="green"
                    leftSection={<IconCheck size={16} />}
                    loading={verifying}
                    onClick={() => handleVerifyClick('approve')}
                    disabled={isVehicleDocPending}
                  >
                    Approve & Publish
                  </Button>
                </>
              )}
            </Group>
          </Group>

          <Divider my="lg" />

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">Type</Text>
              <Text fw={500}>{String(record.model)}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">Plate / ID</Text>
              <Text fw={500} style={{ fontFamily: 'monospace' }}>
                {String(record.plate)}
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">Reported By</Text>
              <Text fw={500}>{String(record.user)}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">Report date</Text>
              <Text fw={500}>{String(record.date)}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">Case ID</Text>
              <Text fw={500}>{String(raw.caseId || '—')}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">Verification Status</Text>
              <Text fw={500} c={isVerified ? 'teal' : 'orange'}>
                {isVerified ? 'Verified & Public' : 'Pending — Hidden from public'}
              </Text>
            </Grid.Col>
            {record.model === 'Vehicle' && (
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Text size="sm" c="dimmed">Ownership Document Validation</Text>
                <Badge
                  color={
                    String(raw.verificationStatus) === 'Verified'
                      ? 'green'
                      : String(raw.verificationStatus) === 'Rejected'
                      ? 'red'
                      : 'yellow'
                  }
                  variant="filled"
                  size="md"
                  mt={4}
                >
                  {String(raw.verificationStatus || 'Pending')}
                </Badge>
              </Grid.Col>
            )}
          </Grid>

          {imgs.length > 0 && (
            <>
              <Divider my="lg" />
              <Title order={5} mb="sm">Images</Title>
              <Group gap="md">
                {imgs.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={uploadUrl(src)}
                    alt=""
                    style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }}
                  />
                ))}
              </Group>
            </>
          )}

          {sightings.length > 0 && (
            <>
              <Divider my="lg" />
              <Title order={5} mb="sm">Recent sightings ({sightings.length})</Title>
              <Stack gap="xs">
                {sightings.slice(0, 5).map((s: unknown) => {
                  const sv = s as Record<string, unknown>;
                  return (
                    <Paper key={String(sv._id)} p="sm" withBorder>
                      <Text size="sm">{String(sv.description || '')}</Text>
                      <Badge size="sm" mt={4}>
                        {String(sv.status || 'pending')}
                      </Badge>
                    </Paper>
                  );
                })}
              </Stack>
            </>
          )}
        </Paper>

        {/* Confirmation Modal */}
        <Modal opened={confirmModalOpened} onClose={closeConfirmModal} title={<Text fw={700} size="lg">Confirm {verifyAction === 'approve' ? 'Approval' : 'Rejection'}</Text>} centered size="md" radius="md">
          <Stack gap="md">
            {approvalStatus === null && (
              <>
                <Text size="sm">
                  Are you sure you want to <Text fw={700} c={verifyAction === 'approve' ? 'green' : 'red'} span>{verifyAction === 'approve' ? 'approve and publish' : 'reject'}</Text> this {type} report?
                </Text>
                <Group justify="flex-end" mt="md">
                  <Button variant="subtle" onClick={closeConfirmModal}>Cancel</Button>
                  <Button bg={verifyAction === 'approve' ? '#20C997' : '#FF6B6B'} onClick={confirmVerify}>Confirm</Button>
                </Group>
              </>
            )}
            {approvalStatus === 'loading' && (
              <Group justify="center" py="xl">
                <Loader size="md" />
                <Text size="sm">Processing...</Text>
              </Group>
            )}
            {approvalStatus === 'success' && (
              <>
                <Group justify="center" py="xl">
                  <IconCheck size={48} color="#20C997" />
                </Group>
                <Text ta="center" fw={600} size="lg">
                  {verifyAction === 'approve' ? 'Approved Successfully' : 'Rejected Successfully'}
                </Text>
                <Text ta="center" size="sm" c="dimmed">
                  The report has been {verifyAction === 'approve' ? 'approved and published' : 'rejected'}. The reporter has been notified.
                </Text>
                <Group justify="flex-end" mt="md">
                  <Button bg="#2B3674" onClick={closeConfirmModal}>Done</Button>
                </Group>
              </>
            )}
            {approvalStatus === 'error' && (
              <>
                <Group justify="center" py="xl">
                  <IconX size={48} color="#FF6B6B" />
                </Group>
                <Text ta="center" fw={600} size="lg" c="red">Error</Text>
                <Text ta="center" size="sm" c="dimmed">
                  Could not {verifyAction === 'approve' ? 'approve' : 'reject'} this report. Please try again.
                </Text>
                <Group justify="flex-end" mt="md">
                  <Button variant="subtle" onClick={closeConfirmModal}>Close</Button>
                  <Button bg={verifyAction === 'approve' ? '#20C997' : '#FF6B6B'} onClick={confirmVerify}>Retry</Button>
                </Group>
              </>
            )}
          </Stack>
        </Modal>
      </Container>
    </Box>
  );
}
