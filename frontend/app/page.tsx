export default function HomePage() {
  return (
    <section className="stack">
      <div className="card">
        <h2>Dashboard</h2>
        <p>
          This mini LMS supports parent/student management, class scheduling,
          subscription usage, class registration rules, and cancellation with
          refund logic.
        </p>
      </div>

      <div className="grid">
        <article className="card">
          <h3>Parents</h3>
          <p>Create and view parent records.</p>
        </article>

        <article className="card">
          <h3>Students</h3>
          <p>Create students under a parent and view details.</p>
        </article>

        <article className="card">
          <h3>Classes</h3>
          <p>Create classes, view weekly schedule, and register students.</p>
        </article>

        <article className="card">
          <h3>Subscriptions</h3>
          <p>Create subscriptions and inspect student subscription status.</p>
        </article>
      </div>
    </section>
  );
}
