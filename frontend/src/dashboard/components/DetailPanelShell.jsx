import './DetailPanelShell.css';
import { useEffect, useRef } from 'react';

/**
 * Reusable modal detail panel shell. Owns the dialog semantics and the hardened
 * focus management so every panel body (room actions, manager history) shares
 * exactly one implementation:
 *  - focus the close button on open, restore focus to the trigger on close
 *  - trap Tab within the dialog, close on Escape or backdrop click
 *  - lock body scroll while open
 *
 * Props: title, onClose, testId, children (the panel body).
 */
export default function DetailPanelShell({ title, subtitle, onClose, testId, children }) {
  const closeRef = useRef(null);
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);

  // Keep the latest onClose in a ref so the mount-only key listener stays current.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Mount-only: remember the trigger, focus close, lock scroll; restore on unmount.
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
      // Guard on .focus (not instanceof HTMLElement) so an SVG <g> trigger is restored too.
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, []);

  // Escape closes; Tab is trapped within the dialog (aria-modal promise).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab') {
        const root = panelRef.current;
        if (!root) return;
        const focusables = Array.from(
          root.querySelectorAll(
            'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.disabled);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const titleId = 'ibh-panel-title';

  return (
    <div
      className="ibh-panel-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        className="ibh-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid={testId}
        ref={panelRef}
      >
        <header className="ibh-panel-header">
          <div>
            <h2 id={titleId} className="ibh-panel-title">{title}</h2>
            {subtitle && <p className="ibh-panel-subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="ibh-panel-close"
            onClick={onClose}
            ref={closeRef}
            aria-label="Close panel"
          >
            ✕
          </button>
        </header>
        <div className="ibh-panel-body">{children}</div>
      </aside>
    </div>
  );
}
