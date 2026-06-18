import { AnimatedNumber } from './AnimatedNumber';
import { Tooltip, METRIC_TOOLTIPS } from './TooltipSystem';
import { dalysProgress } from '../game/currencies';
import { nextUnlockProgress } from '../game/research';
import type { CurrencyState } from '../game/currencies';

interface Props {
  currencies: CurrencyState;
  directorRank: number;
  dalysSaved: number;
  researchUnlocked: string[];
  streakTicks: number;
  comboMultiplier: number;
}

export function CurrencyHUD({
  currencies,
  directorRank,
  dalysSaved,
  researchUnlocked,
  streakTicks,
  comboMultiplier,
}: Props) {
  const rankProgress = dalysProgress(dalysSaved, directorRank);
  const unlockProgress = nextUnlockProgress(researchUnlocked, currencies.researchPoints);

  return (
    <div className="currency-hud glass-panel">
      <Tooltip content={METRIC_TOOLTIPS.reliefPoints}>
        <div className="currency-item rp">
          <span className="currency-label">RP</span>
          <AnimatedNumber value={currencies.reliefPoints} className="currency-value" />
        </div>
      </Tooltip>
      <Tooltip content={METRIC_TOOLTIPS.researchPoints}>
        <div className="currency-item resp">
          <span className="currency-label">ResP</span>
          <AnimatedNumber value={currencies.researchPoints} className="currency-value" />
        </div>
      </Tooltip>
      <Tooltip content={METRIC_TOOLTIPS.trust}>
        <div className="currency-item trust">
          <span className="currency-label">T</span>
          <AnimatedNumber value={currencies.trust} decimals={0} className="currency-value" />
        </div>
      </Tooltip>
      <Tooltip content={METRIC_TOOLTIPS.rank}>
        <div className="currency-item rank">
          <span className="currency-label">Rank</span>
          <span className="currency-value">{directorRank}</span>
          <div className="mini-progress">
            <div className="mini-progress-fill" style={{ width: `${rankProgress * 100}%` }} />
          </div>
        </div>
      </Tooltip>
      <Tooltip content={METRIC_TOOLTIPS.streak}>
        <div className="currency-item streak">
          <span className="currency-label">Streak</span>
          <span className="currency-value">{streakTicks}</span>
        </div>
      </Tooltip>
      {comboMultiplier > 1 && (
        <Tooltip content={METRIC_TOOLTIPS.combo}>
          <div className="currency-item combo">
            <span className="currency-label">Combo</span>
            <span className="currency-value">x{comboMultiplier.toFixed(1)}</span>
          </div>
        </Tooltip>
      )}
      <div className="next-unlock-bar">
        <span className="next-unlock-label">Next unlock</span>
        <div className="mini-progress">
          <div className="mini-progress-fill unlock" style={{ width: `${unlockProgress * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
