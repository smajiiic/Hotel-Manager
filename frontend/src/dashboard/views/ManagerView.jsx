// Manager read-only analytics home. Built out in Stage 5 (summary metrics +
// read-only heatmap + per-room history; no action controls).
export default function ManagerView() {
  return (
    <section data-testid="manager-view" aria-labelledby="manager-heading">
      <h1 id="manager-heading">Operations overview</h1>
      <p className="muted">Read-only analytics and heatmap — built in Stage 5.</p>
    </section>
  );
}
