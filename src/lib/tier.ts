import { Tier } from "@prisma/client";
import { FREE_MODELS, FREE_DAILY_LIMIT } from "./models";

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
  const now = new Date();
  const resetDate = new Date(lastReset);
  const daysSinceReset =
    (now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceReset >= 1) return false;
  return dailyMessages >= FREE_DAILY_LIMIT;
}

export function canUploadFiles(tier: Tier): boolean {
  return tier === Tier.SUPER_SPORK;
}

export function canAccessSporkCode(tier: Tier): boolean {
  return tier === Tier.SUPER_SPORK;
}
