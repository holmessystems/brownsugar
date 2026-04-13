export default function SocialProof() {
  const stats = [
    { value: 'Sold out in 2 hours', label: 'Every drop day' },
    { value: '1M+ views', label: 'On our rolls' },
  ];

  const quotes = [
    {
      id: 1,
      text: 'Best cinnamon rolls I have ever had. The matcha flavor is unreal.',
      author: 'Jessica T.',
    },
    {
      id: 2,
      text: 'Ordered for my bridal shower and everyone was obsessed. Already planning a reorder.',
      author: 'Priya M.',
    },
    {
      id: 3,
      text: 'Worth every minute of the drive. Fresh, warm, and perfectly glazed.',
      author: 'Marcus L.',
    },
  ];

  return (
    <section className="social-proof">
      <div className="section-header">
        <p className="section-label">Why People Love Us</p>
        <h2 className="section-title">The Buzz</h2>
      </div>

      <div className="stats-row">
        {stats.map((stat, i) => (
          <div key={i} className="stat-block">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="quotes-row">
        {quotes.map((q) => (
          <blockquote key={q.id} className="customer-quote">
            <p>"{q.text}"</p>
            <cite>— {q.author}</cite>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
