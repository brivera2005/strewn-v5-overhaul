import {
  CHARACTERS,
  COLORS,
  FEVER_TEMP_F,
  NORMAL_TEMP_F,
  WIN_TEMP_F,
  formatTempF,
  painToFahrenheit,
} from '../game/constants';

interface Props {
  pain: number;
  reliefRate: number;
}

export function PatientCard({ pain, reliefRate }: Props) {
  const temp = painToFahrenheit(pain);
  const tempPercent = Math.min(100, Math.max(0, ((temp - NORMAL_TEMP_F) / (FEVER_TEMP_F - NORMAL_TEMP_F)) * 100));
  const isFever = temp >= WIN_TEMP_F;
  const fillColor = isFever ? COLORS.coral : temp >= 99.5 ? COLORS.amber : COLORS.success;

  return (
    <div className="panel patient-card" data-tutorial="patient">
      <div className="panel-label">Patient</div>
      <div className="patient-avatar">{CHARACTERS.ethan.initial}</div>
      <div className="patient-name">{CHARACTERS.ethan.name}</div>
      <div className="patient-role">{CHARACTERS.ethan.role}</div>

      <div className="thermometer">
        <div className="thermometer-track">
          <div
            className="thermometer-fill"
            style={{ width: `${tempPercent}%`, background: fillColor }}
          />
        </div>
        <div className="thermometer-labels">
          <span>{NORMAL_TEMP_F}°F normal</span>
          <span>{WIN_TEMP_F}°F target</span>
        </div>
      </div>

      <div className="temp-display" style={{ color: fillColor }}>
        {formatTempF(pain)}
      </div>
      <div className="temp-status">
        {isFever ? 'Fever: needs relief' : 'Temperature stabilizing'}
      </div>

      <div className="pain-load-bar">
        <div className="pain-load-label">
          <span>Patient Pain</span>
          <span>{pain.toFixed(0)} / 100</span>
        </div>
        <div className="pain-load-track">
          <div className="pain-load-fill" style={{ width: `${pain}%` }} />
        </div>
      </div>

      {reliefRate > 0 && (
        <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: COLORS.teal }}>
          Match Quality: {(reliefRate * 100).toFixed(0)}% relief active
        </div>
      )}
    </div>
  );
}
