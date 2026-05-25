"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Box,
  SimpleGrid,
  Card,
  Button,
  Flex,
  Badge,
  useMantineColorScheme,
  Loader,
  Center,
  Group,
  AspectRatio,
} from "@mantine/core";
import {
  IconPlay,
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  videoUrl?: string;
  duration?: string;
}

export default function HomeVideos() {
  const t = useTranslations("Videos");
  const { colorScheme } = useMantineColorScheme();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const getBg = (light: string, dark: string) =>
    colorScheme === "dark" ? dark : light;

  // Sample videos - will be replaced with real data later
  // For now, these are placeholder videos that can be updated
  const videos: Video[] = [
    {
      id: "demo-1",
      title: "How to Report a Missing Person",
      description:
        "Learn how to quickly report a missing person case with all necessary details.",
      thumbnail: "/placeholder-video-1.jpg",
      videoUrl: "", // Will be provided later
      duration: "3:45",
    },
    {
      id: "demo-2",
      title: "Using the Sighting Report Feature",
      description:
        "Understand how to report a sighting and help reunite families.",
      thumbnail: "/placeholder-video-2.jpg",
      videoUrl: "", // Will be provided later
      duration: "2:30",
    },
    {
      id: "demo-3",
      title: "GPS Tracking Setup Guide",
      description:
        "Step-by-step guide to set up and use the GPS tracking feature.",
      thumbnail: "/placeholder-video-3.jpg",
      videoUrl: "", // Will be provided later
      duration: "4:15",
    },
    {
      id: "demo-4",
      title: "Alerts & Notifications",
      description:
        "Stay informed with real-time alerts and notifications about active cases.",
      thumbnail: "/placeholder-video-4.jpg",
      videoUrl: "", // Will be provided later
      duration: "2:15",
    },
  ];

  const currentVideo = videos[currentVideoIndex];

  const handleNext = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    setIsPlaying(false);
  };

  const handlePrev = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setIsPlaying(false);
  };

  return (
    <Box id="videos" py={{ base: 60, md: 100 }} bg="transparent">
      <Container size="xl">
        {/* Section Title */}
        <Flex direction="column" align="center" mb={{ base: 50, md: 60 }}>
          <Title
            order={2}
            ta="center"
            style={{ color: "#2f80ed" }}
            fw={900}
            mb="md"
          >
            {t("title", { defaultValue: "Video Demonstrations" })}
          </Title>
          <Text c="dimmed" ta="center" maw={600} size="lg">
            {t("subtitle", {
              defaultValue: "Watch how to use Flega to find your loved ones",
            })}
          </Text>
        </Flex>

        {/* Main Video Player */}
        <Box mb={{ base: 50, md: 80 }}>
          <Card
            radius="lg"
            withBorder
            overflow="hidden"
            bg={getBg("white", "#2C2E33")}
            shadow="lg"
            style={{
              borderColor: "#2f80ed",
              borderWidth: 2,
              borderStyle: "solid",
            }}
          >
            {/* Video Container */}
            <AspectRatio
              ratio={16 / 9}
              mx="auto"
              bg={getBg("#000000", "#0a0e27")}
            >
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: getBg(
                    "linear-gradient(135deg, #000000 0%, #1a1a2e 100%)",
                    "linear-gradient(135deg, #0a0e27 0%, #1a1a2e 100%)",
                  ),
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Placeholder or actual video player */}
                {currentVideo.videoUrl ? (
                  <video
                    key={currentVideo.id}
                    width="100%"
                    height="100%"
                    controls
                    autoPlay={isPlaying}
                    style={{
                      objectFit: "contain",
                    }}
                  >
                    <source src={currentVideo.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <Center style={{ width: "100%", height: "100%" }}>
                    <Flex direction="column" align="center" gap="md">
                      <Box
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          background: "rgba(47, 128, 237, 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconPlayerPlay size={40} color="#2f80ed" />
                      </Box>
                      <Text c="#90caf9" ta="center" size="sm">
                        {t("videoUrlPending", {
                          defaultValue: "Video URL will be provided soon",
                        })}
                      </Text>
                    </Flex>
                  </Center>
                )}
              </Box>
            </AspectRatio>

            {/* Video Info */}
            <Box p="xl" bg={getBg("#f8fbff", "#1C2F4A")}>
              <Flex
                justify="space-between"
                align="start"
                gap="md"
                mb="md"
                wrap="wrap"
              >
                <Box style={{ flex: 1 }}>
                  <Title order={3} mb="xs" style={{ color: "#2f80ed" }}>
                    {currentVideo.title}
                  </Title>
                  <Text c="dimmed" size="sm" mb="md">
                    {currentVideo.description}
                  </Text>
                </Box>
                {currentVideo.duration && (
                  <Badge color="blue" variant="light" size="lg">
                    {currentVideo.duration}
                  </Badge>
                )}
              </Flex>

              {/* Video Navigation */}
              <Group justify="space-between">
                <Button
                  leftSection={<IconChevronLeft size={18} />}
                  onClick={handlePrev}
                  variant="light"
                  color="blue"
                >
                  {t("previous", { defaultValue: "Previous" })}
                </Button>

                <Text c="dimmed" size="sm">
                  {currentVideoIndex + 1} / {videos.length}
                </Text>

                <Button
                  rightSection={<IconChevronRight size={18} />}
                  onClick={handleNext}
                  variant="light"
                  color="blue"
                >
                  {t("next", { defaultValue: "Next" })}
                </Button>
              </Group>
            </Box>
          </Card>
        </Box>

        {/* Video Thumbnails / Quick Access */}
        <Box>
          <Title order={4} mb="md" style={{ color: "#2f80ed" }} fw={700}>
            {t("allDemonstrations", { defaultValue: "All Demonstrations" })}
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
            {videos.map((video, index) => (
              <Card
                key={video.id}
                onClick={() => {
                  setCurrentVideoIndex(index);
                  setIsPlaying(false);
                }}
                style={{
                  cursor: "pointer",
                  border:
                    currentVideoIndex === index
                      ? "2px solid #2f80ed"
                      : "1px solid",
                  borderColor:
                    currentVideoIndex === index
                      ? "#2f80ed"
                      : getBg("#e9ecef", "#373A3C"),
                  background:
                    currentVideoIndex === index
                      ? getBg("#f0f5ff", "#1C2F4A")
                      : getBg("white", "#2C2E33"),
                  transition: "all 0.3s ease",
                }}
                radius="md"
                withBorder
                p="md"
                bg={getBg("white", "#2C2E33")}
              >
                {/* Thumbnail Placeholder */}
                <AspectRatio ratio={16 / 9} mb="md">
                  <Box
                    style={{
                      background: getBg(
                        "linear-gradient(135deg, #e0e7ff 0%, #f0f5ff 100%)",
                        "linear-gradient(135deg, #1a2a4a 0%, #2a3f5f 100%)",
                      ),
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {currentVideoIndex === index && (
                      <Box
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(47, 128, 237, 0.1)",
                          borderRadius: "8px",
                        }}
                      />
                    )}
                    <Box
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        background:
                          currentVideoIndex === index
                            ? "rgba(47, 128, 237, 0.3)"
                            : "rgba(47, 128, 237, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <IconPlay size={24} color="#2f80ed" fill="#2f80ed" />
                    </Box>
                  </Box>
                </AspectRatio>

                <Title
                  order={6}
                  size="sm"
                  mb="xs"
                  style={{ color: "#2f80ed" }}
                  lineClamp={2}
                >
                  {video.title}
                </Title>

                <Text size="xs" c="dimmed" lineClamp={2} mb="md">
                  {video.description}
                </Text>

                {currentVideoIndex === index && (
                  <Badge color="blue" variant="filled" size="sm" fullWidth>
                    Now Playing
                  </Badge>
                )}
              </Card>
            ))}
          </SimpleGrid>
        </Box>

        {/* Future Videos Info */}
        <Box mt={{ base: 50, md: 80 }}>
          <Card
            p="lg"
            radius="lg"
            withBorder
            bg={getBg("#f8fbff", "#1C2F4A")}
            style={{
              borderColor: "#2f80ed",
              borderStyle: "dashed",
            }}
          >
            <Flex gap="md" align="flex-start">
              <Box
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: "rgba(47, 128, 237, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconPlayerPlay size={24} color="#2f80ed" />
              </Box>
              <Box>
                <Title order={5} mb="xs" style={{ color: "#2f80ed" }}>
                  {t("moreVideos", { defaultValue: "More Videos Coming Soon" })}
                </Title>
                <Text size="sm" c="dimmed">
                  {t("moreVideosDesc", {
                    defaultValue:
                      "We're continuously adding new demonstration videos. Stay tuned for advanced features, troubleshooting guides, and user success stories.",
                  })}
                </Text>
              </Box>
            </Flex>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
