import siteConfig from '../data/siteConfig.json';

const instructions = [
  'Pickup takes place in a designated parking lot near our commercial kitchen. This is not a storefront.',
  'Exact pickup address will be sent after your order is confirmed.',
  'Please remain in your vehicle upon arrival.',
  'Text us when you arrive and include your car make and color so we can locate you quickly.',
  'We will bring your order directly to your car.',
];

export default function PickupInstructions() {
  const nextDrop = siteConfig.nextDropOpens || 'Check back soon';

  return (
    <section className="pickup-instructions" id="pickup-instructions">
      <h2>Pickup Instructions</h2>

      <ol className="pickup-instructions-list">
        {instructions.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
      </ol>

      <div className="pickup-reminder">
        <p>No walk-ins. Preorder only.</p>
        <p>Limited quantities daily.</p>
        <p>Next drop opens {nextDrop}</p>
      </div>
    </section>
  );
}
