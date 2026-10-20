"use client";

const PARTNERS = [
  "Northgate Holdings",
  "Meridian Properties",
  "Harborview Group",
  "Cascade Logistics",
  "Atlas Distribution",
  "Riverside District",
  "Vance & Associates",
  "Castellanos Studio",
];

export function LogoMarqueeSection() {
  return (
    <section
      aria-label="Illustrative partner brands"
      className="relative overflow-hidden border-y py-12"
      style={{
        backgroundColor: "var(--bg-navy)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="eyebrow">Illustrative partner brands</div>
          <p
            className="mt-2 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Fictional, illustrative company names — placeholder for real partner logos before launch.
          </p>
        </div>
      </div>

      <div className="relative mt-8 overflow-hidden mask-fade-edges">
        <div className="flex w-max animate-marquee items-center gap-12 px-6">
          {[...PARTNERS, ...PARTNERS].map((name, i) => (
            <span
              key={i}
              className="font-display whitespace-nowrap text-base font-semibold tracking-tight opacity-50"
              style={{ color: "var(--text-secondary)" }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
