"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { saveUserRoleAndDetails } from "./actions";

const formSchema = z.object({
  role: z.enum(["OWNER", "TENANT"]),
  companyName: z.string().min(2, "Company name is required"),
  phone: z.string().min(10, "Valid phone number required"),
});

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "TENANT",
      companyName: "",
      phone: "",
    },
  });

  if (!isLoaded) return <div className="p-8 text-center">Loading...</div>;
  if (!user) {
    router.push("/sign-in");
    return null;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError("");
    try {
      const result = await saveUserRoleAndDetails({
        clerkUserId: user!.id,
        email: user!.primaryEmailAddress?.emailAddress || "",
        ...values,
      });

      if (result?.success) {
        if (values.role === "OWNER") {
          router.push("/dashboard/owner");
        } else {
          router.push("/search");
        }
      } else {
        setError(result?.error || "Failed to save details");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Complete your profile</h1>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`border rounded-lg p-4 cursor-pointer text-center ${form.watch("role") === "OWNER" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                <input type="radio" value="OWNER" {...form.register("role")} className="sr-only" />
                <span className="font-medium text-gray-900">Property Owner</span>
              </label>
              <label className={`border rounded-lg p-4 cursor-pointer text-center ${form.watch("role") === "TENANT" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                <input type="radio" value="TENANT" {...form.register("role")} className="sr-only" />
                <span className="font-medium text-gray-900">Tenant</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input 
              {...form.register("companyName")}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Acme Corp"
            />
            {form.formState.errors.companyName && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.companyName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              {...form.register("phone")}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="(555) 123-4567"
            />
            {form.formState.errors.phone && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white rounded-md py-3 font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
