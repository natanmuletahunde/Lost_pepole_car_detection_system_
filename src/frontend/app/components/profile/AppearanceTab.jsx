"use client";

import { useState } from "react";
import { Card, Text, Group, Chip, Divider, Box, Slider, Stack } from "@mantine/core";
import { useMantineColorScheme } from "@mantine/core";

const getBg = (colorScheme, light, dark) => (colorScheme === "dark" ? dark : light);
const getTextColor = (colorScheme, light, dark) => (colorScheme === "dark" ? dark : light);

export default function AppearanceTab({ colorScheme }) {
  const { colorScheme: themeColorScheme, setColorScheme } = useMantineColorScheme();
  const [fontSize, setFontSize] = useState(16);

  return (
    <Card withBorder radius="md" padding="lg" bg={getBg(colorScheme, "white", "#2c2e33")}>
      <Text fw={500} size="md" mb="lg" c={getTextColor(colorScheme, "black", "white")}>
        Appearance
      </Text>

      <Stack gap="md">
        <Group justify="space-between">
          <Box>
            <Text size="sm" fw={500} c={getTextColor(colorScheme, "black", "white")}>Theme</Text>
            <Text size="xs" c="dimmed">Choose your color scheme</Text>
          </Box>
          <Chip.Group value={themeColorScheme} onChange={setColorScheme}>
            <Group gap="xs">
              <Chip value="light" size="sm">Light</Chip>
              <Chip value="dark" size="sm">Dark</Chip>
              <Chip value="auto" size="sm">System</Chip>
            </Group>
          </Chip.Group>
        </Group>

        <Divider />

        <Box>
          <Text size="sm" fw={500} mb="sm" c={getTextColor(colorScheme, "black", "white")}>Font size</Text>
          <Group>
            <Text size="xs">A</Text>
            <Slider
              value={fontSize}
              onChange={setFontSize}
              min={12}
              max={24}
              step={1}
              style={{ flex: 1 }}
            />
            <Text size="lg">A</Text>
          </Group>
          <Text size="xs" c="dimmed" mt={4}>Preview: This is how text will appear</Text>
        </Box>
      </Stack>
    </Card>
  );
}