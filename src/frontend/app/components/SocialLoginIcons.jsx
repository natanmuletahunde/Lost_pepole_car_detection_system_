'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Group, ActionIcon, Loader, Box, Button } from '@mantine/core';
import {
  IconBrandGoogle,
  IconBrandFacebook,
  IconBrandTelegram,
  IconCheck,
  IconX,
  IconAlertCircle,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export default function SocialLoginIcons({ isMobile }) {
  const router = useRouter();
  const [tgConfig, setTgConfig] = useState({ enabled: false, botName: '' });
  const [googleConfig, setGoogleConfig] = useState({ enabled: false, clientId: '' });
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const tgContainerRef = useRef(null);

  // Fetch Telegram and Google config on mount
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/auth/telegram-config`),
      fetch(`${API_BASE_URL}/auth/google-config`)
    ])
      .then(([tgRes, googleRes]) => Promise.all([tgRes.json(), googleRes.json()]))
      .then(([tgPayload, googlePayload]) => {
        if (tgPayload.success && tgPayload.data?.enabled) {
          setTgConfig(tgPayload.data);
        }
        if (googlePayload.success && googlePayload.data?.enabled) {
          setGoogleConfig(googlePayload.data);
        }
      })
      .catch((err) => console.error('Error fetching auth config:', err))
      .finally(() => setLoadingConfig(false));
  }, []);

  // Callback handler for Telegram auth
  const handleTelegramAuth = async (user) => {
    setIsAuthenticating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/telegram-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Telegram login failed.');
      }

      const { user: userData, token, accessToken, refreshToken } = result.data;
      const resolvedAccessToken = accessToken || token;

      localStorage.setItem('accessToken', resolvedAccessToken);
      localStorage.setItem('token', resolvedAccessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');

      notifications.show({
        title: 'Welcome back!',
        message: `Hello, ${userData.firstName}! You have logged in with Telegram.`,
        color: 'green',
        icon: <IconCheck size={18} />,
      });

      setTimeout(() => {
        const redirectUrl = sessionStorage.getItem('redirectUrl');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectUrl');
          router.push(redirectUrl);
        } else {
          router.push(userData.role === 'admin' ? '/admin' : '/user/homepage');
        }
      }, 800);
    } catch (err) {
      console.error('Telegram auth error:', err);
      notifications.show({
        title: 'Authentication Failed',
        message: err.message || 'Could not verify Telegram login. Please try again.',
        color: 'red',
        icon: <IconX size={18} />,
        autoClose: 10000,
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handler for Google OAuth
  const handleGoogleLogin = () => {
    if (!googleConfig.enabled) {
      notifications.show({
        title: 'Google Login Not Available',
        message: 'Google OAuth is not configured. Please contact the administrator.',
        color: 'orange',
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  // Dynamically render Telegram script when configuration is loaded
  useEffect(() => {
    if (loadingConfig || !tgConfig.enabled || !tgConfig.botName) return;

    // Create script tag
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', tgConfig.botName);
    script.setAttribute('data-size', isMobile ? 'medium' : 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-request-access', 'write');

    // Set globally accessible callback function
    window.onTelegramAuth = (user) => {
      handleTelegramAuth(user);
    };
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.async = true;

    // Render in container
    if (tgContainerRef.current) {
      tgContainerRef.current.innerHTML = '';
      tgContainerRef.current.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
      if (tgContainerRef.current) {
        tgContainerRef.current.innerHTML = '';
      }
    };
  }, [loadingConfig, tgConfig.enabled, tgConfig.botName, isMobile]);

  return (
    <Group justify="center" gap="md" align="center" style={{ minHeight: '40px' }}>
      <Button
        onClick={handleGoogleLogin}
        size="md"
        variant="outline"
        radius="md"
        leftSection={<IconBrandGoogle size={20} />}
        styles={{
          root: { borderColor: '#DB4437', color: '#DB4437' },
          section: { color: '#DB4437' }
        }}
        disabled={isAuthenticating}
        fullWidth
      >
        Google
      </Button>

      <Button
        component="a"
        href="https://facebook.com"
        target="_blank"
        size="md"
        variant="outline"
        radius="md"
        leftSection={<IconBrandFacebook size={20} />}
        styles={{
          root: { borderColor: '#1877F2', color: '#1877F2' },
          section: { color: '#1877F2' }
        }}
        disabled={isAuthenticating}
        fullWidth
      >
        Facebook
      </Button>

      {loadingConfig ? (
        <Loader size="sm" color="blue" />
      ) : tgConfig.enabled ? (
        <Box ref={tgContainerRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }} />
      ) : (
        <Button
          component="a"
          href="https://telegram.org"
          target="_blank"
          size="md"
          variant="outline"
          radius="md"
          leftSection={<IconBrandTelegram size={20} />}
          styles={{
            root: { borderColor: '#229ED9', color: '#229ED9' },
            section: { color: '#229ED9' }
          }}
          fullWidth
        >
          Telegram
        </Button>
      )}
    </Group>
  );
}
