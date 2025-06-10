interface BadgeRequirement {
  pullUps: number;
  name: string;
  description: string;
}

export const getBadgeRequirements = (): BadgeRequirement[] => [
  {
    pullUps: 1,
    name: 'Recruit',
    description: 'Complete your first pull-up'
  },
  {
    pullUps: 5,
    name: 'Proven',
    description: 'Complete 5 pull-ups'
  },
  {
    pullUps: 10,
    name: 'Hardened',
    description: 'Complete 10 pull-ups'
  },
  {
    pullUps: 20,
    name: 'Operator',
    description: 'Complete 20 pull-ups'
  },
  {
    pullUps: 30,
    name: 'Elite',
    description: 'Complete 30 pull-ups'
  }
];

export const calculateBadgeProgress = (currentPullUps: number): {
  currentBadge: BadgeRequirement;
  nextBadge: BadgeRequirement | null;
  progress: number;
} => {
  const badges = getBadgeRequirements();
  
  // Find current badge
  const currentBadge = [...badges].reverse().find(badge => currentPullUps >= badge.pullUps) || badges[0];
  
  // Find next badge
  const nextBadgeIndex = badges.findIndex(badge => badge.pullUps > currentPullUps);
  const nextBadge = nextBadgeIndex !== -1 ? badges[nextBadgeIndex] : null;
  
  // Calculate progress
  let progress = 0;
  if (nextBadge) {
    const prevBadge = badges[nextBadgeIndex - 1] || { pullUps: 0 };
    const range = nextBadge.pullUps - prevBadge.pullUps;
    const current = currentPullUps - prevBadge.pullUps;
    progress = Math.min(100, Math.max(0, (current / range) * 100));
  } else {
    progress = 100;
  }
  
  return {
    currentBadge,
    nextBadge,
    progress
  };
}; 