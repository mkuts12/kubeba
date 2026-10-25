import { useEffect, useRef } from 'react';
import { BookOpen, ExternalLink, Heart, Music2, X } from 'lucide-react';
import { additionalReferences, softwareCredits, teachingCredits } from './credits';
import { missions } from './music';

export default function CreditsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !dialog.current?.open) {
      dialog.current?.showModal();
      if (dialog.current) dialog.current.scrollTop = 0;
    } else if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);

  const music = missions.filter((m) => m.collection === 'themes').map((m) => m.material!);

  return (
    <dialog
      ref={dialog}
      className="credits-dialog"
      aria-labelledby="credits-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="credits-header">
        <div>
          <span className="eyebrow">INTERLUDE · ACKNOWLEDGMENTS</span>
          <h2 id="credits-title">Credits & sources</h2>
        </div>
        <button className="icon-button" autoFocus aria-label="Close credits" onClick={onClose}>
          <X size={21} />
        </button>
      </div>
      <div className="credits-body">
        <p className="credits-intro">
          With thanks to the educators, composers, and open-source contributors whose work informed
          this app. The links below identify the sources and explain how they were used.
        </p>
        <aside className="author-support" aria-labelledby="support-authors-title">
          <Heart size={22} />
          <div>
            <h3 id="support-authors-title">Support the authors. Buy the original books.</h3>
            <p>
              If these ideas help you enjoy making music, please consider buying the original books
              from the authors or their publishers. Their full methods offer much more than this
              small app can. For the free textbook, read it, share its official link, and credit its
              authors.
            </p>
            <small>
              These are direct, non-affiliate links. Interlude earns no commission. Prices and
              availability are set by the stores.
            </small>
          </div>
        </aside>
        <section aria-labelledby="teaching-credits-title">
          <div className="credits-section-heading">
            <BookOpen size={18} />
            <h3 id="teaching-credits-title">Teaching references</h3>
          </div>
          <div className="teaching-credit-list">
            {teachingCredits.map((credit) => (
              <article className="teaching-credit" key={credit.title}>
                <h4>{credit.title}</h4>
                <p className="credit-author">{credit.author}</p>
                <p>{credit.description}</p>
                <p className="credit-scope">{credit.scope}</p>
                <div className="credit-links">
                  {credit.links.map((link) => (
                    <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                      {link.label}
                      <ExternalLink size={12} />
                    </a>
                  ))}
                </div>
                <div className="credit-support">
                  <a
                    className="button secondary"
                    href={credit.support.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {credit.support.kind === 'buy' ? <Heart size={14} /> : <BookOpen size={14} />}
                    {credit.support.label}
                    <ExternalLink size={12} />
                  </a>
                  <p>{credit.support.note}</p>
                </div>
              </article>
            ))}
          </div>
          <details className="additional-credits">
            <summary>Further reading that informed the project</summary>
            <ul>
              {additionalReferences.map((reference) => (
                <li key={reference.url}>
                  <a href={reference.url} target="_blank" rel="noreferrer">
                    {reference.label}
                    <ExternalLink size={12} />
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </section>

        <section aria-labelledby="music-credits-title">
          <div className="credits-section-heading">
            <Music2 size={18} />
            <h3 id="music-credits-title">Music in the app</h3>
          </div>
          <p className="credits-section-note">
            These historic compositions are used through short, newly entered extracts or
            reductions. Source editions are linked below. A public-domain composition does not make
            every modern edition or recording free to reuse.
          </p>
          <div className="music-credit-list">
            {music.map((material) => (
              <article className="music-credit" key={material.title}>
                <h4>{material.title}</h4>
                <p className="credit-author">{material.composer}</p>
                <a href={material.sourceUrl} target="_blank" rel="noreferrer">
                  View the music source
                  <ExternalLink size={12} />
                </a>
                <details>
                  <summary>What was used and changed</summary>
                  <p>{material.adaptation}</p>
                  <p>{material.rights}</p>
                </details>
              </article>
            ))}
          </div>
          <p className="credits-original">
            The blues studies, example variations, and simplified backing patterns are new material
            written for Interlude. They are not copied book exercises or transcriptions of a
            performer’s solo. App development, lesson text, and original examples were created with
            AI assistance.
          </p>
        </section>

        <section aria-labelledby="software-credits-title">
          <div className="credits-section-heading">
            <h3 id="software-credits-title">Software, sound & fonts</h3>
          </div>
          <p className="credits-section-note">
            The app uses{' '}
            {softwareCredits.map((credit, i) => (
              <span key={credit.url}>
                {i > 0 ? ', ' : ''}
                <a href={credit.url} target="_blank" rel="noreferrer">
                  {credit.label}
                </a>
              </span>
            ))}
            . Audio is a local piano-style Web Audio synth, not a sampled performance.
          </p>
          <p className="credits-section-note">
            Notation uses the Bravura and Academico fonts. The interface uses DM Sans and Instrument
            Serif from Google Fonts, with system-font fallbacks.
          </p>
          <div className="credit-links">
            <a href="./THIRD_PARTY_NOTICES.txt" target="_blank" rel="noreferrer">
              Software and bundled-font license notices
              <ExternalLink size={12} />
            </a>
            <a
              href="https://github.com/mkuts12/kubeba/blob/main/piano-improv/source/public/PEDAGOGY_REVIEW.md"
              target="_blank"
              rel="noreferrer"
            >
              Teaching review: sources, changes, and limits
              <ExternalLink size={12} />
            </a>
          </div>
        </section>

        <div className="credits-disclaimer">
          <strong>References, not endorsements.</strong>
          <p>
            No named author, composer, institution, or publisher sponsors or endorses Interlude.
            This is an independent learning prototype. The source review is not a piano teacher’s
            assessment, and saved practice visits are not proof of mastery.
          </p>
        </div>
      </div>
    </dialog>
  );
}
