"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Group,
  Card,
  Badge,
  Button,
  Center,
  Loader,
  Alert,
  SimpleGrid,
  Box,
  useMantineColorScheme,
  ActionIcon,
} from "@mantine/core";
import { IconUser as IconUserPerson, IconMapPin, IconMap, IconAlertCircle, IconArrowLeft } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiClient } from "../../lib/apiClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
const API_ROOT = API_BASE_URL.replace(/\/api\/v1\/?$/, '') || 'http://localhost:5000';
const MISSING_PERSONS_API = `${API_BASE_URL}/missing-persons`;

function getImageUrl(item) {
  if (item.imagePreview) return item.imagePreview;
  if (Array.isArray(item.images) && item.images[0]) {
    const path = item.images[0];
    if (path.startsWith('http')) return path;
    return `${API_ROOT}${path.startsWith('/') ? path : `/${path}`}`;
  }
  return null;
}

export default function PeoplePage() {
  const t = useTranslations("People");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme();
  const [missingPersons, setMissingPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getBg = (light, dark) => (colorScheme === "dark" ? dark : light);

  const extractArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const res = await apiClient(MISSING_PERSONS_API);
        if (res.ok) {
          const persons = extractArray(await res.json());
          setMissingPersons(persons.filter((p) => p.status === "Active"));
        } else {
          setError(t("error"));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchPersons();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Center style={{ minHeight: "100vh" }}>
        <Loader size="xl" color="blue" />
      </Center>
    );
  }

  return (
    <Container size="xl" py={40}>
      <Group mb="xl">
        <ActionIcon
          variant="light"
          color="blue"
          size="lg"
          radius="xl"
          onClick={() => router.back()}
        >
          <IconArrowLeft />
        </ActionIcon>
        <Box>
          <Title order={1} style={{ color: "#2f80ed" }}>
            {t("title")}
          </Title>
          <Text c="dimmed">{t("subtitle")}</Text>
        </Box>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title={t("error")} color="red" mb="lg">
          {error}
        </Alert>
      )}

      {missingPersons.length === 0 && !error ? (
        <Alert icon={<IconAlertCircle size={16} />} title={t("title")} color="blue" variant="light">
          {t("noPersons")}
        </Alert>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
          {missingPersons.map((person) => {
            const personId = person._id || person.id;
            const imageUrl = getImageUrl(person);
            return (
              <Card
                key={personId}
                radius="md"
                p={0}
                withBorder
                bg={getBg("white", "#2C2E33")}
              >
                <Box style={{ position: "relative", height: 240 }}>
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      fill
                      alt={`${person.firstName} ${person.lastName}`}
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <Center bg="gray.2" h="100%">
                      <IconUserPerson size={48} color="gray" />
                    </Center>
                  )}
                </Box>
                <Box p="md">
                  <Text size="md" fw={700} lineClamp={1}>
                    {person.firstName} {person.lastName}
                  </Text>
                  <Group gap="xs" mt={4}>
                    <Badge size="sm" color="pink" variant="light">
                      {person.gender || tCommon("unknown")}
                    </Badge>
                    <Badge size="sm" color="cyan" variant="light">
                      {t("age")} {person.age || "?"}
                    </Badge>
                  </Group>
                  <Group gap={4} mt={8}>
                    <IconMapPin size={16} />
                    <Text size="sm" lineClamp={1}>
                      {person.location || tCommon("unknown")}
                    </Text>
                  </Group>
                  {person.description && (
                    <Text size="sm" c="dimmed" lineClamp={2} mt={8}>
                      {person.description}
                    </Text>
                  )}
                  <Badge size="sm" color="red" variant="filled" fullWidth mt={12}>
                    {tCommon("active")}
                  </Badge>
                  <Button
                    component={Link}
                    href={`/user/report-sighting?type=Person&caseId=${
                      person.caseId || personId
                    }&name=${encodeURIComponent(
                      person.firstName + " " + person.lastName
                    )}&location=${encodeURIComponent(person.location || "")}`}
                    size="sm"
                    variant="light"
                    color="blue"
                    fullWidth
                    mt="md"
                    leftSection={<IconMap size={16} />}
                  >
                    {t("reportSighting")}
                  </Button>
                </Box>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Container>
  );
}
