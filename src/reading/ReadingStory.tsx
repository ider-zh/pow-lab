import { stories } from "./stories";
import Illustration from "./Illustration";
import "./reading.css";

export default function ReadingStory({
  id,
  name,
  tag,
}: {
  id: string;
  name: string;
  tag: string;
}) {
  const story = stories[id];
  const comma = story.title.indexOf("，");
  const titleParts =
    comma >= 0
      ? [story.title.slice(0, comma + 1), story.title.slice(comma + 1)]
      : [story.title];
  return (
    <article
      className={`reading-story story-${id}`}
      aria-label={`${name} 原理故事`}
    >
      <div className="reading-masthead">
        <span>计算故事 / {tag.split(" / ")[0]}</span>
        <span>THE COMPUTING STORIES</span>
      </div>
      <div className="reading-title">
        <span className="reading-algorithm">{name}</span>
        <h1>
          {titleParts.map((part, i) => (
            <span className="story-title-part" key={i}>
              {part}
            </span>
          ))}
        </h1>
        {story.opening.map((p) => (
          <p className="reading-opening" key={p}>
            {p}
          </p>
        ))}
        <button
          className="reading-skip"
          onClick={() =>
            document.getElementById("lesson-experiment")?.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "instant"
                : "smooth",
            })
          }
        >
          也可以直接看看真实计算 ↓
        </button>
      </div>
      {story.sections.map((section, index) => (
        <section
          className="story-section"
          key={section.title}
          aria-labelledby={`story-chapter-${index}`}
        >
          <div className="story-prose">
            <span className="story-chapter-number">
              {String(index + 1).padStart(2, "0")} /
            </span>
            <h2 id={`story-chapter-${index}`}>{section.title}</h2>
            {section.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {section.illustration && (
            <Illustration
              kind={section.illustration}
              caption={section.caption!}
            />
          )}
        </section>
      ))}
      <aside className="story-takeaway">
        <span>故事里的那个想法</span>
        <p>{story.takeaway}</p>
      </aside>
      <div className="story-experiment-intro" id="lesson-experiment">
        <span className="eyebrow">BEYOND THE PAGE / 纸面之外</span>
        <h2>如果还想再往里看。</h2>
        <p>{story.experiment}</p>
      </div>
    </article>
  );
}
