import { Badge } from '../types';
import { badges } from '../data/mockData';

interface BadgeProgress {
  currentBadge: Badge | null;
  nextBadge: Badge | null;
  progress: number;
  pullUpsNeeded: number;
}

export function calculateBadgeProgress(pullUps: number, gender: string = 'Male'): BadgeProgress {
  // Sort badges by required pull-ups
  const sortedBadges = [...badges].sort((a, b) => 
    (a.criteria.value as number) - (b.criteria.value as number)
  );

  // Find current and next badge
  let currentBadge: Badge | null = null;
  let nextBadge: Badge | null = null;

  for (let i = 0; i < sortedBadges.length; i++) {
    if (pullUps >= sortedBadges[i].criteria.value) {
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
    progress = (pullUps / (nextBadge.criteria.value as number)) * 100;
    pullUpsNeeded = (nextBadge.criteria.value as number) - pullUps;
  } else if (currentBadge && nextBadge) {
    // Between badges
    const range = (nextBadge.criteria.value as number) - (currentBadge.criteria.value as number);
    const progressInRange = pullUps - (currentBadge.criteria.value as number);
    progress = (progressInRange / range) * 100;
    pullUpsNeeded = (nextBadge.criteria.value as number) - pullUps;
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
  const pullUps = badge.criteria.value as number;
  return `Requires ${pullUps} pull-ups in a single set`;
} 