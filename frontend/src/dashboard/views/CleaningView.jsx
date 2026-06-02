// Cleaning task-first home. Built out in Stage 4 (prioritized queue + plan as a
// secondary tab with guest data suppressed).
export default function CleaningView() {
  return (
    <section data-testid="cleaning-view" aria-labelledby="cleaning-heading">
      <h1 id="cleaning-heading">Task queue</h1>
      <p className="muted">Your prioritized cleaning queue — built in Stage 4.</p>
    </section>
  );
}
