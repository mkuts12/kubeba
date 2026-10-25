import { Check, ChevronRight } from 'lucide-react';
import { courseMissions, courseUnits, type UnitId } from './course';
import type { Style } from './music';

export default function LearningPath({
  style,
  completed,
  selected,
  onSelect,
}: {
  style: Style;
  completed: Set<string>;
  selected: UnitId;
  onSelect: (id: UnitId) => void;
}) {
  return (
    <section className="learning-path" aria-label="Learning path">
      <div className="path-intro">
        <div>
          <span className="eyebrow">A SUGGESTED ORDER, NOT LOCKED LEVELS</span>
          <h2>Understand it. Hear it. Make it yours.</h2>
        </div>
        <p>
          Visited means you saved a practice session—not that the app measured mastery. Revisit any
          idea.
        </p>
      </div>
      <div className="path-units">
        {courseUnits.map((unit) => {
          const lessons = courseMissions(style, unit.id);
          const visited = lessons.filter((m) => completed.has(m.id)).length;
          return (
            <button
              key={unit.id}
              className={`path-unit ${selected === unit.id ? 'selected' : ''}`}
              aria-pressed={selected === unit.id}
              onClick={() => onSelect(unit.id)}
            >
              <span className="path-number">
                {visited === lessons.length ? <Check size={17} /> : unit.number}
              </span>
              <span>
                <strong>{unit.title}</strong>
                <small>
                  {visited} / {lessons.length} visited
                </small>
              </span>
              <ChevronRight size={15} />
            </button>
          );
        })}
      </div>
      <div className="path-outcome">
        <strong>{courseUnits.find((u) => u.id === selected)!.title}</strong>
        <p>{courseUnits.find((u) => u.id === selected)!.description}</p>
        <span>Working toward: “{courseUnits.find((u) => u.id === selected)!.outcome}”</span>
      </div>
    </section>
  );
}
