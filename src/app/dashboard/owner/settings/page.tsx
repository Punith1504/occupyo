import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsContent } from "@/components/SettingsContent";

export const dynamic = "force-dynamic";

export default async function OwnerSettingsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    if (process.env.NODE_ENV === "production") {
       return <div>Loading...</div>; 
    }
    redirect("/sign-in");
  }

  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { clerkUserId: userId || '' },
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }

  if (!user || (user.role !== "OWNER" && user.role !== "ADMIN")) {
    if (process.env.NODE_ENV === "production" && !userId) {
       return <div>Loading...</div>; 
    }
    redirect("/onboarding");
  }

  return (
    <div className="p-8">
      <SettingsContent initialData={{ companyName: user.companyName, phone: user.phone }} />
    </div>
  );
}
