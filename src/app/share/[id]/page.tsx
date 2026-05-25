import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { db } from "@/lib/db";
import { getAgent } from "@/lib/agents";
import { ALL_MODELS } from "@/lib/models";
import { Eye, Heart, GitFork, ArrowRight } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

function getModelName(modelId: string): string {
  return ALL_MODELS.find((m) => m.id === modelId)?.name ?? modelId.split("/").pop() ?? modelId;
}

export default async function SharePage({ params }: PageProps) {
  const { id } = await params;

  const conversation = await db.conversation.findFirst({
    where: { id, isPublic: true },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      user: { select: { email: true } },
    },
  });

  if (!conversation) notFound();

  // Increment views server-side
  await db.conversation.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  const agent = conversation.agentId ? getAgent(conversation.agentId) : null;
  const modelName = getModelName(conversation.model);
  const authorHandle = conversation.user.email.split("@")[0];

  return (
    <div className="min-h-full bg-[#0a0a0a] text-[#f0f0f0]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#2a2a2a] bg-[#0a0a0a]/90 backdrop-blur px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-black tracking-tight text-white">
            SPORK
          </Link>
          <div className="flex items-center gap-3 text-xs text-[#555]">
            <span className="flex items-center gap-1">
              <Eye size={10} />
              {conversation.views + 1}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={10} />
              {conversation.likes}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Conversation meta */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white mb-2">{conversation.title}</h1>
          <div className="flex items-center gap-3 text-xs text-[#555]">
            <span className="bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-0.5 rounded">
              {modelName}
            </span>
            {agent && (
              <span className="flex items-center gap-1" style={{ color: agent.accentColor }}>
                {agent.emoji} {agent.name}
              </span>
            )}
            <span>by @{authorHandle}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-6 mb-10">
          {conversation.messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div key={msg.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                    isUser
                      ? "bg-[#2a2a2a] text-[#888]"
                      : "bg-[#a78bfa]/20 border border-[#a78bfa]/30 text-[#a78bfa]"
                  }`}
                >
                  {isUser ? "U" : agent?.emoji ?? "S"}
                </div>
                <div className={`flex-1 min-w-0 ${isUser ? "flex justify-end" : ""}`}>
                  {isUser ? (
                    <div className="inline-block max-w-[85%] bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-[#e0e0e0]">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="prose text-sm leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="border border-[#2a2a2a] rounded-2xl p-6 text-center bg-[#111]">
          <p className="text-sm text-[#888] mb-4">
            Want to continue this conversation or start your own?
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#a78bfa] text-white rounded-xl text-sm font-semibold hover:bg-[#9061f9] transition-colors"
            >
              Start chatting free
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#2a2a2a] text-[#888] rounded-xl text-sm hover:text-white hover:border-[#3a3a3a] transition-colors"
            >
              <GitFork size={13} />
              Fork this chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
