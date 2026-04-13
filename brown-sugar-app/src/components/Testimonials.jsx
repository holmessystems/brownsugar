const reviews = [
  { quote: "These cinnamon rolls are unreal. The brown sugar classic is warm, gooey perfection. My whole family is obsessed.", author: "Jasmine T., Houston" },
  { quote: "We ordered the Baker's Dozen for our office and it was gone in minutes. Already planning our next order. Incredible quality.", author: "Derrick W., Midtown Houston" },
  { quote: "Had the strawberry cheesecake roll at a pop-up and I literally stopped in my tracks. Best cinnamon roll I've ever had.", author: "Aaliyah F., The Woodlands" },
];

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="section-header">
        <p className="section-label">Sweet Reviews</p>
        <h2 className="section-title">What Houston Says</h2>
      </div>
      <div className="testimonial-grid">
        {reviews.map((r, i) => (
          <div className="testimonial-card" key={i}>
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-quote">"{r.quote}"</p>
            <p className="testimonial-author">— {r.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
