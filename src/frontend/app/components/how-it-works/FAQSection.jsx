import { Box, Title, Text, Accordion, Group, ThemeIcon } from "@mantine/core";
import { IconUserPlus, IconCamera, IconStethoscope, IconClock, IconBuildingBank, IconBrandTelegram, IconUsers, IconMessageCircle } from "@tabler/icons-react";

const PRIMARY_GRADIENT = `linear-gradient(135deg, #0034D1 0%, #0066ff 100%)`;

const faqData = [
  { icon: IconUserPlus, question: "How many free registrations do I get?", answer: "You get 1 free registration total (for either a person or vehicle). After that, you'll need to subscribe to a premium plan to continue reporting missing cases." },
  { icon: IconCamera, question: "How do alerts work?", answer: "Our camera system automatically detects missing persons/vehicles. When a match is found, you'll receive an alert in your dashboard. The alert stays active until you view and acknowledge it." },
  { icon: IconStethoscope, question: "What documents are needed for special cases?", answer: "For mentally ill persons: valid doctor's report. For criminal background cases: official arrest warrant or court order. These are verified by our admin team." },
  { icon: IconClock, question: "How long do alerts stay active?", answer: "Alerts remain active until you view them. The system operates 24/7, so you can receive alerts at any time." },
  { icon: IconBuildingBank, question: "What payment methods are accepted?", answer: "We accept Bank Transfer, Wallet payments, and Credit/Debit cards. All payments are secure and encrypted." },
  { icon: IconBrandTelegram, question: "Will I get notifications via Telegram?", answer: "Yes! You can connect your Telegram account for instant notifications when your case is detected." },
  { icon: IconUsers, question: "Can police officers have special access?", answer: "Yes, law enforcement officers can have priority access to certain cases. Contact our admin for verification." },
  { icon: IconMessageCircle, question: "Is the platform available in Amharic?", answer: "We're working on Amharic language support! Currently the platform is in English, but Amharic is coming soon." },
];

export default function FAQSection() {
  return (
    <Box py={40}>
      <Title order={2} fw={800} ta="center" mb={10}>Frequently Asked Questions</Title>
      <Text c="dimmed" ta="center" mb={40} maw={600} mx="auto">Got questions? We've got answers</Text>

      <Accordion variant="separated" radius="lg" maw={800} mx="auto">
        {faqData.map((faq, index) => {
          const Icon = faq.icon;
          return (
            <Accordion.Item key={index} value={`faq-${index}`}>
              <Accordion.Control>
                <Group gap="sm">
                  <ThemeIcon size={30} radius={30} style={{ background: PRIMARY_GRADIENT }}><Icon size={20} /></ThemeIcon>
                  <Text fw={600}>{faq.question}</Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel><Text c="dimmed" pl={45}>{faq.answer}</Text></Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </Box>
  );
}