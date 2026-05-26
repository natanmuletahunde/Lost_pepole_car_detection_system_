'use client';

function getBg(colorScheme, light, dark) {
  return colorScheme === 'dark' ? dark : light;
}

import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Grid,
  Box,
  rem,
  useMantineTheme,
  useMantineColorScheme,
  Text,
  Alert,
  Progress,
  List,
  ThemeIcon,
  Collapse,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconCheck, IconX, IconAlertCircle, IconShieldCheck, IconInfoCircle } from '@tabler/icons-react';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

/* ---------------- Password Strength ---------------- */
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: 'gray' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score: (score / 5) * 100, label: 'Very Weak', color: 'red' };
  if (score === 2) return { score: (score / 5) * 100, label: 'Weak', color: 'orange' };
  if (score === 3) return { score: (score / 5) * 100, label: 'Fair', color: 'yellow' };
  if (score === 4) return { score: (score / 5) * 100, label: 'Strong', color: 'teal' };
  return { score: 100, label: 'Very Strong', color: 'green' };
}

/* ---------------- Schema ---------------- */
const signupSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .min(10, 'Phone number must be at least 10 digits')
      .max(15, 'Phone number cannot exceed 15 digits')
      .regex(/^[\d\s\+\-]+$/, 'Invalid phone number format'),
    telegramUsername: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const router = useRouter();
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isMobile = useMediaQuery('(max-width: 576px)');

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
    trigger,
    watch,
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const watchedPassword = watch('password') || '';
  const passwordStrength = getPasswordStrength(watchedPassword);
  const errorCount = Object.keys(errors).length;

  const notify = (t, m, c, i) =>
    notifications.show({ title: t, message: m, color: c, icon: i, position: 'top-right' });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Registration failed');

      const { user, token, accessToken, refreshToken } = result.data;
      const resolvedAccessToken = accessToken || token;

      if (!resolvedAccessToken) {
        throw new Error('Signup succeeded but no access token was returned');
      }

      localStorage.setItem('accessToken', resolvedAccessToken);
      localStorage.setItem('token', resolvedAccessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');

      notify('Account Created!', `Welcome, ${user.firstName}! Your account is ready.`, 'green', <IconCheck />);
      reset();
      setTimeout(() => router.push('/authentication/login'), 800);
    } catch (err) {
      setServerError(err.message);
      notify('Registration Failed', err.message, 'red', <IconX />);
    } finally {
      setLoading(false);
    }
  };

  const handleValidationError = (errs) => {
    setSubmitAttempted(true);
    const count = Object.keys(errs).length;
    notify(
      'Please Fix Errors',
      `${count} field${count > 1 ? 's need' : ' needs'} your attention before signing up.`,
      'red',
      <IconAlertCircle size={18} />
    );
  };

  const mainBg = getBg(colorScheme, '#EAF2FF', theme.colors.dark[7]);
  const paperBg = getBg(colorScheme, '#dbeafe', theme.colors.blue[9]);
  const textColor = getBg(colorScheme, undefined, theme.colors.gray[3]);
  const isDark = colorScheme === 'dark';

  // Helper: show green check or red X based on field state
  const fieldIcon = (fieldName) => {
    if (!touchedFields[fieldName] && !submitAttempted) return null;
    return errors[fieldName]
      ? <IconX size={16} color="red" />
      : <IconCheck size={16} color="teal" />;
  };

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
        .mantine-TextInput-input[aria-invalid="true"],
        .mantine-PasswordInput-input[aria-invalid="true"] {
          border-color: var(--mantine-color-red-6) !important;
          background-color: rgba(255, 59, 48, 0.04) !important;
        }
      `}</style>

      <Container size={520}>
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

          <Title ta="center" fw={700} c={textColor}>JOIN US !!</Title>
          <Title ta="center" order={4} mb="xs" c={textColor}>Sign Up</Title>
          <Text ta="center" mb="sm" c="dimmed" size="sm">
            Please fill in the details to create your account
          </Text>

          {/* Validation Summary Banner — shown after first submit attempt */}
          <Collapse in={submitAttempted && errorCount > 0}>
            <Alert
              mb="md"
              icon={<IconAlertCircle size={18} />}
              color="red"
              variant="light"
              title={`${errorCount} field${errorCount > 1 ? 's require' : ' requires'} attention`}
              radius="md"
            >
              <List size="xs" spacing={4} mt={4}>
                {errors.firstName && <List.Item icon={<ThemeIcon size={14} color="red" radius="xl"><IconX size={10} /></ThemeIcon>}>{errors.firstName.message}</List.Item>}
                {errors.lastName && <List.Item icon={<ThemeIcon size={14} color="red" radius="xl"><IconX size={10} /></ThemeIcon>}>{errors.lastName.message}</List.Item>}
                {errors.email && <List.Item icon={<ThemeIcon size={14} color="red" radius="xl"><IconX size={10} /></ThemeIcon>}>{errors.email.message}</List.Item>}
                {errors.phone && <List.Item icon={<ThemeIcon size={14} color="red" radius="xl"><IconX size={10} /></ThemeIcon>}>{errors.phone.message}</List.Item>}
                {errors.password && <List.Item icon={<ThemeIcon size={14} color="red" radius="xl"><IconX size={10} /></ThemeIcon>}>{errors.password.message}</List.Item>}
                {errors.confirmPassword && <List.Item icon={<ThemeIcon size={14} color="red" radius="xl"><IconX size={10} /></ThemeIcon>}>{errors.confirmPassword.message}</List.Item>}
              </List>
            </Alert>
          </Collapse>

          {/* Server Error */}
          {serverError && (
            <Alert
              mb="md"
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="filled"
              title="Registration Failed"
              withCloseButton
              onClose={() => setServerError('')}
              radius="md"
            >
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit, handleValidationError)}>
            <Grid gutter="md">
              <Grid.Col span={6}>
                <TextInput
                  label="First Name"
                  placeholder="Abebe"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                  rightSection={fieldIcon('firstName')}
                  onBlur={() => trigger('firstName')}
                  disabled={loading}
                  className={submitAttempted && errors.firstName ? 'field-error-shake' : ''}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Last Name"
                  placeholder="Kebede"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                  rightSection={fieldIcon('lastName')}
                  onBlur={() => trigger('lastName')}
                  disabled={loading}
                  className={submitAttempted && errors.lastName ? 'field-error-shake' : ''}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              mt="md"
              label="Email"
              placeholder="example@email.com"
              {...register('email')}
              error={errors.email?.message}
              rightSection={fieldIcon('email')}
              onBlur={() => trigger('email')}
              disabled={loading}
              className={submitAttempted && errors.email ? 'field-error-shake' : ''}
            />
            <TextInput
              mt="md"
              label="Phone"
              placeholder="+251 9xx xxx xxx"
              {...register('phone')}
              error={errors.phone?.message}
              rightSection={fieldIcon('phone')}
              onBlur={() => trigger('phone')}
              disabled={loading}
              className={submitAttempted && errors.phone ? 'field-error-shake' : ''}
            />
            <TextInput
              mt="md"
              label="Telegram Username (Optional)"
              placeholder="@username"
              description="To receive direct alerts via Telegram"
              {...register('telegramUsername')}
              error={errors.telegramUsername?.message}
              onBlur={() => trigger('telegramUsername')}
              disabled={loading}
            />

            <PasswordInput
              mt="md"
              label="Password"
              placeholder="Enter your password"
              {...register('password')}
              error={errors.password?.message}
              onBlur={() => {
                trigger('password');
                trigger('confirmPassword');
              }}
              disabled={loading}
            />

            {/* Password Strength Meter */}
            {watchedPassword && (
              <Box mt={6}>
                <Progress
                  value={passwordStrength.score}
                  color={passwordStrength.color}
                  size="xs"
                  radius="xl"
                  animated={passwordStrength.score < 100}
                />
                <Text size="xs" c={passwordStrength.color} mt={4} fw={600}>
                  {passwordStrength.label}
                  {passwordStrength.label === 'Very Strong' && (
                    <IconShieldCheck size={13} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
                  )}
                </Text>
                {watchedPassword.length < 8 && (
                  <Text size="xs" c="dimmed">Use at least 8 characters</Text>
                )}
                {!/[A-Z]/.test(watchedPassword) && (
                  <Text size="xs" c="dimmed">Add an uppercase letter</Text>
                )}
                {!/[0-9]/.test(watchedPassword) && (
                  <Text size="xs" c="dimmed">Add a number</Text>
                )}
                {!/[^A-Za-z0-9]/.test(watchedPassword) && (
                  <Text size="xs" c="dimmed">Add a special character (e.g. @#$!)</Text>
                )}
              </Box>
            )}

            <PasswordInput
              mt="md"
              label="Confirm Password"
              placeholder="Confirm your password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              rightSection={
                watch('confirmPassword') && !errors.confirmPassword
                  ? <IconCheck size={16} color="teal" />
                  : watch('confirmPassword') && errors.confirmPassword
                  ? <IconX size={16} color="red" />
                  : null
              }
              onBlur={() => trigger('confirmPassword')}
              disabled={loading}
              className={submitAttempted && errors.confirmPassword ? 'field-error-shake' : ''}
            />

            <Button
              fullWidth
              mt="xl"
              type="submit"
              loading={loading}
              disabled={loading}
              size="md"
              radius="md"
              gradient={{ from: '#2f80ed', to: '#00d2ff', deg: 45 }}
              variant="gradient"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <Text ta="center" mt="md" c="dimmed" size="sm">
            Already have an account?{' '}
            <Link href="/authentication/login" style={{ color: '#228be6', textDecoration: 'none', fontWeight: 600 }}>
              Login
            </Link>
          </Text>
        </Paper>
      </Container>
    </Box>
  );
}