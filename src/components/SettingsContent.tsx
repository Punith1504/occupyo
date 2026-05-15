"use client";

import { UserProfile } from "@clerk/nextjs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building2, Phone } from "lucide-react";
import { updateBusinessDetails } from "@/app/dashboard/settings/actions";

const formSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  phone: z.string().min(10, "Valid phone number required"),
});

export function SettingsContent({ initialData }: { initialData: { companyName: string | null; phone: string | null } }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: initialData.companyName || "",
      phone: initialData.phone || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const result = await updateBusinessDetails(values);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to update details");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your personal details, profile photo, and security.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Clerk UserProfile handles Profile Photo, Name, Email, Password, etc. */}
        <div className="flex justify-center p-6 bg-gray-50 border-b border-gray-200">
          <UserProfile 
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 w-full max-w-full m-0 p-0",
                navbar: "hidden", // Hide clerk sidebar if you just want the profile section, or keep it. Let's keep it clean.
                pageScrollBox: "p-0",
              }
            }}
          />
        </div>

        <div className="p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Details</h2>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-md text-sm border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 p-4 rounded-md text-sm border border-green-100">
                Business details updated successfully!
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  Company Name
                </label>
                <input 
                  {...form.register("companyName")}
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                  placeholder="Acme Corp"
                />
                {form.formState.errors.companyName && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.companyName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  Phone Number
                </label>
                <input 
                  {...form.register("phone")}
                  className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                  placeholder="(555) 123-4567"
                />
                {form.formState.errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-black text-white px-6 py-2.5 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {loading ? "Saving..." : "Save Business Details"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
