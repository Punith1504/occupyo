import { getMessagesWithUser } from "../actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import ChatInterface from "./ChatInterface";

export const dynamic = "force-dynamic";

export default async function ChatPage(
  props: {
    params: Promise<{ userId: string }>;
  }
) {
  const params = await props.params;
  const result = await getMessagesWithUser(params.userId);

  if (!result.success) {
    if (result.error === "Unauthorized") redirect("/sign-in");
    return <div className="p-8 text-center text-red-500">{result.error}</div>;
  }

  const { messages, partner, currentUserId } = result;

  if (!partner) {
    return <div className="p-8 text-center text-gray-500">User not found.</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/dashboard/messages"
          className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
            <User className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              {partner.companyName || partner.email}
            </h1>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              {partner.role}
            </p>
          </div>
        </div>
      </div>

      <ChatInterface 
        initialMessages={messages || []} 
        currentUserId={currentUserId!} 
        partnerId={params.userId} 
      />
    </div>
  );
}
