'use client';

import {
  Box, Title, Text, TextInput, Select, NumberInput,
  Textarea, SimpleGrid, Card, Button, FileInput, Flex, Badge, Tooltip,
  ActionIcon, Alert, Stack
} from '@mantine/core';
import {
  IconAlertTriangle, IconCheck, IconFileDescription, IconUpload,
  IconX, IconPhoto, IconInfoCircle
} from '@tabler/icons-react';
import Image from 'next/image';

export const SpecialCaseDetailsStep = ({
  formValues,
  handleInputChange,
  specialCategory,
  setSpecialCategory,
  doctorReport,
  setDoctorReport,
  criminalRecord,
  setCriminalRecord,
  specialImages,        // array of { file, preview }
  setSpecialImages,
  completed,
  colorScheme,
  theme,
  PRIMARY_COLOR,
  PRIMARY_GRADIENT,
  PRIMARY_LIGHT,
  PRIMARY_DARK,
  getBg,
  gradientIconBox
}) => {
  const handleImageUpload = (files) => {
    if (!files || files.length === 0) return;
    const newImages = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setSpecialImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (indexToRemove) => {
    setSpecialImages(prev => {
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
        <Box style={gradientIconBox}><IconAlertTriangle size={24} /></Box>
        <Box>
          <Title order={4} style={{ color: PRIMARY_DARK }}>Special Case Information</Title>
          <Text c="dimmed" size="sm">Provide details about the person with special circumstances</Text>
        </Box>
      </Flex>

      <Select
        name="specialCategory"
        label={<Text fw={600} size="sm">Special Category <Text span c={PRIMARY_COLOR}>*</Text></Text>}
        placeholder="Select the category"
        data={[
          { value: 'mentally-ill', label: 'Mentally Ill' },
          { value: 'criminal', label: 'Criminal Background' }
        ]}
        radius="md"
        value={specialCategory}
        onChange={setSpecialCategory}
        mb="lg"
        variant="filled"
      />

      {specialCategory === 'mentally-ill' && (
        <Card withBorder radius="lg" padding="xl" mb="lg" bg={getBg(colorScheme, 'white', theme.colors.dark[7])} style={{ borderColor: PRIMARY_LIGHT, borderWidth: 2 }}>
          <Flex align="center" gap="md" mb="md">
            <Box style={{ background: PRIMARY_GRADIENT, padding: '8px', borderRadius: '8px', color: 'white' }}><IconFileDescription size={20} /></Box>
            <Box>
              <Title order={5} style={{ color: PRIMARY_DARK }}>Doctor's Report <Text span c={PRIMARY_COLOR}>*</Text></Title>
              <Text c="dimmed" size="sm">Upload a medical report or documentation</Text>
            </Box>
          </Flex>
          <FileInput
            name="doctorReport"
            placeholder="Choose file..."
            accept="image/*,application/pdf"
            onChange={setDoctorReport}
            value={doctorReport}
            radius="md"
            clearable
            leftSection={<IconUpload size={16} color={PRIMARY_COLOR} />}
            description="Accepted formats: JPG, PNG, PDF (max 10MB)"
            variant="filled"
          />
        </Card>
      )}

      {specialCategory === 'criminal' && (
        <Card withBorder radius="lg" padding="xl" mb="lg" bg={getBg(colorScheme, 'white', theme.colors.dark[7])} style={{ borderColor: PRIMARY_LIGHT, borderWidth: 2 }}>
          <Flex align="center" gap="md" mb="md">
            <Box style={{ background: PRIMARY_GRADIENT, padding: '8px', borderRadius: '8px', color: 'white' }}><IconFileDescription size={20} /></Box>
            <Box>
              <Title order={5} style={{ color: PRIMARY_DARK }}>Arrest Warrant / Criminal Record <Text span c={PRIMARY_COLOR}>*</Text></Title>
              <Text c="dimmed" size="sm">Upload official documentation</Text>
            </Box>
          </Flex>
          <FileInput
            name="criminalRecord"
            placeholder="Choose file..."
            accept="image/*,application/pdf"
            onChange={setCriminalRecord}
            value={criminalRecord}
            radius="md"
            clearable
            leftSection={<IconUpload size={16} color={PRIMARY_COLOR} />}
            description="Accepted formats: JPG, PNG, PDF (max 10MB)"
            variant="filled"
          />
        </Card>
      )}

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="lg">
        <TextInput
          name="firstName"
          label={<Text fw={600} size="sm">First name <Text span c={PRIMARY_COLOR}>*</Text></Text>}
          placeholder="Enter first name"
          radius="md"
          variant="filled"
          value={formValues.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
        />
        <TextInput
          name="middleName"
          label={<Text fw={600} size="sm">Middle name</Text>}
          placeholder="Enter middle name"
          radius="md"
          variant="filled"
          value={formValues.middleName}
          onChange={(e) => handleInputChange('middleName', e.target.value)}
        />
        <TextInput
          name="lastName"
          label={<Text fw={600} size="sm">Last name <Text span c={PRIMARY_COLOR}>*</Text></Text>}
          placeholder="Enter last name"
          radius="md"
          variant="filled"
          value={formValues.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="lg">
        <Select
          name="gender"
          label={<Text fw={600} size="sm">Gender <Text span c={PRIMARY_COLOR}>*</Text></Text>}
          data={['Male', 'Female', 'Other']}
          radius="md"
          variant="filled"
          value={formValues.gender}
          onChange={(value) => handleInputChange('gender', value)}
        />
        <NumberInput
          name="age"
          label={<Text fw={600} size="sm">Age <Text span c={PRIMARY_COLOR}>*</Text></Text>}
          placeholder="Enter age"
          radius="md"
          min={0}
          variant="filled"
          value={formValues.age}
          onChange={(value) => handleInputChange('age', value)}
        />
        <NumberInput
          name="height"
          label={<Text fw={600} size="sm">Height (cm)</Text>}
          placeholder="Height in cm"
          radius="md"
          min={0}
          variant="filled"
          value={formValues.height}
          onChange={(value) => handleInputChange('height', value)}
        />
        <NumberInput
          name="weight"
          label={<Text fw={600} size="sm">Weight (kg)</Text>}
          placeholder="Weight in kg"
          radius="md"
          min={0}
          variant="filled"
          value={formValues.weight}
          onChange={(value) => handleInputChange('weight', value)}
        />
      </SimpleGrid>

      <Textarea
        name="description"
        label={<Text fw={600} size="sm">Additional Description</Text>}
        placeholder="Add any distinguishing features, clothing description, last seen with, medical conditions, etc."
        minRows={4}
        radius="md"
        mb="lg"
        variant="filled"
        value={formValues.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
      />

      {/* MULTI‑IMAGE UPLOAD FOR SPECIAL CASE */}
      <Card
        withBorder
        radius="lg"
        padding="xl"
        bg={getBg(colorScheme, 'white', theme.colors.dark[7])}
        style={{ borderStyle: 'dashed', borderColor: PRIMARY_LIGHT, borderWidth: 2, transition: 'all 0.2s' }}
      >
        <FileInput
          label={<Text fw={600} size="sm">Person's Photos</Text>}
          description="Upload clear photos of the person (at least 2 recommended)"
          accept="image/jpeg,image/png,image/webp"
          multiple
          leftSection={<IconPhoto size={16} />}
          onChange={handleImageUpload}
          radius="md"
          variant="filled"
        />

        {specialImages.length === 0 && (
          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light" mt="md" radius="md">
            <Text size="sm">Please upload clear photos of the person. Minimum 2 images are recommended.</Text>
          </Alert>
        )}

        {specialImages.length > 0 && (
          <Box mt="lg">
            <Flex justify="space-between" align="center" mb="sm">
              <Text size="sm" fw={600} c={PRIMARY_DARK}>Uploaded Images ({specialImages.length})</Text>
              <Badge color="blue" variant="light" size="sm">{specialImages.length} / Unlimited</Badge>
            </Flex>
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
              {specialImages.map((img, idx) => (
                <Box key={idx} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: `2px solid ${PRIMARY_LIGHT}`, aspectRatio: '1/1' }}>
                  <Image src={img.preview} alt={`Preview ${idx + 1}`} fill style={{ objectFit: 'cover' }} />
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
            <Text size="xs" c="dimmed" mt="sm" ta="center">Click the upload button to add more images • Click ✗ to remove</Text>
          </Box>
        )}
      </Card>
    </Card>
  );
};