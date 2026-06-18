import { musicEngine } from '../game/MusicEngine';
import { RESEARCH_NODES, BRANCH_LABELS, canUnlockResearch } from '../game/research';
import type { ResearchBranch } from '../game/research';

interface Props {
  unlocked: string[];
  researchPoints: number;
  onUnlock: (nodeId: string) => void;
}

const BRANCHES: ResearchBranch[] = ['immunology', 'operations', 'outreach', 'ethics'];

export function ResearchTree({ unlocked, researchPoints, onUnlock }: Props) {
  return (
    <div className="research-tree glass-panel">
      <div className="panel-label">Research Tree · {researchPoints} ResP available</div>
      <div className="research-branches">
        {BRANCHES.map((branch) => (
          <div key={branch} className="research-branch">
            <h3 className="branch-title">{BRANCH_LABELS[branch]}</h3>
            <div className="research-nodes">
              {RESEARCH_NODES.filter((n) => n.branch === branch).map((node) => {
                const isUnlocked = unlocked.includes(node.id);
                const canUnlock = !isUnlocked && canUnlockResearch(node.id, unlocked) && researchPoints >= node.cost;
                const locked = !isUnlocked && !canUnlockResearch(node.id, unlocked);
                return (
                  <button
                    key={node.id}
                    type="button"
                    className={`research-node ${isUnlocked ? 'unlocked' : locked ? 'locked' : 'available'}`}
                    disabled={!canUnlock}
                    onClick={() => {
                      if (canUnlock) {
                        musicEngine.playSfx('research_unlock');
                        onUnlock(node.id);
                      }
                    }}
                  >
                    <span className="node-name">{node.name}</span>
                    <span className="node-cost">{isUnlocked ? '✓' : `${node.cost} ResP`}</span>
                    <span className="node-benefit">{node.benefit}</span>
                    <span className="node-desc">{node.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
