import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FileSignature, CheckCircle2 } from "lucide-react";

export default async function DigitalLOIPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      property: true,
      tenant: true,
      broker: true,
    }
  });

  if (!deal) return notFound();

  return (
    <div className="min-h-screen bg-[#060608] glass-desk py-20 px-4 font-sans relative">
      
      {/* The Physical Paper Contract */}
      <div className="max-w-4xl mx-auto skeuo-paper p-12 md:p-16 relative z-10">
        
        {/* Seal / Emblem (Skeuomorphic touch) */}
        <div className="absolute top-12 right-12 w-24 h-24 border-[3px] border-double border-gray-400 rounded-full flex items-center justify-center opacity-40 rotate-12 pointer-events-none">
          <div className="text-center">
            <div className="font-serif font-bold text-xs uppercase tracking-widest text-gray-500">Official</div>
            <div className="font-serif font-bold text-lg text-gray-600">LOI</div>
          </div>
        </div>

        <div className="flex justify-between items-start mb-12 border-b-2 border-gray-300 pb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#1a1a1a]">Letter of Intent</h1>
            <p className="text-gray-500 mt-2 font-mono text-sm tracking-widest uppercase">Ref: {deal.id.split('-')[0]}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-200 to-gray-300 p-4 rounded shadow-inner border border-gray-300 flex items-center justify-center">
            <FileSignature className="w-8 h-8 text-gray-700" />
          </div>
        </div>

        <div className="space-y-10 font-serif">
          
          <section className="grid grid-cols-2 gap-12 pb-8 border-b border-gray-200">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 font-mono">Property Demised</h3>
              <p className="font-bold text-xl text-gray-900 leading-tight">{deal.property.title}</p>
              <p className="text-gray-600 mt-1">{deal.property.address}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 font-mono">Tenant Entity</h3>
              <p className="font-bold text-xl text-gray-900 leading-tight">{deal.tenant.companyName || "Individual Entity"}</p>
              <p className="text-gray-600 mt-1">{deal.tenant.email}</p>
            </div>
          </section>

          <section className="bg-gray-200/50 p-8 border border-gray-300 shadow-inner">
            <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-widest border-b border-gray-300 pb-2 inline-block">Proposed Economic Terms</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-widest font-mono">Base Rent</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${deal.proposedRent?.toLocaleString() || "TBD"} <span className="text-lg font-normal text-gray-600">/ mo</span>
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-widest font-mono">Lease Term</p>
                <p className="text-3xl font-bold text-gray-900">
                  {deal.leaseTermMonths || "TBD"} <span className="text-lg font-normal text-gray-600">Months</span>
                </p>
              </div>
            </div>
          </section>

          <section className="pb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-widest border-b border-gray-300 pb-2 inline-block">Binding & Non-Binding Provisions</h3>
            <p className="text-gray-800 leading-relaxed text-lg">
              This Letter of Intent ("LOI") outlines the basic terms and conditions under which the Tenant 
              proposes to lease the Property. This LOI is strictly non-binding and is subject to the mutual execution of a formal 
              Lease Agreement satisfactory to both parties.
            </p>
          </section>

          {/* Signature Block */}
          <section className="pt-12 mt-12 border-t-2 border-gray-300 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-64 border-b border-gray-400 border-dashed mb-2 h-16 flex items-end justify-center pb-2">
               {/* Placeholder for cursive signature if signed */}
            </div>
            <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Authorized Signature</p>
            
            <button className="neu-button px-10 py-4 rounded-xl font-bold text-lg flex items-center gap-3 mt-4 hover:text-[#a1ebd6]">
              <CheckCircle2 className="w-6 h-6" /> Digitally Sign & Execute
            </button>
            <p className="text-gray-400 text-xs italic">By executing, you agree to transmit this document to the ownership group.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
