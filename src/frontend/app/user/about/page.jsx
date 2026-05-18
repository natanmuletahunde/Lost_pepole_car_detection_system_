'use client';

import { Container, Grid, Title, Text, TextInput, Textarea, Button, Box, SimpleGrid, useMantineColorScheme } from '@mantine/core';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import MainFooter from '../../../app/components/MainFooter';
import DashboardHeader from '../dashboard/DashboardHeader';

export default function AboutPage() {
  const t = useTranslations("AboutUs");
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Box bg={isDark ? "dark.8" : "white"} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* --- WRAPPER FOR CONTENT AND SHAPES --- */}
      <Box style={{ flex: 1, position: 'relative', overflowX: 'hidden' }}>
        
        {/* Background Shapes */}
        <Box style={{ position: 'absolute', top: 0, right: 0, width: '55%', height: '700px', backgroundColor: isDark ? '#2C2E33' : '#EAF2FF', clipPath: 'polygon(45% 0, 100% 0, 100% 100%, 0% 80%)', zIndex: 0 }} />
        <Box style={{ position: 'absolute', bottom: 0, left: 0, width: '45%', height: '600px', backgroundColor: isDark ? '#2C2E33' : '#EAF2FF', clipPath: 'polygon(0 15%, 85% 100%, 0 100%)', zIndex: 0 }} />

        <DashboardHeader />

        {/* Main Content Area */}
        <Container size="lg" py={60} style={{ position: 'relative', zIndex: 1 }}>
          <Grid gutter={80} align="flex-start">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={1} size={64} fw={900} mb="xs">{t("title")}</Title>
              <Text c="dimmed" size="lg" mb={30}>{t("subtitle")}</Text>
              
              <Text size="sm" mb={40} style={{ lineHeight: 1.8, color: isDark ? '#C1C2C5' : '#1A1B1E' }}>
                {t("bodyText")}
              </Text>

              <Box mt={50}>
                <Title order={2} size={32} fw={800} mb="xl">{t("contactTitle")}</Title>
                <form onSubmit={(e) => e.preventDefault()}>
                  <SimpleGrid cols={2} mb="md">
                    <TextInput label={t("firstName")} placeholder={t("placeholderName")} radius="md" size="md" />
                    <TextInput label={t("lastName")} placeholder={t("placeholderName")} radius="md" size="md" />
                  </SimpleGrid>
                  <TextInput label={t("emailAddress")} placeholder={t("placeholderEmail")} mb="md" radius="md" size="md" />
                  <Textarea label={t("yourMessage")} placeholder={t("placeholderMsg")} minRows={4} mb="xl" radius="md" />
                  {/* ✅ Curvy Button to match theme */}
                  <Button type="submit" size="lg" fullWidth radius="xl" color="blue">{t("submit")}</Button>
                </form>
              </Box>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box style={{ borderRadius: 30, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }}>
                <Image src="/surveillance-man.jpg" alt="Visual" width={600} height={750} layout="responsive" priority />
              </Box>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <MainFooter />
    </Box>
  );
}