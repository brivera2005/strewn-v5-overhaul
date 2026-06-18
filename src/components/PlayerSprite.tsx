interface PlayerSpriteProps {
  x: number;
  y: number;
  facing: 'up' | 'down' | 'left' | 'right';
  moving?: boolean;
  color?: string;
}

export function PlayerSprite({ x, y, facing, moving = false, color = '#00d4aa' }: PlayerSpriteProps) {
  return (
    <div
      className={`player-sprite facing-${facing}${moving ? ' walking' : ''}`}
      style={{
        left: x,
        top: y,
        '--player-color': color,
      } as React.CSSProperties}
    >
      <div className="player-sprite-body" />
      <div className="player-sprite-shadow" />
    </div>
  );
}

interface PartyFollowerProps {
  x: number;
  y: number;
  color: string;
  label: string;
}

export function PartyFollower({ x, y, color, label }: PartyFollowerProps) {
  return (
    <div
      className="party-follower"
      style={{ left: x, top: y, '--follower-color': color } as React.CSSProperties}
      title={label}
    >
      <span>{label[0]}</span>
    </div>
  );
}

interface NpcSpriteProps {
  x: number;
  y: number;
  color: string;
  name: string;
  sprite: 'person' | 'patient' | 'family' | 'minion';
  nearby?: boolean;
  hurt?: boolean;
}

export function NpcSprite({ x, y, color, name, sprite, nearby = false, hurt = false }: NpcSpriteProps) {
  return (
    <div
      className={`npc-sprite sprite-${sprite}${nearby ? ' nearby' : ''}${hurt ? ' hurt-pulse' : ''}`}
      style={{ left: x, top: y, '--npc-color': color } as React.CSSProperties}
      title={name}
    >
      <div className="npc-sprite-body" />
      {nearby && <div className="npc-interact-hint blink">E</div>}
    </div>
  );
}
