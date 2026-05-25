import { Tier } from "@prisma/client";
import { FREE_MODELS, FREE_DAILY_LIMIT } from "./models";
import { AGENTS } from "./agents";

export function canUseModel(tier: Tier, modelId: string): boolean {
  if (tier === Tier.SUPER_SPORK) return true;
  return FREE_MODELS.some((m) => m.id === modelId);
}

export function hasReachedDailyLimit(
  tier: Tier,
  dailyMessages: number,
  lastReset: Date
): boolean {
  if (tier === Tier.SUPER_SPORK) return false;
  const today = new Date().toDateString();
  const resetDay = new Date(lastReset).toDateString();
  if (today !== resetDay) return false;
  return dailyMessages >= FREE_DAILY_LIMIT;
}

export function canUploadFiles(tier: Tier): boolean {
  return tier === Tier.SUPER_SPORK;
}

export function canAccessSporkCode(tier: Tier): boolean {
  return tier === Tier.SUPER_SPORK;
}

export function canUseAgent(tier: Tier, agentId: string): boolean {
  const agent = AGENTS.find((a) => a.id === agentId);
  if (!agent) return false;
  if (agent.tier === "free") return true;
  return tier === Tier.SUPER_SPORK;
}

export function getSystemPrompt(
  tier: Tier,
  options: {
    agentId?: string | null;
    customInstructions?: string | null;
    codeContext?: string | null;
    sporkCode?: boolean;
    canvas?: boolean;
    memoryContext?: string;
  } = {}
): string {
  const { agentId, customInstructions, codeContext, sporkCode, canvas, memoryContext } =
    options;

  // Agent persona takes priority over everything
  if (agentId) {
    const agent = AGENTS.find((a) => a.id === agentId);
    if (agent && canUseAgent(tier, agentId)) {
      let prompt = agent.systemPrompt;
      if (customInstructions) {
        prompt += `\n\nAdditional context about the user: ${customInstructions}`;
      }
      return prompt;
    }
  }

  // Canvas mode
  if (canvas) {
    const base = `You are Spork Canvas, an AI that generates rich, interactive artifacts. Always wrap your primary content in an <artifact> tag.

Supported artifact types:
- <artifact type="html"> — full HTML page rendered live in an iframe
- <artifact type="markdown"> — formatted document
- <artifact type="code" lang="javascript"> — code with syntax highlighting (use any language)

Format EXACTLY like this (do NOT use markdown code fences inside artifact tags):
<artifact type="html">
<!DOCTYPE html>
<html>...</html>
</artifact>

Always include a 1-2 sentence explanation before the artifact. When the user requests changes, output the COMPLETE updated artifact — never partial updates. Default to HTML artifacts unless the user asks for something else.`;
    if (customInstructions) return `${base}\n\nUser context: ${customInstructions}`;
    return base;
  }

  // Spork Code mode
  if (sporkCode) {
    const base = codeContext
      ? `You are Spork Code, an expert coding assistant. The user has shared code:\n\`\`\`\n${codeContext}\n\`\`\`\nHelp them understand, debug, or improve it. Be precise and practical.`
      : "You are Spork Code, an expert coding assistant. Help the user write, debug, and improve their code with clear explanations and working examples.";
    if (customInstructions) return `${base}\n\nUser context: ${customInstructions}`;
    return base;
  }

  // Paid tier — no artificial constraints, just custom instructions + memory if set
  if (tier === Tier.SUPER_SPORK) {
    const parts: string[] = [];
    if (customInstructions) parts.push(`User's custom instructions: ${customInstructions}`);
    if (memoryContext) parts.push(`What you know about this user:\n${memoryContext}`);
    if (parts.length === 0) return "";
    return `You are Spork, a powerful AI assistant.\n\n${parts.join("\n\n")}`;
  }

  // Free tier — constraining system prompt
  const freePrompt =
    "You are Spork, a fast and helpful AI assistant. Provide accurate, clear responses. Be concise and focused — avoid unnecessary length or padding.";

  if (customInstructions) {
    return `${freePrompt}\n\nUser context: ${customInstructions}`;
  }

  return freePrompt;
}
