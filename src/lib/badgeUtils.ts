import { Badge } from '../types/index.ts';
import { badges } from '../data/mockData';

interface BadgeProgress {
  currentBadge: Badge | null;
  nextBadge: Badge | null;
  progress: number;
  pullUpsNeeded: number;
}

export function calculateBadgeProgress(pullUps: number): BadgeProgress {
  // Sort badges by required pull-ups
  const sortedBadges = [...badges].sort((a, b) => 
    (Number(a.criteria.value)) - (Number(b.criteria.value))
  );

  // Find current and next badge
  let currentBadge: Badge | null = null;
  let nextBadge: Badge | null = null;

  for (let i = 0; i < sortedBadges.length; i++) {
    if (pullUps >= Number(sortedBadges[i].criteria.value)) {
      currentBadge = sortedBadges[i];
      nextBadge = sortedBadges[i + 1] || null;
    } else {
      if (!currentBadge) {
        nextBadge = sortedBadges[i];
      }
      break;
    }
  }

  // Calculate progress and pull-ups needed
  let progress = 0;
  let pullUpsNeeded = 0;

  if (!currentBadge && nextBadge) {
    // Haven't reached first badge yet
    progress = (pullUps / Number(nextBadge.criteria.value)) * 100;
    pullUpsNeeded = Number(nextBadge.criteria.value) - pullUps;
  } else if (currentBadge && nextBadge) {
    // Between badges
    const range = Number(nextBadge.criteria.value) - Number(currentBadge.criteria.value);
    const progressInRange = pullUps - Number(currentBadge.criteria.value);
    progress = (progressInRange / range) * 100;
    pullUpsNeeded = Number(nextBadge.criteria.value) - pullUps;
  } else if (currentBadge && !nextBadge) {
    // Reached highest badge
    progress = 100;
    pullUpsNeeded = 0;
  }

  return {
    currentBadge,
    nextBadge,
    progress: Math.min(100, Math.max(0, progress)),
    pullUpsNeeded
  };
}

export function getBadgeRequirements(badge: Badge): string {
  const pullUps = Number(badge.criteria.value);
  return `Requires ${pullUps} pull-ups in a single set`;
} 