'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Container,
  Grid,
  Title,
  Text,
  TextInput,
  Textarea,
  Button,
  Box,
  SimpleGrid,
  Group,
  Avatar,
  useMantineColorScheme,
  Paper,
  Badge,
  Notification,
  Modal,
  Card,
  AspectRatio,
  rem,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import MainFooter from '../../components/MainFooter';
import DashboardHeader from '../dashboard/DashboardHeader';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Auth hook (replace with your real auth)
// Auth hook – reactive to route changes and localStorage updates
const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return (
      localStorage.getItem('auth_token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('auth_token')
    );
  };

  useEffect(() => {
    const updateAuth = () => setIsLoggedIn(!!getToken());
    updateAuth();
    window.addEventListener('storage', updateAuth);
    return () => window.removeEventListener('storage', updateAuth);
  }, [pathname]);

  return { isLoggedIn };
};

type GalleryItem = {
  type: 'image' | 'video';
  src: string;
  title?: string;
};

export default function AboutPage() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  // Added 'organization' to formData
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // No redirect anymore – form is disabled for unauthenticated users
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    // This should never be called when disabled, but keep as safeguard
    if (!isLoggedIn) return;

    setLoading(true);
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (res.ok) {
        setNotification({ type: 'success', message: 'Message sent! Admin will reply soon.' });
        setFormData({ firstName: '', lastName: '', email: '', organization: '', message: '' });
      } else {
        throw new Error(result.error || 'Failed to send');
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (item: GalleryItem) => {
    setSelectedItem(item);
    open();
  };

  // ========== EDITABLE CONTENT ==========
  const systemDescription = {
    title: 'AI-Powered Lost Person & Car Detection System',
    description: `In Ethiopia, thousands of families endure the agony of missing loved ones, and vehicle theft disrupts livelihoods daily. 
      Traditional methods—manual CCTV monitoring, phone calls, and radio announcements—are slow, error‑prone, and fail to scale. 
      Our platform replaces this reactive chaos with proactive intelligence.

      We have built an end‑to‑end solution that continuously scans existing CCTV feeds using state‑of‑the‑art AI: 
      YOLOv8 detects people and vehicles in real time, facial recognition identifies missing persons, and automatic license plate recognition (ALPR) spots stolen cars. 
      Once a match is found, instant alerts are sent via SMS, Telegram, and email—cutting response time from hours to seconds.

      For vulnerable individuals (elderly with dementia, mental health patients, or children), we developed an affordable IoT GPS smart belt. 
      It streams live location and triggers geofence alerts if the wearer wanders outside a safe zone.

      Our mission is to empower Ethiopian police, families, hospitals, and communities with a low‑cost, locally‑adapted, and open‑source tool that saves time, reduces suffering, and restores hope.`,
    techStack: ['Next.js', 'Mantine UI', 'Node.js', 'MongoDB', 'YOLOv8', 'face_recognition', 'ESP32', 'Arduino'],
  };

  const journey = [
    { year: 'Oct 2025', title: 'Problem Discovery', desc: 'Interviewed families and police; identified gaps in manual systems.' },
    { year: 'Nov 2025', title: 'AI Prototype', desc: 'Trained YOLOv8 on Ethiopian faces and license plates.' },
    { year: 'Dec 2025', title: 'Web Dashboard', desc: 'Built case registration and real‑time alert interface.' },
    { year: 'Jan 2026', title: 'IoT Hardware', desc: 'Assembled GPS smart belt and SMS gateway.' },
    { year: 'Feb 2026', title: 'System Integration', desc: 'End‑to‑end testing and pilot deployment.' },
  ];

  const teamMembers = [
    { name: 'Binyam Feleke', role: 'Project Lead & ML Engineer', avatar: '/team/bini.jpg', quote: 'AI for social good' },
    { name: 'Tinebeb Amesalu', role: 'Frontend Developer & Full‑Stack', avatar: '/team/tina.png', quote: 'User experience matters' },
    { name: 'Natan Muleta', role: 'Backend Developer & Full‑Stack', avatar: '/team/natan.jpg', quote: 'Reliable APIs save lives' },
    { name: 'Hibrewerk Demlie', role: 'Frontend Developer & Full‑Stack', avatar: '/team/hbr.jpg', quote: 'Clean code, clean conscience' },
    { name: 'Tesfalem Badeg', role: 'UI/UX Designer & Frontend Support', avatar: '/team/tesfa.jpg', quote: 'Design with empathy' },
  ];

  const galleryItems: GalleryItem[] = [
    // { type: 'image', src: '/gallery/team_working.jpg', title: 'Brainstorming session' },
    { type: 'video', src: '/gallery/video/site1.mp4', title: 'CCTV detection ' },
    { type: 'video', src: '/gallery/video/site2.mp4', title: 'CCTV car detection test' },
    { type: 'video', src: '/gallery/video/proposal_defence.mp4', title: 'Proposal Defence' },
  ];

  return (
    <Box bg={isDark ? 'dark.8' : 'white'} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box style={{ flex: 1, position: 'relative', overflowX: 'hidden' }}>
        {/* Background decorative shapes */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '55%',
            height: '800px',
            backgroundColor: isDark ? '#2C2E33' : '#EAF2FF',
            clipPath: 'polygon(45% 0, 100% 0, 100% 100%, 0% 80%)',
            zIndex: 0,
            opacity: 0.5,
          }}
        />
        <Box
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '45%',
            height: '600px',
            backgroundColor: isDark ? '#2C2E33' : '#EAF2FF',
            clipPath: 'polygon(0 15%, 85% 100%, 0 100%)',
            zIndex: 0,
            opacity: 0.4,
          }}
        />

        <DashboardHeader />

        <Container size="xl" py={80} style={{ position: 'relative', zIndex: 1 }}>
          {/* Hero Section */}
          <Box mb={80} ta="center">
            <Title
              order={1}
              size={rem(72)}
              fw={900}
              mb="md"
            >
              <Text
                component="span"
                variant="gradient"
                gradient={{ from: 'blue', to: 'teal', deg: 45 }}
                inherit
              >
                About Our Project
              </Text>
            </Title>
            <Text size="xl" c="dimmed" maw={700} mx="auto" mb={40}>
              Meet the team, explore our journey, and see how we're building the future of public safety in Ethiopia.
            </Text>
            <Group justify="center" gap="md">
              <Button size="lg" radius="xl" color="blue" component="a" href="#contact">
                Get in Touch
              </Button>
              <Button size="lg" radius="xl" variant="outline" color="teal" component="a" href="#gallery">
                View Our Work
              </Button>
            </Group>
          </Box>

          {/* FULL WIDTH: System Description */}
          <Paper withBorder p="xl" radius="lg" bg={isDark ? 'dark.7' : 'gray.0'} mb={80} shadow="md">
            <Title order={2} size={40} fw={800} mb="lg" ta="center">
              🧠 {systemDescription.title}
            </Title>
            <Text size="lg" style={{ lineHeight: 1.8 }} mb="xl">
              {systemDescription.description}
            </Text>
            <Box ta="center">
              <Title order={3} size={24} mb="md">Built With</Title>
              <Group gap="sm" justify="center">
                {systemDescription.techStack.map((tech) => (
                  <Badge key={tech} size="lg" color="blue" variant="light">
                    {tech}
                  </Badge>
                ))}
              </Group>
            </Box>
          </Paper>

          {/* TWO‑COLUMN SPLIT: Contact Form (left) + Journey (right) */}
          <Grid gutter={80} mb={80}>
            {/* Contact Form – FROZEN for unauthenticated users */}
            <Grid.Col span={{ base: 12, md: 6 }} id="contact">
              <Paper withBorder p="xl" radius="lg" bg={isDark ? 'dark.7' : 'white'} shadow="md">
                <Title order={2} size={32} fw={800} mb="md">
                  🤝 Work with Us
                </Title>
                <Text size="md" c="dimmed" mb="lg">
                  Interested in collaborating, investing, or deploying our solution?  
                  We’re looking for partners, pilot institutions, and supporters to help scale this technology across Ethiopia.  
                  Fill out the form below and let’s create impact together.
                  <br />
                  {!isLoggedIn && (
                    <Text component="span" c="blue" fw={700}>
                      Please log in to send a message.
                    </Text>
                  )}
                  {isLoggedIn && (
                    <Text component="span" size="sm" c="dimmed">
                      We'll get back to you within 24 hours.
                    </Text>
                  )}
                </Text>

                {notification && (
                  <Notification color={notification.type === 'success' ? 'teal' : 'red'} onClose={() => setNotification(null)} mb="md">
                    {notification.message}
                  </Notification>
                )}

                <form onSubmit={handleSubmit}>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} mb="md">
                    <TextInput
                      label="First name"
                      placeholder="Abebe"
                      radius="md"
                      size="lg"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      disabled={!isLoggedIn}
                      required
                    />
                    <TextInput
                      label="Last name"
                      placeholder="Kebede"
                      radius="md"
                      size="lg"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      disabled={!isLoggedIn}
                      required
                    />
                  </SimpleGrid>
                  <TextInput
                    label="Email address"
                    placeholder="abebe@example.com"
                    mb="md"
                    radius="md"
                    size="lg"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled={!isLoggedIn}
                    required
                  />
                  <TextInput
                    label="Organization / Institution (optional)"
                    placeholder="e.g., Adama Police, AASTU, NGO"
                    mb="md"
                    radius="md"
                    size="lg"
                    value={formData.organization}
                    onChange={(e) => handleChange('organization', e.target.value)}
                    disabled={!isLoggedIn}
                  />
                  <Textarea
                    label="Your message / collaboration idea"
                    placeholder="Tell us how you'd like to work with us – partnership, pilot deployment, funding, etc."
                    minRows={5}
                    mb="xl"
                    radius="md"
                    size="lg"
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    disabled={!isLoggedIn}
                    required
                  />
                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    radius="xl"
                    color="blue"
                    loading={loading}
                    disabled={!isLoggedIn}
                  >
                    {isLoggedIn ? 'Send collaboration request' : 'Login to send'}
                  </Button>
                  {!isLoggedIn && (
                    <Button
                      component="a"
                      href="/authentication/login"
                      variant="outline"
                      fullWidth
                      radius="xl"
                      mt="md"
                      color="blue"
                    >
                      Log in now
                    </Button>
                  )}
                </form>
              </Paper>
            </Grid.Col>

            {/* Right: Journey Timeline */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper withBorder p="xl" radius="lg" bg={isDark ? 'dark.7' : 'gray.0'} shadow="md">
                <Title order={2} size={32} fw={800} mb="xl" ta="center">
                  📍 Our Journey
                </Title>
                {journey.map((item, idx) => (
                  <Group key={idx} align="flex-start" mb="lg" wrap="nowrap">
                    <Badge size="xl" radius="sm" color="teal" style={{ minWidth: 100, fontSize: 16 }}>
                      {item.year}
                    </Badge>
                    <Box>
                      <Text fw={700} size="lg">{item.title}</Text>
                      <Text size="md" c="dimmed">{item.desc}</Text>
                    </Box>
                  </Group>
                ))}
              </Paper>
            </Grid.Col>
          </Grid>

          {/* FULL WIDTH: Team Profiles */}
          <Box mb={80}>
            <Title order={2} size={44} fw={800} mb="xl" ta="center">
              👥 Meet the Team
            </Title>
            <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="lg">
              {teamMembers.map((member) => (
                <Card key={member.name} withBorder padding="lg" radius="lg" shadow="sm">
                  <Avatar src={member.avatar} size={120} radius="100%" mx="auto" mb="md" />
                  <Text fw={700} size="lg" ta="center">{member.name}</Text>
                  <Text size="sm" c="dimmed" ta="center" mb="xs">{member.role}</Text>
                  <Text size="sm" fs="italic" ta="center" c="blue">{member.quote}</Text>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* FULL WIDTH: Gallery */}
          <Box id="gallery" mt={60}>
            <Title order={2} size={44} fw={800} mb="xl" ta="center">
              🏗️ Behind the Scenes
            </Title>
            <Text size="lg" c="dimmed" ta="center" maw={700} mx="auto" mb={50}>
              Our workspace, hardware testing, coding sessions, and demo moments.
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              {galleryItems.map((item, idx) => (
                <Card
                  key={idx}
                  withBorder
                  padding="sm"
                  radius="lg"
                  style={{ cursor: 'pointer' }}
                  onClick={() => openLightbox(item)}
                >
                  <AspectRatio ratio={16 / 9}>
                    {item.type === 'image' ? (
                      <Image
                        src={item.src}
                        alt={item.title || 'Gallery image'}
                        fill
                        style={{ objectFit: 'cover', borderRadius: rem(8) }}
                      />
                    ) : (
                      <video
                        src={item.src}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: rem(8) }}
                        controls={false}
                      />
                    )}
                  </AspectRatio>
                  <Text size="sm" ta="center" mt="sm" fw={500}>
                    {item.title}
                  </Text>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        </Container>
      </Box>

      {/* Lightbox Modal */}
      <Modal opened={opened} onClose={close} size="xl" centered withCloseButton>
        {selectedItem && (
          <Box>
            {selectedItem.type === 'image' ? (
              <Box style={{ position: 'relative', width: '100%', height: '70vh' }}>
                <Image src={selectedItem.src} alt={selectedItem.title || ''} fill style={{ objectFit: 'contain' }} />
              </Box>
            ) : (
              <video controls style={{ width: '100%', maxHeight: '70vh' }}>
                <source src={selectedItem.src} type="video/mp4" />
              </video>
            )}
            {selectedItem.title && <Text size="md" ta="center" mt="md">{selectedItem.title}</Text>}
          </Box>
        )}
      </Modal>

      <MainFooter />
    </Box>
  );
}