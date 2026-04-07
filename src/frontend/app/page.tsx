"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader, Center } from "@mantine/core";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page immediately
    router.push("/authentication/login");
  }, [router]);

  // Optional: show a loader while redirecting
  return (
    <Center style={{ minHeight: "100vh" }}>
      <Loader size="xl" color="blue" />
    </Center>
  );
}