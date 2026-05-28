import { getConversations } from "./actions";
import Link from "next/link";
import { MessageSquare, User, Clock, ChevronRight } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MessagesInboxPage() {
  const result = await getConversations();

  if (!result.success && result.error === "Unauthorized") {
    redirect("/sign-in");
  }

  const conversations = result.conversations || [];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 mt-1">Chat directly with property owners and tenants.</p>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            When you contact an owner or tenant, your conversation history will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {conversations.map((convo: any, index: number) => {
            const partner = convo.partner;
            const msg = convo.lastMessage;
            const isUnread = convo.unreadCount > 0;

            return (
              <Link 
                href={`/dashboard/messages/${partner.id}`} 
                key={partner.id}
                className={`flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors ${
                  index !== conversations.length - 1 ? 'border-b border-gray-100' : ''
                } ${isUnread ? 'bg-blue-50/30' : ''}`}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  {isUnread && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                      {convo.unreadCount}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`text-base truncate ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-900'}`}>
                      {partner.companyName || partner.email}
                    </h3>
                    <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0 ml-2">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                      {partner.role}
                    </span>
                    <p className={`text-sm truncate ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                      {msg.senderId === partner.id ? '' : 'You: '}
                      {msg.content}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
