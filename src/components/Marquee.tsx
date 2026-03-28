const items = [
  "Mirror Photobooth",
  "360° Video Booth",
  "LED Screens",
  "Stage Platforms",
  "Event Lighting",
  "Red Carpet Setup",
  "Exhibition Displays",
  "Brand Activations",
];

const Marquee = () => {
  return (
    <div className="py-6 border-y border-border overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="mx-8 font-display text-sm uppercase tracking-[0.3em] text-muted-foreground"
          >
            {item}
            <span className="ml-8 gradient-text">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
