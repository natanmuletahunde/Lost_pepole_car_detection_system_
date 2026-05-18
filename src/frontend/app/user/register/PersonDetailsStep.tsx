'use client';

import {
  Box, Title, Text, TextInput, Select, NumberInput,
  Textarea, SimpleGrid, Card, Button, Flex, Badge, Tooltip,
  ActionIcon, Alert
} from '@mantine/core';
import {
  IconUserPlus, IconCheck, IconCamera, IconRefresh, IconX, IconPhoto, IconInfoCircle
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

export const PersonDetailsStep = ({
  formValues,
  handleInputChange,
  personImages,
  setPersonImages,
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

  // Handle multiple file selection using native input
  const handleImageUpload = (event: any) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const newImages = Array.from(files).map((file: any) => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setPersonImages((prev: any[]) => [...prev, ...newImages]);
    // Reset the input value so the same file can be uploaded again if removed
    event.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setPersonImages((prev: any[]) => {
      URL.revokeObjectURL(prev[indexToRemove].preview);
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

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
        <Box style={gradientIconBox}><IconUserPlus size={24} /></Box>
        <Box>
          <Title order={4} style={{ color: PRIMARY_DARK }}>{t("stepPersonDetails")}</Title>
          <Text c="dimmed" size="sm">{t("personsPhotosDesc")}</Text>
        </Box>
      </Flex>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="lg">
        <TextInput
          name="firstName"
          label={<Text fw={600} size="sm">{t("firstName")} <Text span c={PRIMARY_COLOR}>*</Text></Text>}
          placeholder={t("firstName")}
          radius="md"
          variant="filled"
          value={formValues.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
        />
        <TextInput
          name="middleName"
          label={<Text fw={600} size="sm">{t("middleName")}</Text>}
          placeholder={t("middleName")}
          radius="md"
          variant="filled"
          value={formValues.middleName}
          onChange={(e) => handleInputChange('middleName', e.target.value)}
        />
        <TextInput
          name="lastName"
          label={<Text fw={600} size="sm">{t("lastName")} <Text span c={PRIMARY_COLOR}>*</Text></Text>}
          placeholder={t("lastName")}
          radius="md"
          variant="filled"
          value={formValues.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="lg">
        <Select
          name="gender"
          label={<Text fw={600} size="sm">{t("gender")} <Text span c={PRIMARY_COLOR}>*</Text></Text>}
          data={[
            { value: 'Male', label: t("male") || 'Male' },
            { value: 'Female', label: t("female") || 'Female' },
            { value: 'Other', label: t("other") || 'Other' }
          ]}
          radius="md"
          variant="filled"
          value={formValues.gender}
          onChange={(value) => handleInputChange('gender', value)}
        />
        <NumberInput
          name="age"
          label={<Text fw={600} size="sm">{t("age")} <Text span c={PRIMARY_COLOR}>*</Text></Text>}
          placeholder={t("age")}
          radius="md"
          min={0}
          variant="filled"
          value={formValues.age}
          onChange={(value) => handleInputChange('age', value)}
        />
        <NumberInput
          name="height"
          label={<Text fw={600} size="sm">{t("height")}</Text>}
          placeholder={t("height")}
          radius="md"
          min={0}
          variant="filled"
          value={formValues.height}
          onChange={(value) => handleInputChange('height', value)}
        />
        <NumberInput
          name="weight"
          label={<Text fw={600} size="sm">{t("weight")}</Text>}
          placeholder={t("weight")}
          radius="md"
          min={0}
          variant="filled"
          value={formValues.weight}
          onChange={(value) => handleInputChange('weight', value)}
        />
      </SimpleGrid>

      <Textarea
        name="description"
        label={<Text fw={600} size="sm">{t("description")}</Text>}
        placeholder={t("descriptionPlaceholder")}
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
          { value: 'mentally-ill', label: t("mentallyIll") },
          { value: 'criminal', label: t("criminal") }
        ]}
        radius="md"
        clearable
        mb="lg"
        variant="filled"
        value={formValues.specialCase}
        onChange={(value) => handleInputChange('specialCase', value)}
      />

      {/* MULTI‑IMAGE UPLOAD SECTION - USING NATIVE INPUT */}
      <Card
        withBorder
        radius="lg"
        padding="xl"
        bg={getBg(colorScheme, 'white', theme.colors.dark[7])}
        style={{
          borderStyle: 'dashed',
          borderColor: personImages.length < 2 ? PRIMARY_COLOR : PRIMARY_LIGHT,
          borderWidth: 2,
          transition: 'all 0.2s'
        }}
      >
        <Text fw={600} size="sm" mb="xs">
          {t("uploadPhotos")} <Text span c={PRIMARY_COLOR}>{t("uploadPhotosReq")}</Text>
        </Text>
        <Text size="sm" c="dimmed" mb="md">
          {t("clearRecentPhotos")}
        </Text>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleImageUpload}
          style={{ marginBottom: '16px', display: 'block' }}
        />

        {personImages.length === 0 && (
          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light" mt="md" radius="md">
            <Text size="sm">{t("atLeast2Photos")}</Text>
          </Alert>
        )}

        {personImages.length > 0 && (
          <Box mt="lg">
            <Flex justify="space-between" align="center" mb="sm">
              <Text size="sm" fw={600} c={PRIMARY_DARK}>
                {t("uploadedImages")} ({personImages.length} / 2+)
              </Text>
              {personImages.length < 2 && (
                <Badge color="orange" variant="light" size="sm">
                  {t("needMore", { count: 2 - personImages.length })}
                </Badge>
              )}
            </Flex>
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
              {personImages.map((img: any, idx: number) => (
                <Box
                  key={idx}
                  style={{
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: `2px solid ${PRIMARY_LIGHT}`,
                    aspectRatio: '1 / 1',
                    backgroundColor: '#f0f0f0'
                  }}
                >
                  <img
                    src={img.preview}
                    alt={`Preview ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <ActionIcon
                    color="red"
                    variant="filled"
                    size="md"
                    radius="xl"
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                    onClick={() => removeImage(idx)}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Box>
              ))}
            </SimpleGrid>
            <Text size="xs" c="dimmed" mt="sm" ta="center">
              {t("clickToUpload")}
            </Text>
          </Box>
        )}
      </Card>
    </Card>
  );
};