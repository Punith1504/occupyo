"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function saveUserRoleAndDetails(data: {
  clerkUserId: string;
  email: string;
  role: "OWNER" | "TENANT";
  companyName: string;
  phone: string;
}) {
  try {
    const user = await prisma.user.upsert({
      where: { clerkUserId: data.clerkUserId },
      update: {
        role: data.role as Role,
        companyName: data.companyName,
        phone: data.phone,
      },
      create: {
        clerkUserId: data.clerkUserId,
        email: data.email,
        role: data.role as Role,
        companyName: data.companyName,
        phone: data.phone,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error saving user details:", error);
    return { success: false, error: "Failed to save user details" };
  }
}
