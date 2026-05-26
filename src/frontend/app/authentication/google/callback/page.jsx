'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Container, Paper, Title, Text, Loader, Box } from '@mantine/core';

export default function GoogleCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const refreshToken = urlParams.get('refreshToken');
      const error = urlParams.get('error');

      if (error) {
        notifications.show({
          title: 'Authentication Failed',
          message: 'Google login was cancelled or failed. Please try again.',
          color: 'red',
          icon: <IconX size={18} />,
        });
        router.push('/authentication/login');
        return;
      }

      if (token && refreshToken) {
        try {
          // Store tokens
          localStorage.setItem('accessToken', token);
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('isAuthenticated', 'true');

          // Fetch user data
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
          const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const result = await res.json();
            const userData = result.data.user;
            localStorage.setItem('currentUser', JSON.stringify(userData));

            notifications.show({
              title: 'Welcome!',
              message: `Hello, ${userData.firstName}! You have logged in with Google.`,
              color: 'green',
              icon: <IconCheck size={18} />,
            });

            // Redirect based on role
            setTimeout(() => {
              const redirectUrl = sessionStorage.getItem('redirectUrl');
              if (redirectUrl) {
                sessionStorage.removeItem('redirectUrl');
                router.push(redirectUrl);
              } else {
                router.push(userData.role === 'admin' ? '/admin' : '/user/homepage');
              }
            }, 800);
          } else {
            throw new Error('Failed to fetch user data');
          }
        } catch (err) {
          console.error('Google callback error:', err);
          notifications.show({
            title: 'Authentication Error',
            message: 'Could not complete login. Please try again.',
            color: 'red',
            icon: <IconX size={18} />,
          });
          router.push('/authentication/login');
        }
      } else {
        notifications.show({
          title: 'Authentication Failed',
          message: 'Invalid response from Google. Please try again.',
          color: 'red',
          icon: <IconX size={18} />,
        });
        router.push('/authentication/login');
      }
    };

    handleGoogleCallback();
  }, [router]);

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF2FF' }}>
      <Container size="sm">
        <Paper p="xl" radius="lg" shadow="md" style={{ textAlign: 'center' }}>
          <Loader size="xl" color="blue" />
          <Title order={3} mt="md">Completing Google Sign-In...</Title>
          <Text size="sm" c="dimmed" mt="xs">Please wait while we verify your account</Text>
        </Paper>
      </Container>
    </Box>
  );
}
