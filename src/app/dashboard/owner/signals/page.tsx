import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MapPin, DollarSign, Building, Phone, Calendar, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExternalSignalsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true, role: true }
  });

  if (!user || (user.role !== "BROKER" && user.role !== "OWNER")) {
    redirect("/dashboard");
  }

  // Fetch signals
  let signals: any[] = [];
  try {
    signals = await prisma.externalLeadSignal.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Error fetching signals:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">External Demand Signals</h1>
        <p className="mt-2 text-sm text-gray-600">
          AI-extracted leads from public construction permits and business registrations. 
          Use these signals to proactively prospect for tenants.
        </p>
      </div>

      {signals.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No signals found</h3>
          <p className="text-sm text-gray-500">
            Check back later. The automated pipeline ingests data daily.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {signals.map((signal) => (
            <div key={signal.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-purple-100 text-purple-700">
                    {signal.source}
                  </span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  signal.status === "UNVERIFIED" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                }`}>
                  {signal.status}
                </span>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="space-y-3">
                  {signal.propertyType && (
                    <div className="flex items-start gap-2.5">
                      <Building className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <span className="text-gray-500 block text-xs">Property Type</span>
                        <span className="font-medium text-gray-900">{signal.propertyType}</span>
                      </div>
                    </div>
                  )}
                  {signal.location && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <span className="text-gray-500 block text-xs">Location</span>
                        <span className="font-medium text-gray-900">{signal.location}</span>
                      </div>
                    </div>
                  )}
                  {signal.size && (
                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <span className="text-gray-500 block text-xs">Size</span>
                        <span className="font-medium text-gray-900">{signal.size}</span>
                      </div>
                    </div>
                  )}
                  {signal.budgetOrTimeline && (
                    <div className="flex items-start gap-2.5">
                      <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <span className="text-gray-500 block text-xs">Budget/Timeline</span>
                        <span className="font-medium text-gray-900">{signal.budgetOrTimeline}</span>
                      </div>
                    </div>
                  )}
                  {signal.contactInfo && (
                    <div className="flex items-start gap-2.5">
                      <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <span className="text-gray-500 block text-xs">Contact</span>
                        <span className="font-medium text-blue-600 truncate">{signal.contactInfo}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-medium mb-1">Raw Extraction Source</p>
                  <p className="text-xs text-gray-600 line-clamp-3 bg-gray-50 p-2 rounded border border-gray-100">
                    {signal.rawText}
                  </p>
                </div>
                {signal.extractionConfidence && (
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                    <span>AI Confidence</span>
                    <span className="font-medium">{(signal.extractionConfidence * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
