"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useChat } from "ai/react";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { AgentSelector } from "@/components/agents/AgentSelector";
import { ForkButton } from "@/components/chat/ForkButton";
import { DEFAULT_FREE_MODEL } from "@/lib/models";
import { Sparkles } from "lucide-react";
import type { Message } from "ai";

interface ConversationData {
  id: string;
  title: string;
  model: string;
  agentId: string | null;
  messages: Array<{ id: string; role: string; content: string }>;
}

interface UserData {
  tier: "FREE" | "SUPER_SPORK";
  dailyMessages: number;
  dailyLimit: number;
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_FREE_MODEL);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [loaded, setLoaded] = useState(false);
  const sentFirstRef = useRef(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/conversations/${id}`).then((r) => r.json()),
      fetch("/api/user").then((r) => r.json()),
    ])
      .then(([conv, user]: [ConversationData, UserData]) => {
        setSelectedModel(conv.model ?? DEFAULT_FREE_MODEL);
        setSelectedAgent(conv.agentId ?? null);
        setInitialMessages(
          conv.messages.map((m) => ({
            id: m.id,
            role: m.role as Message["role"],
            content: m.content,
          }))
        );
        setUserData(user);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [id]);

  const { messages, input, setInput, append, isLoading, stop } = useChat({
    api: "/api/chat",
    body: { model: selectedModel, conversationId: id, agentId: selectedAgent },
    initialMessages,
  });

  // Auto-send ?q= first message after conversation loads
  useEffect(() => {
    const q = searchParams.get("q");
    if (!q || !loaded || sentFirstRef.current || isLoading) return;
    sentFirstRef.current = true;
    router.replace(`/chat/${id}`);
    append({ role: "user", content: q });
  }, [loaded, searchParams, id, router, append, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    append({ role: "user", content: input });
    setInput("");
  };

  const isAtLimit =
    userData?.tier === "FREE" &&
    userData.dailyMessages >= userData.dailyLimit;

  if (!loaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#a78bfa]/30 border-t-[#a78bfa] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e1e1e]">
        {userData && (
          <>
            <ModelSelector
              value={selectedModel}
              onChange={setSelectedModel}
              userTier={userData.tier}
            />
            <AgentSelector
              value={selectedAgent}
              onChange={setSelectedAgent}
              userTier={userData.tier}
            />
            <div className="ml-auto">
              <ForkButton
                conversationId={id}
                userTier={userData.tier}
                onForked={(newId) => router.push(`/chat/${newId}`)}
              />
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Input */}
      {isAtLimit ? (
        <div className="px-4 pb-4 pt-2 max-w-3xl mx-auto w-full">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 text-center">
            <p className="text-sm text-[#888] mb-3">
              Daily limit reached. Upgrade for unlimited messages.
            </p>
            <a
              href="/settings"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#a78bfa] text-white rounded-lg text-sm font-semibold hover:bg-[#9061f9] transition-colors"
            >
              <Sparkles size={14} />
              Upgrade to Super Spork
            </a>
          </div>
        </div>
      ) : (
        <MessageInput
          value={input}
          onChange={setInput}
          onSubmit={handleSend}
          onStop={stop}
          isLoading={isLoading}
          disabled={!userData}
        />
      )}
    </div>
  );
}
