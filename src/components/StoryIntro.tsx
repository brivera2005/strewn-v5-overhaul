import { FEVER_TEMP_F, STORY_PARAGRAPHS } from '../game/constants';

interface Props {
  onStart: (e: React.MouseEvent) => void;
}

export function StoryIntro({ onStart }: Props) {
  return (
    <div className="screen story-screen">
      <div className="screen-title">Chapter 0: A Fever in the Night</div>
      {STORY_PARAGRAPHS.map((paragraph, i) => (
        <p key={i} className="story-paragraph">
          {paragraph.replace('101.3°F', `${FEVER_TEMP_F}°F`)}
        </p>
      ))}
      <button
        type="button"
        className="btn-primary"
        onClick={onStart}
        style={{ alignSelf: 'center', marginTop: '1rem' }}
      >
        Begin: Help the Mitchells
      </button>
    </div>
  );
}
