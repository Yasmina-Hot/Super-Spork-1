"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "ai/react";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { DEFAULT_FREE_MODEL } from "@/lib/models";

interface UserData {
  tier: "FREE" | "SUPER_SPORK";
  dailyMessages: number;
  dailyLimit: number;
}

export default function HomePage() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState(DEFAULT_FREE_MODEL);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then(setUserData)
      .catch(() => {});
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
    useChat({
      api: "/api/chat",
      body: { model: selectedModel, conversationId },
      onFinish: () => {
        if (conversationId) {
          router.push(`/chat/${conversationId}`);
        }
      },
    });

  const handleSend = async () => {
    if (!conversationId) {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: selectedModel }),
      });
      const conv = await res.json();
      setConversationId(conv.id);
    }
    handleSubmit(new Event("submit") as never);
  };

  const isAtLimit =
    userData?.tier === "FREE" &&
    userData.dailyMessages >= userData.dailyLimit;

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
              You&apos;ve used all {userData?.dailyLimit} free messages today.
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
          onChange={(v) => handleInputChange({ target: { value: v } } as React.ChangeEvent<HTMLTextAreaElement>)}
          onSubmit={handleSend}
          onStop={stop}
          isLoading={isLoading}
          disabled={!userData}
        />
      )}
    </div>
  );
}
