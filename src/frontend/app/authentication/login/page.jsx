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
  ThemeIcon,
  Collapse,
  List,
  Stack,
} from '@mantine/core';
import { IconCheck, IconX, IconAlertCircle, IconMail, IconPhone, IconLock } from '@tabler/icons-react';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SocialLoginIcons from '../../components/SocialLoginIcons';

const getBg = (colorScheme, light, dark) =>
  colorScheme === 'dark' ? dark : light;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

/* ---------------- Validation Schemas ---------------- */
const passwordLoginSchema = z.object({
  loginValue: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const phoneLoginSchema = z.object({
  loginValue: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number cannot exceed 15 digits')
    .regex(/^[\d\s\+\-]+$/, 'Invalid phone number format'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const [type, setType] = useState('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const router = useRouter();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isMobile = useMediaQuery('(max-width: 576px)');
  const isTablet = useMediaQuery('(max-width: 768px)');

  const schema = type === 'email' ? passwordLoginSchema : phoneLoginSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
    trigger,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { loginValue: '', password: '' },
  });

  const watchedLoginValue = watch('loginValue');
  const errorCount = Object.keys(errors).length;

  const notify = (title, message, color, icon) =>
    notifications.show({
      title,
      message,
      color,
      icon,
      position: 'top-right',
      autoClose: 4000,
    });

  const handleTypeSwitch = () => {
    setType(type === 'email' ? 'phone' : 'email');
    reset();
    setLoginError('');
    setSubmitAttempted(false);
  };

  const handleForgotPassword = () => {
    if (!watchedLoginValue || errors.loginValue) {
      notify(
        'Enter Your Email First',
        'Please enter a valid email or phone number before requesting a reset.',
        'orange',
        <IconAlertCircle size={18} />
      );
      trigger('loginValue');
      return;
    }

    notify(
      'Password Reset Sent',
      `Reset instructions have been sent to your ${type === 'email' ? 'email' : 'phone'}.`,
      'blue',
      <IconCheck size={18} />
    );
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setLoginError('');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Login failed. Please check your credentials.');

      const { user, token, accessToken, refreshToken } = result.data;
      const resolvedAccessToken = accessToken || token;

      if (!resolvedAccessToken) {
        throw new Error('Login succeeded but no access token was returned');
      }

      localStorage.setItem('accessToken', resolvedAccessToken);
      localStorage.setItem('token', resolvedAccessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');

      notify('Welcome Back!', `Hello, ${user.firstName}! You are now logged in.`, 'green', <IconCheck />);

      setTimeout(() => {
        const redirectUrl = sessionStorage.getItem('redirectUrl');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectUrl');
          router.push(redirectUrl);
        } else {
          router.push(user.role === 'admin' ? '/admin' : '/user/homepage');
        }
      }, 800);
    } catch (err) {
      setLoginError(err.message);
      notify('Login Failed', err.message, 'red', <IconX />);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidationError = (errs) => {
    setSubmitAttempted(true);
    const count = Object.keys(errs).length;
    notify(
      'Validation Error',
      `Please fix ${count} field${count > 1 ? 's' : ''} before logging in.`,
      'red',
      <IconAlertCircle size={18} />
    );
  };

  // Field state icon helper
  const fieldIcon = (fieldName) => {
    if (!touchedFields[fieldName] && !submitAttempted) return null;
    return errors[fieldName]
      ? <IconX size={16} color={theme.colors.red[6]} />
      : <IconCheck size={16} color={theme.colors.teal[6]} />;
  };

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
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .field-error-shake { animation: shake 0.4s ease; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .error-alert-animate { animation: slideDown 0.3s ease; }
      `}</style>

      <Container size={isMobile ? 'sm' : 500}>
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

          <Title ta="center" fw={700} c={textColor}>WELCOME !!</Title>
          <Title ta="center" order={4} mb="xs" c={textColor}>Login</Title>
          <Text ta="center" mb="sm" c="dimmed" size="sm">
            {type === 'email'
              ? 'Enter your email and password to continue'
              : 'Enter your phone number and password to continue'}
          </Text>

          {/* Validation Summary — shown after failed submit */}
          <Collapse in={submitAttempted && errorCount > 0}>
            <Alert
              mb="md"
              icon={<IconAlertCircle size={18} />}
              color="red"
              variant="light"
              title="Please fix the following"
              radius="md"
              className="error-alert-animate"
            >
              <List size="xs" spacing={3} mt={2}>
                {errors.loginValue && (
                  <List.Item icon={<ThemeIcon size={14} color="red" radius="xl"><IconX size={10} /></ThemeIcon>}>
                    {errors.loginValue.message}
                  </List.Item>
                )}
                {errors.password && (
                  <List.Item icon={<ThemeIcon size={14} color="red" radius="xl"><IconX size={10} /></ThemeIcon>}>
                    {errors.password.message}
                  </List.Item>
                )}
              </List>
            </Alert>
          </Collapse>

          {/* Server / Auth Error */}
          {loginError && (
            <Alert
              mt="xs"
              mb="md"
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="filled"
              title="Login Failed"
              withCloseButton
              onClose={() => setLoginError('')}
              radius="md"
              className="error-alert-animate"
            >
              {loginError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit, handleValidationError)}>
            <Stack gap="sm">
              <TextInput
                label={type === 'email' ? 'Email Address' : 'Phone Number'}
                placeholder={type === 'email' ? 'example@email.com' : '+251 9xx xxx xxx'}
                leftSection={type === 'email' ? <IconMail size={16} /> : <IconPhone size={16} />}
                rightSection={fieldIcon('loginValue')}
                {...register('loginValue')}
                error={errors.loginValue?.message}
                onBlur={() => trigger('loginValue')}
                disabled={isSubmitting}
                className={submitAttempted && errors.loginValue ? 'field-error-shake' : ''}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                leftSection={<IconLock size={16} />}
                rightSection={fieldIcon('password')}
                {...register('password')}
                error={errors.password?.message}
                onBlur={() => trigger('password')}
                disabled={isSubmitting}
                className={submitAttempted && errors.password ? 'field-error-shake' : ''}
              />
            </Stack>

            <Button
              fullWidth
              mt="lg"
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              size="md"
              radius="md"
              variant="gradient"
              gradient={{ from: '#2f80ed', to: '#00d2ff', deg: 45 }}
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
              fw={500}
            >
              {type === 'email' ? 'Use phone number instead' : 'Use email instead'}
            </Text>
            <Text
              c="blue"
              onClick={handleForgotPassword}
              style={{ cursor: 'pointer' }}
              size="sm"
              fw={500}
            >
              Forgot password?
            </Text>
          </Box>

          <Text ta="center" mt="xs" c="dimmed" size="sm">
            Don't have an account?{' '}
            <Link href="/authentication/signup" style={{ color: '#228be6', textDecoration: 'none', fontWeight: 600 }}>
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
            radius="md"
          >
            <Text size="xs">Try: john@example.com / SecurePass123!</Text>
          </Alert>
        </Paper>
      </Container>
    </Box>
  );
}