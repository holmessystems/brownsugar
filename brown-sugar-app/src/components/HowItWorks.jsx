const steps = [
  { number: 1, title: 'Place your preorder' },
  { number: 2, title: 'We bake fresh' },
  { number: 3, title: 'Pickup at scheduled location' },
];

const locations = [
  {
    name: 'Richmond Pickup',
    address: '7920 W Grand Parkway S Frontage Rd, Richmond, TX 77406',
  },
  {
    name: 'Northside Pickup',
    address: '3140 FM 1960 Rd W, Houston, TX 77068',
  },
  {
    name: "Papa Joe's Coffee Shop",
    address: '4733 Richmond Ave, Houston, TX 77027',
    note: 'preorder or fresh pickup',
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <h2>How It Works</h2>

      <div className="how-it-works-steps">
        {steps.map((step) => (
          <div key={step.number} className="how-it-works-step">
            <span className="step-number">{step.number}</span>
            <p>{step.title}</p>
          </div>
        ))}
      </div>

      <h3>Pickup Locations</h3>
      <ul className="pickup-locations">
        {locations.map((loc) => (
          <li key={loc.name}>
            <strong>{loc.name}:</strong> {loc.address}
            {loc.note && <span> — {loc.note}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
