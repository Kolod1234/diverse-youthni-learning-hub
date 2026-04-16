export const POWER_UP_DEFINITIONS = {
  double_points: { label: 'Double', icon: '⚡', cost: 120 },
  shield: { label: 'Shield', icon: '🛡', cost: 110 },
  skip_question: { label: 'Skip', icon: '⏭', cost: 140 },
  fifty_fifty: { label: '50/50', icon: '⭕', cost: 100 },
  freeze_opponents: { label: 'Freeze', icon: '❄️', cost: 180 },
  reveal_answer: { label: 'Reveal', icon: '💡', cost: 160 },
  steal_points: { label: 'Steal', icon: '🪙', cost: 200 },
};

export const POWER_UP_KEYS = Object.keys(POWER_UP_DEFINITIONS);

export function createEmptyPowerUps() {
  return {
    double_points: 0,
    shield: 0,
    skip_question: 0,
    fifty_fifty: 0,
    freeze_opponents: 0,
    reveal_answer: 0,
    steal_points: 0,
  };
}

export function createEmptyEffects() {
  return {
    frozen_until_question: -1,
    reveal_answer_for_question: -1,
  };
}