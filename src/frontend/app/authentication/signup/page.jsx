'use client';

import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Grid,
  Box,
} from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

/* ---------------- Schema ---------------- */
const signupSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const notify = (t, m, c, i) =>
    notifications.show({ title: t, message: m, color: c, icon: i });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

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

      notify('Success', 'Account created', 'green', <IconCheck />);

      reset();

      setTimeout(() => router.push('/authentication/login'), 800);
    } catch (err) {
      notify('Error', err.message, 'red', <IconX />);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={500}>
      <Paper p="xl">
        <Box ta="center">
          <Image src="/logo.jpg" alt="logo" width={90} height={70} />
        </Box>

        <Title ta="center">Sign Up</Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid>
            <Grid.Col span={6}>
              <TextInput label="First Name" {...register('firstName')} error={errors.firstName?.message} />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Last Name" {...register('lastName')} error={errors.lastName?.message} />
            </Grid.Col>
          </Grid>

          <TextInput mt="md" label="Email" {...register('email')} error={errors.email?.message} />
          <TextInput mt="md" label="Phone" {...register('phone')} error={errors.phone?.message} />

          <PasswordInput mt="md" label="Password" {...register('password')} error={errors.password?.message} />
          <PasswordInput mt="md" label="Confirm Password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />

          <Button fullWidth mt="xl" type="submit" loading={loading}>
            Create Account
          </Button>
        </form>
      </Paper>
    </Container>
  );
}