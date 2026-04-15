const steps = [
  { number: 1, text: 'Choose your flavors and place a preorder online.' },
  { number: 2, text: 'We bake your rolls fresh on the day of pickup.' },
  { number: 3, text: 'Select your pickup area (zip code) at checkout. Exact address provided after purchase.' },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <h2>How It Works</h2>
      <p className="how-it-works-note">
        Brown Sugar Co. is a preorder-only bakery. We do not accept walk-ins.
      </p>

      <div className="how-it-works-steps">
        {steps.map((step) => (
          <div key={step.number} className="how-it-works-step">
            <span className="step-number">{step.number}</span>
            <p>{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
