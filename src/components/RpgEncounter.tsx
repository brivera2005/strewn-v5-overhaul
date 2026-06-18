import { useEffect, useState } from 'react';
import { DialogueBox } from './DialogueBox';
import { RARITY_COLORS } from '../game/loot';
import type { PatientRecord } from '../game/State';
import type { LootItem } from '../game/loot';

export type EncounterAction = 'share' | 'minion' | 'endure' | 'relic';

interface RpgEncounterProps {
  patient: PatientRecord | null;
  speaker: string;
  lines: string[];
  inventoryCount: number;
  onResolve: (action: EncounterAction) => void;
  onClose: () => void;
  healFlash?: { daly: number; loot?: LootItem } | null;
}

export function RpgEncounter({
  patient,
  speaker,
  lines,
  inventoryCount,
  onResolve,
  onClose,
  healFlash,
}: RpgEncounterProps) {
  const [phase, setPhase] = useState<'dialogue' | 'choices' | 'result'>('dialogue');

  useEffect(() => {
    setPhase('dialogue');
  }, [patient?.id, speaker]);

  if (!patient) return null;

  const choices = [
    { id: 'share', label: 'Share Burden (Family)' },
    { id: 'minion', label: 'Send Minion' },
    { id: 'endure', label: 'Endure (Mark)' },
    ...(inventoryCount > 0 ? [{ id: 'relic', label: 'Use Relic' }] : []),
  ];

  const handleChoice = (id: string) => {
    onResolve(id as EncounterAction);
    setPhase('result');
  };

  return (
    <div className="rpg-encounter-overlay">
      {healFlash && (
        <div className="heal-particles">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="heal-particle" style={{ '--i': i } as React.CSSProperties} />
          ))}
          <div className="daly-pop">+{healFlash.daly} DALY</div>
          {healFlash.loot && (
            <div
              className="loot-flash"
              style={{ color: RARITY_COLORS[healFlash.loot.rarity] }}
            >
              {healFlash.loot.name}!
            </div>
          )}
        </div>
      )}

      {phase !== 'result' && (
        <DialogueBox
          visible
          speaker={speaker}
          lines={lines}
          choices={phase === 'choices' ? choices : undefined}
          onChoice={handleChoice}
          onAdvance={() => setPhase('choices')}
        />
      )}

      {phase === 'result' && (
        <DialogueBox
          visible
          speaker="Strewn"
          lines={['The weight shifts. Someone else carries a piece now.']}
          onAdvance={onClose}
        />
      )}
    </div>
  );
}
