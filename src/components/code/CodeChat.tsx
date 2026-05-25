"use client";

import { useChat } from "ai/react";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { useState } from "react";
import { DEFAULT_PAID_MODEL } from "@/lib/models";

interface CodeChatProps {
  userTier: "FREE" | "SUPER_SPORK";
  contextCode?: string;
}

export function CodeChat({ userTier, contextCode }: CodeChatProps) {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_PAID_MODEL);

  const systemPrompt = contextCode
    ? `You are Spork Code, an expert coding assistant. The user has shared the following code:\n\`\`\`\n${contextCode}\n\`\`\`\nHelp the user understand, debug, or improve this code.`
    : "You are Spork Code, an expert coding assistant. Help the user write, debug, and improve their code. Provide clear explanations and working examples.";

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
    useChat({
      api: "/api/chat",
      body: {
        model: selectedModel,
        messages: [{ role: "system", content: systemPrompt }],
      },
    });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e1e]">
        <ModelSelector
          value={selectedModel}
          onChange={setSelectedModel}
          userTier={userTier}
        />
        <span className="text-xs text-[#555]">
          {contextCode ? "Code context loaded" : "No code context"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

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
        placeholder="Ask about your code..."
      />
    </div>
  );
}
