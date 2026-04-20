import { Paper, Group, Button } from "@mantine/core";
import {
  IconUser,
  IconShieldLock,
  IconPalette,
  IconBellRinging,
  IconShield,
} from "@tabler/icons-react";

const tabs = [
  { id: "profile", label: "Profile", icon: IconUser },
  { id: "security", label: "Security", icon: IconShieldLock },
  { id: "preferences", label: "Preferences", icon: IconPalette },
  { id: "notifications", label: "Notifications", icon: IconBellRinging },
  { id: "privacy", label: "Privacy", icon: IconShield },
];

export const SettingsNavigation = (props) => {
  const { activeTab, setActiveTab } = props;
  
  return (
    <Paper 
      withBorder={true} 
      radius="lg" 
      mb="xl" 
      p="xs" 
      style={{ border: "1px solid rgba(65, 88, 208, 0.1)" }}
    >
      <Group justify="center" gap="xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = (activeTab === tab.id);
          return (
            <Button
              key={tab.id}
              variant={isActive ? "gradient" : "subtle"}
              gradient={isActive ? { from: '#4158D0', to: '#C850C0', deg: 135 } : undefined}
              leftSection={<Icon size={18} />}
              onClick={() => setActiveTab(tab.id)}
              radius="xl"
              size="md"
              style={{
                flex: 1,
                transition: 'all 0.3s ease',
              }}
            >
              {tab.label}
            </Button>
          );
        })}
      </Group>
    </Paper>
  );
};