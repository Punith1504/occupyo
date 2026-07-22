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

  const columns: { id: DealStatus; label: string }[] = [
    { id: "INQUIRY", label: "Inquiry" },
    { id: "TOUR", label: "Property Tour" },
    { id: "LOI_SUBMITTED", label: "LOI Submitted" },
    { id: "LEASE_SIGNED", label: "Lease Signed" },
  ];

  return (
    <div className="min-h-screen bg-[#060608] bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Deal Pipeline</h1>
            <p className="text-gray-400 mt-1">Track and manage CRE transactions from inquiry to closed won.</p>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar">
          {columns.map(col => {
            const columnDeals = deals.filter(d => d.status === col.id);
            return (
              <div key={col.id} className="glass-panel p-4 min-w-[320px] w-[320px] flex flex-col h-[75vh]">
                <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="font-bold text-white tracking-wide uppercase text-sm">{col.label}</h3>
                  <span className="bg-white/10 text-white text-xs px-2 py-0.5 rounded-full">{columnDeals.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {columnDeals.map(deal => (
                    <div key={deal.id} className="skeuo-folder p-4 hover:-translate-y-1 transition-transform cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-lg leading-tight line-clamp-1">{deal.property.title}</div>
                      </div>
                      <div className="text-sm text-[#78350f]/80 mb-3 line-clamp-1 border-b border-[#78350f]/20 pb-2">
                        {deal.property.address}
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-[#78350f]/70">Tenant</div>
                          <div className="font-medium text-[#78350f]">{deal.tenant.companyName || deal.tenant.email.split('@')[0]}</div>
                        </div>
                        
                        {deal.loiDocumentUrl ? (
                          <Link href={`/dashboard/deals/${deal.id}/loi`} className="neu-button px-3 py-1.5 text-xs font-bold bg-[#1e293b] text-white flex items-center gap-1 shadow-md">
                            <FileSignature className="w-3 h-3" /> View LOI
                          </Link>
                        ) : (
                          deal.proposedRent && (
                            <div className="text-right">
                              <div className="text-xs font-semibold uppercase tracking-wider text-[#78350f]/70">Proposed</div>
                              <div className="font-bold text-green-800">${deal.proposedRent.toLocaleString()}/mo</div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {columnDeals.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-white/30 text-sm font-medium">
                      Drop deals here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
