/** VS-style upgrade cards for Director Rank level-ups */

export type UpgradeRarity = 'common' | 'rare' | 'epic';

export interface UpgradeCard {
  id: string;
  name: string;
  description: string;
  rarity: UpgradeRarity;
  effect: UpgradeEffect;
}

export type UpgradeEffect =
  | { type: 'match_quality'; value: number }
  | { type: 'volunteer_pool'; value: number }
  | { type: 'auto_rest'; value: boolean }
  | { type: 'relief_transfer'; value: number }
  | { type: 'disease_insight'; disease: string }
  | { type: 'profiling_speed'; value: number }
  | { type: 'trust_bonus'; value: number }
  | { type: 'rp_bonus'; value: number }
  | { type: 'network_capacity'; value: number }
  | { type: 'tick_relief'; value: number }
  | { type: 'mortality_reduction'; value: number }
  | { type: 'combo_duration'; value: number };

export const UPGRADE_CARDS: UpgradeCard[] = [
  { id: 'match-5', name: 'HLA Tuning I', description: '+5% match quality on all assignments', rarity: 'common', effect: { type: 'match_quality', value: 0.05 } },
  { id: 'match-10', name: 'HLA Tuning II', description: '+10% match quality on all assignments', rarity: 'rare', effect: { type: 'match_quality', value: 0.1 } },
  { id: 'vol-2', name: 'Recruit Drive', description: '+2 volunteers to your pool', rarity: 'common', effect: { type: 'volunteer_pool', value: 2 } },
  { id: 'vol-5', name: 'Mass Outreach', description: '+5 volunteers to your pool', rarity: 'rare', effect: { type: 'volunteer_pool', value: 5 } },
  { id: 'vol-10', name: 'National Registry', description: '+10 volunteers to your pool', rarity: 'epic', effect: { type: 'volunteer_pool', value: 10 } },
  { id: 'auto-rest', name: 'Wellness Protocol', description: 'Auto-rest exhausted volunteers each tick', rarity: 'rare', effect: { type: 'auto_rest', value: true } },
  { id: 'relief-10', name: 'Burden Amplifier', description: '+10% relief transfer efficiency', rarity: 'common', effect: { type: 'relief_transfer', value: 0.1 } },
  { id: 'relief-20', name: 'Deep Channeling', description: '+20% relief transfer efficiency', rarity: 'epic', effect: { type: 'relief_transfer', value: 0.2 } },
  { id: 'insight-sepsis', name: 'Sepsis Insight', description: 'Unlock disease insight: Sepsis', rarity: 'rare', effect: { type: 'disease_insight', disease: 'Sepsis' } },
  { id: 'insight-covid', name: 'COVID Insight', description: 'Unlock disease insight: COVID-19', rarity: 'rare', effect: { type: 'disease_insight', disease: 'COVID-19' } },
  { id: 'insight-cancer', name: 'Oncology Insight', description: 'Unlock disease insight: Cancer pain', rarity: 'epic', effect: { type: 'disease_insight', disease: 'Cancer pain' } },
  { id: 'profile-20', name: 'Rapid Profiling', description: 'Profiling speed +20%', rarity: 'common', effect: { type: 'profiling_speed', value: 0.2 } },
  { id: 'profile-40', name: 'Express Typing', description: 'Profiling speed +40%', rarity: 'rare', effect: { type: 'profiling_speed', value: 0.4 } },
  { id: 'trust-5', name: 'Transparency Report', description: '+5 Trust permanently', rarity: 'common', effect: { type: 'trust_bonus', value: 5 } },
  { id: 'trust-10', name: 'Public Ledger', description: '+10 Trust permanently', rarity: 'rare', effect: { type: 'trust_bonus', value: 10 } },
  { id: 'rp-50', name: 'Relief Reserve', description: '+50 Relief Points immediately', rarity: 'common', effect: { type: 'rp_bonus', value: 50 } },
  { id: 'rp-150', name: 'Emergency Fund', description: '+150 Relief Points immediately', rarity: 'epic', effect: { type: 'rp_bonus', value: 150 } },
  { id: 'net-3', name: 'Network Expansion', description: '+3 global volunteer slots', rarity: 'common', effect: { type: 'network_capacity', value: 3 } },
  { id: 'net-8', name: 'Grid Upgrade', description: '+8 global volunteer slots', rarity: 'rare', effect: { type: 'network_capacity', value: 8 } },
  { id: 'tick-relief', name: 'Passive Drain', description: '+2 RP per tick from all active patients', rarity: 'rare', effect: { type: 'tick_relief', value: 2 } },
  { id: 'mort-5', name: 'Stabilizer Serum', description: '-5% mortality risk growth rate', rarity: 'common', effect: { type: 'mortality_reduction', value: 0.05 } },
  { id: 'mort-10', name: 'Crisis Shield', description: '-10% mortality risk growth rate', rarity: 'epic', effect: { type: 'mortality_reduction', value: 0.1 } },
  { id: 'combo-5', name: 'Flow State', description: 'Combo window extended to 15 seconds', rarity: 'rare', effect: { type: 'combo_duration', value: 5 } },
  { id: 'match-3', name: 'Fine Calibration', description: '+3% match quality', rarity: 'common', effect: { type: 'match_quality', value: 0.03 } },
  { id: 'vol-3', name: 'Local Drive', description: '+3 volunteers', rarity: 'common', effect: { type: 'volunteer_pool', value: 3 } },
  { id: 'relief-5', name: 'Channel Boost', description: '+5% relief transfer', rarity: 'common', effect: { type: 'relief_transfer', value: 0.05 } },
  { id: 'insight-meningitis', name: 'Meningitis Insight', description: 'Unlock disease insight: Meningitis', rarity: 'rare', effect: { type: 'disease_insight', disease: 'Meningitis' } },
  { id: 'insight-sickle', name: 'Sickle Cell Insight', description: 'Unlock disease insight: Sickle cell crisis', rarity: 'rare', effect: { type: 'disease_insight', disease: 'Sickle cell crisis' } },
  { id: 'insight-ms', name: 'MS Insight', description: 'Unlock disease insight: MS relapse', rarity: 'epic', effect: { type: 'disease_insight', disease: 'MS relapse' } },
  { id: 'trust-3', name: 'Open Books', description: '+3 Trust', rarity: 'common', effect: { type: 'trust_bonus', value: 3 } },
  { id: 'rp-25', name: 'Small Grant', description: '+25 Relief Points', rarity: 'common', effect: { type: 'rp_bonus', value: 25 } },
  { id: 'net-5', name: 'Relay Nodes', description: '+5 volunteer slots', rarity: 'rare', effect: { type: 'network_capacity', value: 5 } },
  { id: 'profile-10', name: 'Quick Type', description: '+10% profiling speed', rarity: 'common', effect: { type: 'profiling_speed', value: 0.1 } },
  { id: 'mort-3', name: 'Risk Buffer', description: '-3% mortality growth', rarity: 'common', effect: { type: 'mortality_reduction', value: 0.03 } },
];

export interface ActiveUpgrades {
  matchQualityBonus: number;
  reliefTransferBonus: number;
  profilingSpeedBonus: number;
  mortalityReduction: number;
  autoRestVolunteers: boolean;
  tickReliefBonus: number;
  comboDurationBonus: number;
  networkCapacityBonus: number;
  diseaseInsights: string[];
}

export const DEFAULT_ACTIVE_UPGRADES: ActiveUpgrades = {
  matchQualityBonus: 0,
  reliefTransferBonus: 0,
  profilingSpeedBonus: 0,
  mortalityReduction: 0,
  autoRestVolunteers: false,
  tickReliefBonus: 0,
  comboDurationBonus: 0,
  networkCapacityBonus: 0,
  diseaseInsights: [],
};

export function applyUpgradeEffect(active: ActiveUpgrades, card: UpgradeCard): ActiveUpgrades {
  const next = { ...active, diseaseInsights: [...active.diseaseInsights] };
  const e = card.effect;
  switch (e.type) {
    case 'match_quality':
      next.matchQualityBonus += e.value;
      break;
    case 'relief_transfer':
      next.reliefTransferBonus += e.value;
      break;
    case 'profiling_speed':
      next.profilingSpeedBonus += e.value;
      break;
    case 'mortality_reduction':
      next.mortalityReduction += e.value;
      break;
    case 'auto_rest':
      next.autoRestVolunteers = true;
      break;
    case 'tick_relief':
      next.tickReliefBonus += e.value;
      break;
    case 'combo_duration':
      next.comboDurationBonus += e.value;
      break;
    case 'network_capacity':
      next.networkCapacityBonus += e.value;
      break;
    case 'disease_insight':
      if (!next.diseaseInsights.includes(e.disease)) next.diseaseInsights.push(e.disease);
      break;
    default:
      break;
  }
  return next;
}

export function pickRandomUpgrades(owned: string[], count = 3): UpgradeCard[] {
  const available = UPGRADE_CARDS.filter((c) => !owned.includes(c.id));
  const pool = [...available];
  const picks: UpgradeCard[] = [];
  while (picks.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    picks.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picks;
}

export const RARITY_COLORS: Record<UpgradeRarity, string> = {
  common: '#6b7a99',
  rare: '#7b61ff',
  epic: '#ffb020',
};
