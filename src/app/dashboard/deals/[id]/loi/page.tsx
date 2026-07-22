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
    <div className="max-w-4xl mx-auto p-8 pt-20">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Digital Letter of Intent (LOI)</h1>
            <p className="text-gray-500 mt-2">Deal Reference: {deal.id}</p>
          </div>
          <div className="bg-black/5 p-4 rounded-xl flex items-center justify-center">
            <FileSignature className="w-8 h-8 text-black" />
          </div>
        </div>

        <div className="space-y-8">
          <section className="grid grid-cols-2 gap-8 pb-8 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Property Details</h3>
              <p className="font-medium text-lg text-gray-900">{deal.property.title}</p>
              <p className="text-gray-600">{deal.property.address}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Tenant Details</h3>
              <p className="font-medium text-lg text-gray-900">{deal.tenant.companyName || "Individual"}</p>
              <p className="text-gray-600">{deal.tenant.email}</p>
            </div>
          </section>

          <section className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Proposed Terms</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Proposed Monthly Rent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${deal.proposedRent?.toLocaleString() || "TBD"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Lease Term</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deal.leaseTermMonths || "TBD"} Months
                </p>
              </div>
            </div>
          </section>

          <section className="pb-8 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Terms & Conditions</h3>
            <p className="text-gray-600 leading-relaxed">
              This Letter of Intent ("LOI") outlines the basic terms and conditions under which the Tenant 
              proposes to lease the Property. This LOI is non-binding and subject to the execution of a formal 
              Lease Agreement satisfactory to both parties.
            </p>
          </section>

          <section className="flex flex-col items-center justify-center pt-8 text-center space-y-4">
            <p className="text-gray-500">By digitally signing, you agree to submit this LOI for owner review.</p>
            <button className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Digitally Sign & Submit
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
