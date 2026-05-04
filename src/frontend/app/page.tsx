"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader, Center } from "@mantine/core";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    const isAuthenticated = localStorage.getItem("isAuthenticated");

    if (isAuthenticated === "true" && userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role && user.role.toLowerCase() === "admin") {
          router.push("/admin");
        } else {
          router.push("/user/dashboard");
        }
      } catch (e) {
        router.push("/authentication/login");
      }
    } else {
      router.push("/authentication/login");
    }
  }, [router]);

  // Optional: show a loader while redirecting
  return (
    <Center style={{ minHeight: "100vh" }}>
      <Loader size="xl" color="blue" />
    </Center>
  );
}