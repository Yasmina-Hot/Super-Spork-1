"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useChat } from "ai/react";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { DEFAULT_FREE_MODEL } from "@/lib/models";
import type { Message } from "ai";

interface ConversationData {
  id: string;
  title: string;
  model: string;
  messages: Array<{ id: string; role: string; content: string }>;
}

interface UserData {
  tier: "FREE" | "SUPER_SPORK";
  dailyMessages: number;
  dailyLimit: number;
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_FREE_MODEL);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/conversations/${id}`).then((r) => r.json()),
      fetch("/api/user").then((r) => r.json()),
    ])
      .then(([conv, user]: [ConversationData, UserData]) => {
        setSelectedModel(conv.model ?? DEFAULT_FREE_MODEL);
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

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
    useChat({
      api: "/api/chat",
      body: { model: selectedModel, conversationId: id },
      initialMessages,
    });

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
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e1e]">
        {userData && (
          <ModelSelector
            value={selectedModel}
            onChange={setSelectedModel}
            userTier={userData.tier}
          />
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
              className="inline-block px-4 py-2 bg-[#a78bfa] text-white rounded-lg text-sm font-semibold hover:bg-[#9061f9] transition-colors"
            >
              Upgrade to Super Spork
            </a>
          </div>
        </div>
      ) : (
        <MessageInput
          value={input}
          onChange={(v) =>
            handleInputChange({
              target: { value: v },
            } as React.ChangeEvent<HTMLTextAreaElement>)
          }
          onSubmit={() => handleSubmit(new Event("submit") as never)}
          onStop={stop}
          isLoading={isLoading}
          disabled={!userData}
        />
      )}
    </div>
  );
}
