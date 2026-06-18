import { useState } from 'react';

interface Props {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

export function Tooltip({ content, children, position = 'top' }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="tooltip-wrap"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className={`tooltip-bubble tooltip-${position}`} role="tooltip">
          {content}
        </span>
      )}
    </span>
  );
}

export const METRIC_TOOLTIPS: Record<string, string> = {
  reliefPoints: 'Relief Points (RP): Earned from stabilizing patients and tick relief. Spend on quick assigns and emergency bursts.',
  researchPoints: 'Research Points (ResP): Earned from case wins and discoveries. Spend on the research tree.',
  trust: 'Trust (T): Earned from low deaths and transparency. Spend to recruit volunteers and unlock regions.',
  rank: 'Director Rank: Levels 1-50 based on total DALYs saved. Rank up to pick upgrade cards.',
  painLoad: 'Pain Load: How much burden this patient carries. Above 85% is critical.',
  tempF: 'Temperature in Fahrenheit. Fever correlates with inflammatory pain load.',
  mortalityRisk: 'Mortality Risk: Chance of death if unaddressed. Above 70% needs immediate action.',
  matchAvg: 'Match Quality: How well assigned volunteers fit this patient\'s pain vectors.',
  network: 'Network: Number of volunteers sharing this patient\'s burden.',
  aplVac: 'APL/VAC ratio: Active Pain Load vs Volunteer Available Capacity.',
  streak: 'Streak: Ticks without a death. 7+ ticks grants bonus RP.',
  combo: 'Combo: Rapid successful assigns within 10 seconds multiply RP rewards.',
  forecast: 'Forecast: Predicted deaths at current mortality growth rate.',
};
