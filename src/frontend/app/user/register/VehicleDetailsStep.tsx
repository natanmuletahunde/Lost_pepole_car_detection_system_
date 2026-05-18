'use client';

import {
  Box, Title, Text, TextInput, Select, NumberInput,
  Textarea, SimpleGrid, Card, Button, Flex, Badge, Tooltip,
  ActionIcon, Alert
} from '@mantine/core';
import {
  IconCar, IconCheck, IconPhoto, IconInfoCircle, IconX,
  IconFileDescription, IconUpload, IconChevronRight
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

export const VehicleDetailsStep = ({
  formValues,
  handleInputChange,
  vehicleImages,
  setVehicleImages,
  ownershipDocs,
  setOwnershipDocs,
  completed,
  colorScheme,
  theme,
  PRIMARY_COLOR,
  PRIMARY_GRADIENT,
  PRIMARY_LIGHT,
  PRIMARY_DARK,
  getBg,
  gradientIconBox
}: any) => {
  const t = useTranslations("Register");
  const tCommon = useTranslations("Common");

  const handleImageUpload = (event: any) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const newImages = Array.from(files).map((file: any) => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setVehicleImages((prev: any[]) => [...prev, ...newImages]);
    event.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setVehicleImages((prev: any[]) => {
      URL.revokeObjectURL(prev[indexToRemove].preview);
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const handleDocUpload = (event: any) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const newDocs = Array.from(files).map((file: any) => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setOwnershipDocs((prev: any[]) => [...prev, ...newDocs]);
    event.target.value = '';
  };

  const removeDoc = (indexToRemove: number) => {
    setOwnershipDocs((prev: any[]) => {
      URL.revokeObjectURL(prev[indexToRemove].preview);
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  // Curated lists with localized labels
  const brandOptions = ['Toyota', 'Hyundai', 'Suzuki', 'Lifan', 'Isuzu', 'Ford', 'Chevrolet', 'Other'].map(b => ({
    value: b,
    label: b === 'Other' ? t("other") : b
  }));

  const colorOptions = ['Black', 'White', 'Silver', 'Grey', 'Red', 'Blue', 'Green', 'Yellow', 'Other'].map(c => ({
    value: c,
    label: c === 'Black' ? (t("colorBlack") || 'Black') :
           c === 'White' ? (t("colorWhite") || 'White') :
           c === 'Silver' ? (t("colorSilver") || 'Silver') :
           c === 'Grey' ? (t("colorGrey") || 'Grey') :
           c === 'Red' ? (t("colorRed") || 'Red') :
           c === 'Blue' ? (t("colorBlue") || 'Blue') :
           c === 'Green' ? (t("colorGreen") || 'Green') :
           c === 'Yellow' ? (t("colorYellow") || 'Yellow') :
           t("other")
  }));

  const plateTypeOptions = ['Private', 'Commercial', 'Government', 'NGO', 'Diplomatic', 'Other'].map(p => ({
    value: p,
    label: p === 'Private' ? (t("platePrivate") || 'Private') :
           p === 'Commercial' ? (t("plateCommercial") || 'Commercial') :
           p === 'Government' ? (t("plateGovernment") || 'Government') :
           p === 'NGO' ? (t("plateNgo") || 'NGO') :
           p === 'Diplomatic' ? (t("plateDiplomatic") || 'Diplomatic') :
           t("other")
  }));

  const regionOptions = [
    { value: 'AA', label: t("regionAddisAbaba") || 'Addis Ababa' },
    { value: 'AR', label: t("regionAfar") || 'Afar' },
    { value: 'AM', label: t("regionAmhara") || 'Amhara' },
    { value: 'OR', label: t("regionOromia") || 'Oromia' },
    { value: 'SO', label: t("regionSomali") || 'Somali' },
    { value: 'BG', label: t("regionBenishangulGumuz") || 'Benishangul-Gumuz' },
    { value: 'SN', label: t("regionSnnpr") || 'SNNPR' },
    { value: 'GG', label: t("regionGambela") || 'Gambela' },
    { value: 'HA', label: t("regionHarari") || 'Harari' },
    { value: 'TI', label: t("regionTigray") || 'Tigray' },
    { value: 'SW', label: t("regionSidama") || 'Sidama' },
    { value: 'SWE', label: t("regionSouthWest") || 'South West Ethiopia' },
    { value: 'DD', label: t("regionDireDawa") || 'Dire Dawa' },
    { value: 'FED', label: t("regionFederal") || 'Federal / Police' }
  ];

  const codeOptions = ['1', '2', '3', '4', '5', 'Code 2', 'Code 3', 'Code 4', 'A', 'B', 'C', 'D', 'ET', 'UN', 'CD'].map(c => ({
    value: c,
    label: c === 'Code 2' ? (t("plateCode2") || 'Code 2') :
           c === 'Code 3' ? (t("plateCode3") || 'Code 3') :
           c === 'Code 4' ? (t("plateCode4") || 'Code 4') :
           c
  }));

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
        <Box style={gradientIconBox}><IconCar size={24} /></Box>
        <Box>
          <Title order={4} style={{ color: PRIMARY_DARK }}>{t("stepVehicleDetails")}</Title>
          <Text c="dimmed" size="sm">{t("vehiclePhotosDesc")}</Text>
        </Box>
      </Flex>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="lg">
        <Select
          name="brand"
          label={<Text fw={600} size="sm">{t("brandLabel")} <Text span c={PRIMARY_COLOR}>*</Text></Text>}
          placeholder={t("brandPlaceholder")}
          data={brandOptions}
          radius="md"
          variant="filled"
          value={formValues.brand}
          onChange={(value) => handleInputChange('brand', value)}
        />
        <TextInput
          name="model"
          label={<Text fw={600} size="sm">{t("modelLabel")} <Text span c={PRIMARY_COLOR}>*</Text></Text>}
          placeholder={t("modelPlaceholder")}
          radius="md"
          variant="filled"
          value={formValues.model}
          onChange={(e) => handleInputChange('model', e.target.value)}
        />
        <TextInput
          name="submodel"
          label={<Text fw={600} size="sm">{t("submodelLabel")}</Text>}
          placeholder={t("submodelPlaceholder")}
          radius="md"
          variant="filled"
          value={formValues.submodel}
          onChange={(e) => handleInputChange('submodel', e.target.value)}
        />
        <Select
          name="color"
          label={<Text fw={600} size="sm">{t("colorLabel")} <Text span c={PRIMARY_COLOR}>*</Text></Text>}
          placeholder={t("colorPlaceholder")}
          data={colorOptions}
          radius="md"
          variant="filled"
          value={formValues.color}
          onChange={(value) => handleInputChange('color', value)}
        />
      </SimpleGrid>

      <Textarea
        name="description"
        label={<Text fw={600} size="sm">{t("vehicleDescLabel")}</Text>}
        placeholder={t("vehicleDescPlaceholder")}
        minRows={4}
        radius="md"
        mb="lg"
        variant="filled"
        value={formValues.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
      />

      <Select
        name="specialCase"
        label={<Text fw={600} size="sm">{t("specialCaseLabel")}</Text>}
        placeholder={t("specialCasePlaceholder")}
        data={[
          { value: 'none', label: t("none") },
          { value: 'mentally-ill', label: t("mentallyIllOwner") },
          { value: 'criminal', label: t("criminalOwner") }
        ]}
        radius="md"
        clearable
        mb="lg"
        variant="filled"
        value={formValues.specialCase}
        onChange={(value) => handleInputChange('specialCase', value)}
      />

      {/* LICENSE PLATE INFORMATION */}
      <Card withBorder radius="lg" padding="xl" mb="lg" bg={getBg(colorScheme, 'white', theme.colors.dark[7])} style={{ borderColor: PRIMARY_LIGHT, borderWidth: 2 }}>
        <Title order={5} mb="xs" style={{ color: PRIMARY_DARK }}>{t("plateInfoTitle")}</Title>
        <Text c="dimmed" size="xs" mb="lg">{t("plateInfoDesc")}</Text>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          <Select
            name="plateType"
            label={<Text fw={600} size="sm">{t("plateTypeLabel")} <Text span c={PRIMARY_COLOR}>*</Text></Text>}
            placeholder={t("plateTypePlaceholder")}
            data={plateTypeOptions}
            radius="md"
            variant="filled"
            value={formValues.plateType}
            onChange={(value) => handleInputChange('plateType', value)}
          />
          <Select
            name="region"
            label={<Text fw={600} size="sm">{t("regionLabel")} <Text span c={PRIMARY_COLOR}>*</Text></Text>}
            placeholder={t("regionPlaceholder")}
            data={regionOptions}
            radius="md"
            variant="filled"
            value={formValues.region}
            onChange={(value) => handleInputChange('region', value)}
          />
          <Select
            name="code"
            label={<Text fw={600} size="sm">{t("codeLabel")} <Text span c={PRIMARY_COLOR}>*</Text></Text>}
            placeholder={t("codePlaceholder")}
            data={codeOptions}
            radius="md"
            variant="filled"
            value={formValues.code}
            onChange={(value) => handleInputChange('code', value)}
          />
          <TextInput
            name="plateNumber"
            label={<Text fw={600} size="sm">{t("plateNumberLabel")} <Text span c={PRIMARY_COLOR}>*</Text></Text>}
            placeholder={t("plateNumberPlaceholder")}
            description={t("plateNumberDesc")}
            radius="md"
            variant="filled"
            value={formValues.plateNumber}
            onChange={(e) => handleInputChange('plateNumber', e.target.value)}
          />
        </SimpleGrid>
      </Card>

      {/* OWNERSHIP DOCUMENTATION */}
      <Card withBorder radius="lg" padding="xl" mb="lg" bg={getBg(colorScheme, 'white', theme.colors.dark[7])} style={{ borderStyle: 'dashed', borderColor: PRIMARY_LIGHT, borderWidth: 2 }}>
        <Text fw={600} size="sm" mb="xs">{t("ownershipTitle")}</Text>
        <Text size="xs" c="dimmed" mb="md">{t("ownershipDesc")}</Text>
        
        <input
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={handleDocUpload}
          style={{ marginBottom: '16px', display: 'block' }}
        />
        <Text size="xs" c="dimmed" mb="md">{t("ownershipFormats")}</Text>

        {ownershipDocs.length > 0 && (
          <Box mt="md">
            <Flex justify="space-between" align="center" mb="sm">
              <Text size="sm" fw={600} c={PRIMARY_DARK}>{t("uploadedImages")} ({ownershipDocs.length})</Text>
            </Flex>
            <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="sm">
              {ownershipDocs.map((doc: any, idx: number) => (
                <Box key={idx} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: `2px solid ${PRIMARY_LIGHT}`, aspectRatio: '1/1', backgroundColor: '#f0f0f0' }}>
                  <img src={doc.preview} alt={`Doc Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <ActionIcon
                    color="red"
                    variant="filled"
                    size="md"
                    radius="xl"
                    style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
                    onClick={() => removeDoc(idx)}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}
      </Card>

      {/* MULTI‑IMAGE UPLOAD FOR VEHICLE */}
      <Card
        withBorder
        radius="lg"
        padding="xl"
        bg={getBg(colorScheme, 'white', theme.colors.dark[7])}
        style={{ borderStyle: 'dashed', borderColor: PRIMARY_LIGHT, borderWidth: 2, transition: 'all 0.2s' }}
      >
        <Text fw={600} size="sm" mb="xs">{t("vehiclePhotosLabel")}</Text>
        <Text size="sm" c="dimmed" mb="md">{t("vehiclePhotosDesc")}</Text>
        
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleImageUpload}
          style={{ marginBottom: '16px', display: 'block' }}
        />

        {vehicleImages.length === 0 && (
          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light" mt="md" radius="md">
            <Text size="sm">{t("multiplePhotosAdvice")}</Text>
          </Alert>
        )}

        {vehicleImages.length > 0 && (
          <Box mt="lg">
            <Flex justify="space-between" align="center" mb="sm">
              <Text size="sm" fw={600} c={PRIMARY_DARK}>{t("vehicleImagesLabel")} ({vehicleImages.length})</Text>
              <Badge color="blue" variant="light" size="sm">{t("unlimited")}</Badge>
            </Flex>
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
              {vehicleImages.map((img: any, idx: number) => (
                <Box key={idx} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: `2px solid ${PRIMARY_LIGHT}`, aspectRatio: '1/1', backgroundColor: '#f0f0f0' }}>
                  <img src={img.preview} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <ActionIcon
                    color="red"
                    variant="filled"
                    size="md"
                    radius="xl"
                    style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                    onClick={() => removeImage(idx)}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Box>
              ))}
            </SimpleGrid>
            <Text size="xs" c="dimmed" mt="sm" ta="center">{t("addMorePhotosAdvice")}</Text>
          </Box>
        )}
      </Card>
    </Card>
  );
};