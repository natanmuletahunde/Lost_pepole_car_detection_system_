// FormSections.tsx
'use client';

import {
  Box, Title, Text, TextInput, Select, NumberInput,
  Textarea, SimpleGrid, Card, Button, FileInput, Stack,
  Flex, Badge, Alert, Tooltip, Loader, Checkbox,
  Avatar
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconUserPlus, IconCar, IconAlertTriangle, IconInfoCircle,
  IconCamera, IconRefresh, IconFileDescription, IconUpload,
  IconPhoto, IconMap, IconMapPin, IconCalendar, IconClock,
  IconMessageCircle, IconUser, IconMail, IconPhone, IconWorld,
  IconBrandTelegram, IconLock, IconShieldCheck, IconEyeOff,
  IconCheck, IconArrowRight
} from '@tabler/icons-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { colorOptions, regionOptions } from './constants';

// ---------- Last Seen Step ----------
export const LastSeenStep = ({
  formValues, handleInputChange, mapCenter, setMapCenter, regType, completed,
  colorScheme, theme, PRIMARY_COLOR, PRIMARY_GRADIENT, PRIMARY_LIGHT, PRIMARY_DARK, getBg, gradientIconBox,
  LocationPicker
}: any) => {
  const t = useTranslations("Register");
  const tCommon = useTranslations("Common");

  return (
    <Card withBorder radius="lg" padding="xl" bg={getBg(colorScheme, '#f8fbff', theme.colors.dark[6])} style={{ borderLeft: `4px solid ${PRIMARY_COLOR}`, position: 'relative' }}>
      {completed && (
        <Tooltip label="Step completed" position="left" withArrow>
          <Box style={{ position: 'absolute', top: 16, right: 16, background: '#40c057', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 2px 8px rgba(64,192,87,0.3)', zIndex: 10 }}>
            <IconCheck size={18} />
          </Box>
        </Tooltip>
      )}
      <Flex align="center" gap="md" mb="lg">
        <Box style={gradientIconBox}><IconMap size={24} /></Box>
        <Box>
          <Title order={4} style={{ color: PRIMARY_DARK }}>{t("stepLastSeen")}</Title>
          <Text c="dimmed" size="sm">
            {t("accuracyMattersDesc", { type: regType === 'Person' ? t("missingPerson") : regType === 'Vehicle' ? t("missingVehicle") : t("specialCase") })}
          </Text>
        </Box>
      </Flex>
      <TextInput
        name="location"
        label={<Text fw={600} size="sm">{t("locationLabel")} <Text span c={PRIMARY_COLOR}>*</Text></Text>}
        placeholder={t("locationPlaceholder")}
        leftSection={<IconMapPin size={18} color={PRIMARY_COLOR} />}
        radius="md"
        mb="lg"
        variant="filled"
        value={formValues.location}
        onChange={(e) => handleInputChange('location', e.target.value)}
      />
      <Card withBorder radius="lg" padding={0} mb="lg" style={{ overflow: 'hidden' }}>
        <LocationPicker
          onLocationSelect={(lat: any, lng: any, address: any) => {
            handleInputChange('location', address);
            handleInputChange('latitude', lat.toString());
            handleInputChange('longitude', lng.toString());
            setMapCenter([lat, lng]);
          }}
          initialPosition={mapCenter}
        />
      </Card>
      <Button
        size="xs"
        variant="light"
        leftSection={<IconMapPin size={14} />}
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const { latitude, longitude } = pos.coords;
                setMapCenter([latitude, longitude]);
              },
              (err: any) => {
                notifications.show({ title: t("submissionFailedTitle"), message: err.message, color: 'red' });
              }
            );
          } else {
            notifications.show({ title: t("stepNotAvailable"), color: 'yellow', message: undefined });
          }
        }}
        mb="md"
      >
        {t("useCurrentLocation")}
      </Button>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <TextInput
          name="lastSeenDate"
          label={<Text fw={600} size="sm">{t("lastSeenDate")} <Text span c={PRIMARY_COLOR}>*</Text></Text>}
          placeholder="YYYY-MM-DD"
          radius="md"
          type="date"
          max={new Date().toISOString().split('T')[0]}
          leftSection={<IconCalendar size={18} color={PRIMARY_COLOR} />}
          variant="filled"
          value={formValues.lastSeenDate}
          onChange={(e) => handleInputChange('lastSeenDate', e.target.value)}
        />
        <TextInput
          name="lastSeenTime"
          label={<Text fw={600} size="sm">{t("approximateTime")}</Text>}
          placeholder="HH:MM (24-hour format)"
          radius="md"
          type="time"
          leftSection={<IconClock size={18} color={PRIMARY_COLOR} />}
          variant="filled"
          value={formValues.lastSeenTime}
          onChange={(e) => handleInputChange('lastSeenTime', e.target.value)}
        />
      </SimpleGrid>
      <Alert
        icon={<IconInfoCircle size={18} color={PRIMARY_COLOR} />}
        title={t("accuracyMattersTitle")}
        color="blue"
        variant="light"
        radius="md"
        mt="lg"
        style={{ borderColor: PRIMARY_LIGHT, backgroundColor: getBg(colorScheme, `${PRIMARY_COLOR}08`, theme.colors.dark[6]) }}
      >
        <Text size="sm">
          {t("accuracyMattersDesc", { type: regType === 'Person' ? t("missingPerson") : regType === 'Vehicle' ? t("missingVehicle") : t("specialCase") })}
        </Text>
      </Alert>
    </Card>
  );
};

// ---------- Contact Info Step ----------
export const ContactInfoStep = ({
  formValues, handleInputChange, currentUser, completed,
  colorScheme, theme, PRIMARY_COLOR, PRIMARY_GRADIENT, PRIMARY_LIGHT, PRIMARY_DARK, getBg, gradientIconBox
}: any) => {
  const t = useTranslations("Register");
  const tCommon = useTranslations("Common");

  return (
    <Card withBorder radius="lg" padding="xl" bg={getBg(colorScheme, '#f8fbff', theme.colors.dark[6])} style={{ borderLeft: `4px solid ${PRIMARY_COLOR}`, position: 'relative' }}>
      {completed && (
        <Tooltip label="Step completed" position="left" withArrow>
          <Box style={{ position: 'absolute', top: 16, right: 16, background: '#40c057', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 2px 8px rgba(64,192,87,0.3)', zIndex: 10 }}>
            <IconCheck size={18} />
          </Box>
        </Tooltip>
      )}
      <Flex align="center" gap="md" mb="lg">
        <Box style={gradientIconBox}><IconMessageCircle size={24} /></Box>
        <Box>
          <Title order={4} style={{ color: PRIMARY_DARK }}>{t("contactInfoTitle")}</Title>
          <Text c="dimmed" size="sm">{t("contactInfoDesc")}</Text>
        </Box>
      </Flex>
      {/* Reporter's info is taken from currentUser – will be sent as reportedBy in the final payload */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="lg">
        <Card withBorder padding="lg" radius="md" bg={getBg(colorScheme, 'white', theme.colors.dark[7])} style={{ borderColor: PRIMARY_LIGHT }}>
          <Flex align="center" gap="md">
            <Avatar color={PRIMARY_COLOR} radius="xl" style={{ background: PRIMARY_GRADIENT }}><IconUser size={20} /></Avatar>
            <Box>
              <Text size="xs" c="dimmed" fw={600}>{tCommon("unknown")}</Text>
              <Text fw={700} style={{ color: PRIMARY_DARK }}>{currentUser?.firstName} {currentUser?.lastName}</Text>
            </Box>
          </Flex>
        </Card>
        <Card withBorder padding="lg" radius="md" bg={getBg(colorScheme, 'white', theme.colors.dark[7])} style={{ borderColor: PRIMARY_LIGHT }}>
          <Flex align="center" gap="md">
            <Avatar color="green" radius="xl" style={{ background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)' }}><IconMail size={20} /></Avatar>
            <Box>
              <Text size="xs" c="dimmed" fw={600}>{t("emailAddress")}</Text>
              <Text fw={700} style={{ color: PRIMARY_DARK }}>{currentUser?.email}</Text>
            </Box>
          </Flex>
        </Card>
        <Card withBorder padding="lg" radius="md" bg={getBg(colorScheme, 'white', theme.colors.dark[7])} style={{ borderColor: PRIMARY_LIGHT }}>
          <Flex align="center" gap="md">
            <Avatar color="red" radius="xl" style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' }}><IconPhone size={20} /></Avatar>
            <Box>
              <Text size="xs" c="dimmed" fw={600}>{tCommon("unknown")}</Text>
              <Text fw={700} style={{ color: PRIMARY_DARK }}>{currentUser?.phone}</Text>
            </Box>
          </Flex>
        </Card>
        <Card withBorder padding="lg" radius="md" bg={getBg(colorScheme, 'white', theme.colors.dark[7])} style={{ borderColor: PRIMARY_LIGHT }}>
          <Flex align="center" gap="md">
            <Avatar color="grape" radius="xl" style={{ background: 'linear-gradient(135deg, #cc66ff 0%, #9933ff 100%)' }}><IconWorld size={20} /></Avatar>
            <Box>
              <Text size="xs" c="dimmed" fw={600}>{t("registeredUser")}</Text>
              <Badge color="blue" variant="light" size="sm" style={{ background: `${PRIMARY_COLOR}15`, color: PRIMARY_COLOR, fontWeight: 700, border: `1px solid ${PRIMARY_COLOR}30` }}>
                {currentUser?.role || 'User'}
              </Badge>
            </Box>
          </Flex>
        </Card>
      </SimpleGrid>
      <Card withBorder padding="lg" radius="lg" mb="md" bg={getBg(colorScheme, 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)', `linear-gradient(135deg, ${theme.colors.dark[5]} 0%, ${theme.colors.dark[7]} 100%)`)} style={{ borderColor: '#0088cc', borderWidth: 2 }}>
        <Flex align="center" gap="md" mb="md">
          <IconBrandTelegram size={28} color="#0088cc" />
          <Box>
            <Text fw={700} size="lg" style={{ color: '#0088cc' }}>{t("telegramContactTitle")}</Text>
            <Text size="sm" c="dimmed">{t("telegramContactDesc")}</Text>
          </Box>
        </Flex>
        <TextInput
          name="telegramUsername"
          placeholder={t("telegramUsernamePlaceholder")}
          radius="md"
          leftSection={<Text c="#0088cc" fw={700}>@</Text>}
          description={t("telegramDescription")}
          variant="filled"
          value={formValues.telegramUsername}
          onChange={(e) => handleInputChange('telegramUsername', e.target.value)}
          styles={{
            root: { marginBottom: 8 },
            input: { borderColor: '#0088cc' },
            description: { color: '#0088cc', fontWeight: 500 }
          }}
        />
        <Text size="xs" c="dimmed" mt="xs" style={{ whiteSpace: 'pre-line' }}>
          {t("telegramBenefits")}
        </Text>
      </Card>
      <Textarea
        name="additionalContactInfo"
        label={<Text fw={600} size="sm">{t("additionalContactMethods")}</Text>}
        placeholder={t("additionalContactPlaceholder")}
        description={t("additionalContactDesc")}
        minRows={3}
        radius="md"
        mb="lg"
        variant="filled"
        value={formValues.additionalContactInfo}
        onChange={(e) => handleInputChange('additionalContactInfo', e.target.value)}
      />
      <Alert
        icon={<IconLock size={20} color={PRIMARY_COLOR} />}
        title={t("privacyTitle")}
        color="blue"
        variant="light"
        radius="md"
        style={{ borderColor: PRIMARY_COLOR, background: getBg(colorScheme, `${PRIMARY_COLOR}08`, theme.colors.dark[6]) }}
      >
        <Stack gap="xs">
          <Text size="sm"><IconShieldCheck size={16} style={{ marginRight: 8, verticalAlign: 'middle', color: PRIMARY_COLOR }} /> {t("privacyDetails1")}</Text>
          <Text size="sm"><IconEyeOff size={16} style={{ marginRight: 8, verticalAlign: 'middle', color: PRIMARY_COLOR }} /> {t("privacyDetails2")}</Text>
          <Text size="sm"><IconInfoCircle size={16} style={{ marginRight: 8, verticalAlign: 'middle', color: PRIMARY_COLOR }} /> {t("privacyDetails3")}</Text>
        </Stack>
      </Alert>
    </Card>
  );
};

// ---------- Review & Submit Step ----------
export const ReviewSubmitStep = ({
  regType, formValues, currentUser, isSubmitting, completed,
  colorScheme, theme, PRIMARY_COLOR, PRIMARY_GRADIENT, PRIMARY_LIGHT, PRIMARY_DARK, getBg, gradientIconBox
}: any) => {
  const t = useTranslations("Register");
  const tCommon = useTranslations("Common");

  return (
    <Card withBorder radius="lg" padding="xl" bg={getBg(colorScheme, '#f8fbff', theme.colors.dark[6])} style={{ borderLeft: `4px solid ${PRIMARY_COLOR}`, position: 'relative' }}>
      {completed && (
        <Tooltip label="Step completed" position="left" withArrow>
          <Box style={{ position: 'absolute', top: 16, right: 16, background: '#40c057', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 2px 8px rgba(64,192,87,0.3)', zIndex: 10 }}>
            <IconCheck size={18} />
          </Box>
        </Tooltip>
      )}
      <Flex align="center" gap="md" mb="lg">
        <Box style={gradientIconBox}><IconCheck size={24} /></Box>
        <Box>
          <Title order={4} style={{ color: PRIMARY_DARK }}>{t("reviewTitle")}</Title>
          <Text c="dimmed" size="sm">{t("reviewDesc")}</Text>
        </Box>
      </Flex>
      <Text size="sm" c="dimmed" mb="xl" ta="center">{t("almostDone")}</Text>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mb="xl">
        <Card withBorder padding="lg" radius="md" bg={getBg(colorScheme, 'white', theme.colors.dark[7])} style={{ borderColor: PRIMARY_LIGHT }}>
          <Text size="sm" c="dimmed" mb="xs">{tCommon("unknown")}</Text>
          <Badge size="lg" style={{ background: PRIMARY_GRADIENT, color: 'white', fontWeight: 700, padding: '8px 16px' }} leftSection={regType === 'Person' ? <IconUserPlus size={16} /> : regType === 'Vehicle' ? <IconCar size={16} /> : <IconAlertTriangle size={16} />}>
            {regType === 'Person' ? t("missingPerson") : regType === 'Vehicle' ? t("missingVehicle") : t("specialCase")}
          </Badge>
        </Card>
        <Card withBorder padding="lg" radius="md" bg={getBg(colorScheme, 'white', theme.colors.dark[7])} style={{ borderColor: PRIMARY_LIGHT }}>
          <Text size="sm" c="dimmed" mb="xs">{t("reporter")}</Text>
          <Text fw={700} style={{ color: PRIMARY_DARK }}>{currentUser?.firstName} {currentUser?.lastName}</Text>
          <Text size="xs" c="dimmed">{currentUser?.email}</Text>
        </Card>
        <Card withBorder padding="lg" radius="md" bg={getBg(colorScheme, 'white', theme.colors.dark[7])} style={{ borderColor: PRIMARY_LIGHT }}>
          <Text size="sm" c="dimmed" mb="xs">{tCommon("unknown")}</Text>
          <Badge color="green" variant="light" size="lg" style={{ background: getBg(colorScheme, '#d4edda', theme.colors.dark[5]), color: getBg(colorScheme, '#155724', theme.colors.green[3]), fontWeight: 700 }}>
            {t("readyToSubmit")}
          </Badge>
        </Card>
      </SimpleGrid>
      <Card withBorder padding="lg" radius="md" mb="xl" bg={getBg(colorScheme, 'white', theme.colors.dark[7])} style={{ borderColor: '#40c057', borderWidth: 2, boxShadow: '0 4px 20px rgba(64, 192, 87, 0.1)' }}>
        <Flex align="center" gap="md">
          <IconCheck color="#40c057" size={24} />
          <Box style={{ flex: 1 }}>
            <Text fw={700} style={{ color: getBg(colorScheme, '#155724', theme.colors.green[3]) }}>{t("finalConfirmationTitle")}</Text>
            <Text size="sm" c="dimmed">{t("finalConfirmationDesc")}</Text>
          </Box>
          <Checkbox size="lg" color="green" defaultChecked styles={{ input: { borderColor: '#40c057', backgroundColor: getBg(colorScheme, 'white', theme.colors.dark[7]), ':checked': { backgroundColor: '#40c057', borderColor: '#40c057' } } }} />
        </Flex>
      </Card>
      <Button
        type="submit"
        size="lg"
        radius="xl"
        loading={isSubmitting}
        disabled={isSubmitting}
        fullWidth
        style={{
          background: isSubmitting ? PRIMARY_COLOR : PRIMARY_GRADIENT,
          border: 'none',
          boxShadow: `0 8px 30px ${PRIMARY_COLOR}40`,
          transition: 'all 0.3s ease',
          height: '60px',
          fontSize: '18px',
          fontWeight: 800,
          letterSpacing: '0.5px',
        }}
        rightSection={!isSubmitting && (
          <Box style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconArrowRight size={22} />
          </Box>
        )}
      >
        {isSubmitting ? (
          <Flex align="center" justify="center" gap="sm">
            <Loader size="sm" color="white" />
            <span>{t("submittingReportButton")}</span>
          </Flex>
        ) : (
          <Flex align="center" justify="center" gap="sm">
            <IconShieldCheck size={22} />
            <span>{t("submitReportButton")}</span>
          </Flex>
        )}
      </Button>
      <Text size="xs" c="dimmed" ta="center" mt="md">
        <IconLock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
        {t("submissionSecure")}
      </Text>
    </Card>
  );
};