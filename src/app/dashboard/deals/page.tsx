import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, FileSignature, CheckCircle, Clock } from "lucide-react";
import { DealStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function DealPipelineTracker() {
  const deals = await prisma.deal.findMany({
    include: {
      property: true,
      tenant: true,
      broker: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  const getStatusColor = (status: DealStatus) => {
    switch(status) {
      case "INQUIRY": return "bg-gray-100 text-gray-800";
      case "TOUR": return "bg-blue-100 text-blue-800";
      case "LOI_SUBMITTED": return "bg-purple-100 text-purple-800";
      case "LEASE_SIGNED": return "bg-green-100 text-green-800";
      case "CLOSED": return "bg-black text-white";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: DealStatus) => {
    switch(status) {
      case "INQUIRY": return <Clock className="w-4 h-4" />;
      case "TOUR": return <Building2 className="w-4 h-4" />;
      case "LOI_SUBMITTED": return <FileSignature className="w-4 h-4" />;
      case "LEASE_SIGNED": return <CheckCircle className="w-4 h-4" />;
      case "CLOSED": return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Deal Pipeline</h1>
          <p className="text-gray-500 mt-1">Track and manage CRE transactions from inquiry to closed won.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {deals.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No active deals in the pipeline yet.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Property</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Terms</th>
                <th className="px-6 py-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deals.map(deal => (
                <tr key={deal.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-medium text-gray-900">{deal.property.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-[200px]">{deal.property.address}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-medium text-gray-900">{deal.tenant.companyName || "Individual"}</div>
                    <div className="text-sm text-gray-500">{deal.tenant.email}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase ${getStatusColor(deal.status)}`}>
                      {getStatusIcon(deal.status)}
                      {deal.status.replace("_", " ")}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {deal.proposedRent ? (
                      <div>
                        <div className="font-medium text-gray-900">${deal.proposedRent.toLocaleString()}/mo</div>
                        <div className="text-sm text-gray-500">{deal.leaseTermMonths} Months</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-sm">Not proposed</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {deal.loiDocumentUrl ? (
                      <Link 
                        href={deal.loiDocumentUrl}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                      >
                        <FileSignature className="w-4 h-4" /> View LOI
                      </Link>
                    ) : (
                      <span className="text-gray-400 text-sm">No Document</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
