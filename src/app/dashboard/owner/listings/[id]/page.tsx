import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import EditPropertyClient from "./EditPropertyClient";
import ErrorBoundary from "@/components/ErrorBoundary";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user || ((user.role as string) !== "OWNER" && (user.role as string) !== "ADMIN")) {
    redirect("/dashboard");
  }

  const { id: propertyId } = await params;

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { images: true },
  });

  if (!property || property.ownerId !== user.id) {
    redirect("/dashboard/owner");
  }

  return (
    <ErrorBoundary>
      <EditPropertyClient 
        property={JSON.parse(JSON.stringify(property))} 
        initialImages={property.images} 
      />
    </ErrorBoundary>
  );
}
