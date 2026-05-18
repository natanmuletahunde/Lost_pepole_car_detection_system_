import { Box, Title, Text, Accordion, Group, ThemeIcon } from "@mantine/core";
import { IconUserPlus, IconCamera, IconStethoscope, IconClock, IconBuildingBank, IconBrandTelegram, IconUsers, IconMessageCircle } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

const PRIMARY_GRADIENT = `linear-gradient(135deg, #0034D1 0%, #0066ff 100%)`;

export default function FAQSection() {
  const t = useTranslations("HowItWorks");

  const icons = [
    IconUserPlus,
    IconCamera,
    IconStethoscope,
    IconClock,
    IconBuildingBank,
    IconBrandTelegram,
    IconUsers,
    IconMessageCircle,
  ];

  const faqList = t.raw("faqList");

  return (
    <Box py={40}>
      <Title order={2} fw={800} ta="center" mb={10}>{t("faqTitle")}</Title>
      <Text c="dimmed" ta="center" mb={40} maw={600} mx="auto">{t("faqSubtitle")}</Text>

      <Accordion variant="separated" radius="lg" maw={800} mx="auto">
        {faqList.map((faq, index) => {
          const Icon = icons[index] || IconMessageCircle;
          return (
            <Accordion.Item key={index} value={`faq-${index}`}>
              <Accordion.Control>
                <Group gap="sm">
                  <ThemeIcon size={30} radius={30} style={{ background: PRIMARY_GRADIENT }}><Icon size={20} /></ThemeIcon>
                  <Text fw={600}>{faq.q}</Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel><Text c="dimmed" pl={45}>{faq.a}</Text></Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </Box>
  );
}