/** Persistent research tree for Strewn v4 */

export type ResearchBranch = 'immunology' | 'operations' | 'outreach' | 'ethics';

export interface ResearchNode {
  id: string;
  name: string;
  branch: ResearchBranch;
  cost: number;
  description: string;
  benefit: string;
  prerequisites: string[];
}

export const RESEARCH_NODES: ResearchNode[] = [
  { id: 'hla-seq', name: 'HLA Sequencing', branch: 'immunology', cost: 15, description: 'Deep immune typing for better matches', benefit: '+8% match quality', prerequisites: [] },
  { id: 'cytokine', name: 'Cytokine Assay', branch: 'immunology', cost: 25, description: 'Measure inflammatory markers in real time', benefit: '+12% inflammatory relief', prerequisites: ['hla-seq'] },
  { id: 'memory-bank', name: 'Memory Banking', branch: 'immunology', cost: 40, description: 'Store immune memory for repeat cases', benefit: 'Endure immunity +15%', prerequisites: ['cytokine'] },
  { id: 'auto-opt', name: 'Auto-Optimize', branch: 'operations', cost: 20, description: 'AI suggests best volunteer per patient', benefit: 'Optimize button +25% effective', prerequisites: [] },
  { id: 'rapid-profile', name: 'Rapid Profiling', branch: 'operations', cost: 30, description: 'Cut profiling time in half', benefit: '+50% profiling speed', prerequisites: ['auto-opt'] },
  { id: 'forecast-ai', name: 'Forecast AI', branch: 'operations', cost: 45, description: 'Predict deaths 10 ticks ahead', benefit: 'Unlock forecast panel', prerequisites: ['rapid-profile'] },
  { id: 'vol-drive', name: 'Volunteer Drive', branch: 'outreach', cost: 18, description: 'Recruit more willing helpers', benefit: '+5 volunteer pool', prerequisites: [] },
  { id: 'wellness', name: 'Wellness Program', branch: 'outreach', cost: 28, description: 'Volunteers recover LE faster', benefit: '+20% LE recovery rate', prerequisites: ['vol-drive'] },
  { id: 'pr-campaign', name: 'PR Campaign', branch: 'outreach', cost: 35, description: 'Build public trust in Strewn', benefit: '+10 Trust', prerequisites: ['wellness'] },
  { id: 'consent', name: 'Consent Stability', branch: 'ethics', cost: 12, description: 'Reduce consent withdrawal risk', benefit: '-2% draft threshold', prerequisites: [] },
  { id: 'transparency', name: 'Transparency', branch: 'ethics', cost: 22, description: 'Open ledger for all participants', benefit: '+5 Trust per tick', prerequisites: ['consent'] },
  { id: 'legal-shield', name: 'Legal Shield', branch: 'ethics', cost: 38, description: 'Protect network from liability', benefit: 'Death trust penalty halved', prerequisites: ['transparency'] },
];

export const BRANCH_LABELS: Record<ResearchBranch, string> = {
  immunology: 'Immunology',
  operations: 'Operations',
  outreach: 'Outreach',
  ethics: 'Ethics',
};

export function canUnlockResearch(nodeId: string, unlocked: string[]): boolean {
  const node = RESEARCH_NODES.find((n) => n.id === nodeId);
  if (!node) return false;
  return node.prerequisites.every((p) => unlocked.includes(p));
}

export function getNextUnlockable(unlocked: string[], researchPoints: number): ResearchNode | null {
  const candidates = RESEARCH_NODES.filter(
    (n) => !unlocked.includes(n.id) && canUnlockResearch(n.id, unlocked) && n.cost <= researchPoints,
  );
  if (candidates.length === 0) {
    const next = RESEARCH_NODES.find((n) => !unlocked.includes(n.id) && canUnlockResearch(n.id, unlocked));
    return next ?? null;
  }
  return candidates.sort((a, b) => a.cost - b.cost)[0];
}

export function nextUnlockProgress(unlocked: string[], researchPoints: number): number {
  const next = RESEARCH_NODES.find((n) => !unlocked.includes(n.id) && canUnlockResearch(n.id, unlocked));
  if (!next) return 1;
  return Math.min(1, researchPoints / next.cost);
}
