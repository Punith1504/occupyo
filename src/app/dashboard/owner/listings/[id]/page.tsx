import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import EditPropertyClient from "./EditPropertyClient";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user || (user.role !== "OWNER" && user.role !== "ADMIN")) {
    redirect("/dashboard");
  }

  const propertyId = params.id;

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { images: true },
  });

  if (!property || property.ownerId !== user.id) {
    redirect("/dashboard/owner");
  }

  return <EditPropertyClient property={property} initialImages={property.images} />;
}
