'use client';

import {
  Container,
  Paper,
  TextInput,
  Button,
  Title,
  Text,
  Divider,
  Box,
  rem,
  PasswordInput,
  Alert,
  useMantineTheme,
  useMantineColorScheme,
  Center,
  Loader,
} from '@mantine/core';
import { IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SocialLoginIcons from '../../components/SocialLoginIcons';

// Helper to get dynamic background/color values
const getBg = (colorScheme, light, dark) => (colorScheme === 'dark' ? dark : light);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

/* ---------------- Validation schemas ---------------- */
const passwordLoginSchema = z.object({
  loginValue: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const phoneLoginSchema = z.object({
  loginValue: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number cannot exceed 15 digits')
    .regex(/^[\d\s\+\-]+$/, 'Invalid phone number'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  // All hooks called unconditionally at the top
  const [type, setType] = useState('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [authChecking, setAuthChecking] = useState(true);

  const router = useRouter();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isMobile = useMediaQuery('(max-width: 576px)');
  const isTablet = useMediaQuery('(max-width: 768px)');

  const currentSchema = type === 'email' ? passwordLoginSchema : phoneLoginSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    trigger,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(currentSchema),
    mode: 'onChange',
    defaultValues: {
      loginValue: '',
      password: '',
    },
  });

  // Check if user is already logged in
  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (userData && accessToken) {
      try {
        const user = JSON.parse(userData);
        if (user.role && user.role.toLowerCase() === 'admin') {
          router.push('/admin');
        } else {
          router.push('/user/dashboard');
        }
      } catch (e) {
        console.error('Error parsing user data', e);
        setAuthChecking(false);
      }
    } else {
      setAuthChecking(false);
    }
  }, [router]);

  // All other functions (showNotification, handleTypeSwitch, createLoginLog, onSubmit, etc.)
  const showNotification = (title, message, color, icon) => {
    notifications.show({
      title,
      message,
      color,
      icon,
      position: 'top-right',
      autoClose: 3000,
      withBorder: true,
    });
  };

  const handleTypeSwitch = () => {
    const newType = type === 'email' ? 'phone' : 'email';
    setType(newType);
    setValue('loginValue', '');
    setValue('password', '');
    setLoginError('');
    reset();
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setLoginError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginValue: data.loginValue.trim(),
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Login failed');
      }

      const result = await response.json();
      const user = result?.data?.user;
      const token = result?.data?.token;
      const refreshToken = result?.data?.refreshToken;

      if (!user || !token) throw new Error('Invalid login response');

      localStorage.setItem('currentUser', JSON.stringify({
        id: user._id || user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        address: user.address || '',
        profileImage: user.profileImage || '',
      }));
      localStorage.setItem('accessToken', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('isAuthenticated', 'true');

      showNotification(
        'Login Successful!',
        `Welcome back, ${user.firstName}!`,
        'green',
        <IconCheck size={18} />
      );

      setTimeout(() => {
        if (user.role && user.role.toLowerCase() === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }, 500);

    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'An error occurred. Please try again.');
      showNotification(
        'Error',
        error.message || 'Failed to connect to server. Please check your connection.',
        'red',
        <IconX size={18} />
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const watchedValue = watch('loginValue');
    if (!watchedValue || errors.loginValue) {
      showNotification(
        'Error',
        'Please enter a valid email or phone number first.',
        'red',
        <IconX size={18} />
      );
      return;
    }

    showNotification(
      'Password Reset',
      `Password reset instructions have been sent to your ${type === 'email' ? 'email' : 'phone'}.`,
      'blue',
      <IconCheck size={18} />
    );
  };

  // Conditional rendering after all hooks are defined
  if (authChecking) {
    return (
      <Center style={{ minHeight: '100vh', background: getBg(colorScheme, '#EAF2FF', theme.colors.dark[7]) }}>
        <Loader size="xl" color="blue" />
      </Center>
    );
  }

  const mainBg = getBg(colorScheme, '#EAF2FF', theme.colors.dark[7]);
  const paperBg = getBg(colorScheme, '#dbeafe', theme.colors.blue[9]);
  const textColor = getBg(colorScheme, undefined, theme.colors.gray[3]);

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: mainBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: rem(16),
      }}
    >
      <Container size={isMobile ? 'sm' : isTablet ? 500 : 500}>
        <Paper radius="lg" p={isMobile ? 'md' : 'xl'} shadow="md" bg={paperBg}>
          <Box ta="center" mb="sm">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={isMobile ? 80 : 100}
              height={isMobile ? 60 : 75}
              style={{ objectFit: 'contain', borderRadius: 8 }}
              priority
            />
          </Box>

          <Title ta="center" fw={700} c={textColor}>
            WELCOME !!
          </Title>

          <Title ta="center" order={4} mb="md" c={textColor}>
            Login
          </Title>

          <Text ta="center" mb="sm" c="dimmed">
            {type === 'email'
              ? 'Please enter your email and password'
              : 'Please enter your phone number and password'}
          </Text>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextInput
              label={type === 'email' ? 'Email' : 'Phone number'}
              placeholder={
                type === 'email'
                  ? 'example@email.com'
                  : '+251 9xx xxx xxx'
              }
              {...register('loginValue')}
              error={errors.loginValue?.message}
              onBlur={() => trigger('loginValue')}
              disabled={isSubmitting}
            />

            <PasswordInput
              mt="md"
              label="Password"
              placeholder="Enter your password"
              {...register('password')}
              error={errors.password?.message}
              onBlur={() => trigger('password')}
              disabled={isSubmitting}
            />

            {loginError && (
              <Alert
                mt="md"
                icon={<IconAlertCircle size={16} />}
                color="red"
                variant="light"
                title="Login Error"
                withCloseButton
                onClose={() => setLoginError('')}
              >
                {loginError}
              </Alert>
            )}

            <Button
              fullWidth
              mt="md"
              type="submit"
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <Box mt="sm" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text
              c="blue"
              onClick={handleTypeSwitch}
              style={{ cursor: 'pointer' }}
              size="sm"
            >
              {type === 'email'
                ? 'Login using phone number'
                : 'Login using email'}
            </Text>

            <Text
              c="blue"
              onClick={handleForgotPassword}
              style={{ cursor: 'pointer' }}
              size="sm"
            >
              Forgot password?
            </Text>
          </Box>

          <Text ta="center" mt="xs" c="dimmed">
            Don't have an account?{' '}
            <Link href="/authentication/signup" style={{ color: '#228be6', textDecoration: 'none' }}>
              Sign up
            </Link>
          </Text>

          <Divider my="md" label="or sign in using" labelPosition="center" />

          <SocialLoginIcons isMobile={isMobile} />

          <Alert
            mt="lg"
            icon={<IconAlertCircle size={16} />}
            color="gray"
            variant="outline"
            title="Demo Credentials"
            size="sm"
          >
            <Text size="xs">
              Try: john@example.com / SecurePass123!
            </Text>
          </Alert>
        </Paper>
      </Container>
    </Box>
  );
}