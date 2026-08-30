import styles from "./HeroBackground.module.css";

/* Route paths — ids referenced by <mpath> below. Corner dots sit at the
   two rounded-turn coordinates of each path. */
const ROUTES = [
  {
    id: "a1",
    d: "M-20,140 H150 Q178,140 178,168 V300 H420",
    corners: [
      [150, 140],
      [178, 168],
    ],
    dur: "10s",
    begin: "0s",
    color: "var(--hb-primary)",
  },
  {
    id: "a2",
    d: "M1220,120 H1046 Q1018,120 1018,148 V288 H778",
    corners: [
      [1046, 120],
      [1018, 148],
    ],
    dur: "13s",
    begin: "2.2s",
    color: "var(--hb-primary)",
  },
  {
    id: "a3",
    d: "M-20,560 H210 Q238,560 238,532 V430 H430",
    corners: [
      [210, 560],
      [238, 532],
    ],
    dur: "11.5s",
    begin: "4.6s",
    color: "var(--hb-accent)",
  },
  {
    id: "a4",
    d: "M1220,590 H1000 Q972,590 972,562 V452 H770",
    corners: [
      [1000, 590],
      [972, 562],
    ],
    dur: "14.5s",
    begin: "1.1s",
    color: "var(--hb-accent)",
  },
];

/* The nine flyers. Every duration is distinct and every delay is
   negative, so the sky is already mid-flight — populated, staggered,
   never synchronized — on first paint. */
const FLYERS = [
  {
    id: 1,
    tier: "d2",
    dir: "R",
    top: 20,
    dur: 36,
    delay: -5,
    y1: -46,
    wobDur: 7.5,
    amp: -14,
    rot: -3,
    ry: -15,
    streak: "left",
    render: () => (
      <QuoteCard insurer="ICICI Lombard" sub="zero-dep · 7 add-ons" price="₹4,280" width={212} />
    ),
  },
  {
    id: 2,
    tier: "d1",
    dir: "L",
    top: 104,
    dur: 48,
    delay: -18,
    y1: 52,
    wobDur: 9.5,
    amp: 13,
    rot: 4,
    ry: 16,
    streak: "right",
    hideOnMobile: true,
    render: () => <QuoteCard insurer="ACKO" sub="basic · 2 add-ons" price="₹3,910" width={220} />,
  },
  {
    id: 3,
    tier: "d3",
    dir: "R",
    top: 186,
    dur: 28,
    delay: -20,
    y1: -30,
    wobDur: 6.2,
    amp: -11,
    rot: -2,
    streak: "left",
    streakAccent: true,
    render: () => <Pill tone="accent" label="Aadhaar verified" />,
  },
  {
    id: 4,
    tier: "d2",
    dir: "L",
    top: 262,
    dur: 40,
    delay: -10,
    y1: 40,
    wobDur: 8.4,
    amp: -15,
    rot: 3,
    ry: 13,
    hideOnMobile: true,
    render: () => <MiniDocument />,
  },
  {
    id: 5,
    tier: "d1",
    dir: "R",
    top: 352,
    dur: 54,
    delay: -33,
    y1: -58,
    wobDur: 11,
    amp: 17,
    rot: -5,
    hideOnMobile: true,
    render: () => <Pill tone="teal" label="Policy.pdf parsed" />,
  },
  {
    id: 6,
    tier: "d3",
    dir: "L",
    top: 428,
    dur: 26,
    delay: -3,
    y1: 34,
    wobDur: 6.8,
    amp: -13,
    rot: 2,
    streak: "right",
    render: () => <Pill tone="teal" label="KA-01-MH-4592" />,
  },
  {
    id: 7,
    tier: "d2",
    dir: "R",
    top: 492,
    dur: 42,
    delay: -26,
    y1: -42,
    wobDur: 8.8,
    amp: -16,
    rot: 3,
    ry: -13,
    streak: "left",
    render: () => <WinnerCard insurer="Tata AIG" sub="full cover · best fit" price="₹4,640" width={224} />,
  },
  {
    id: 8,
    tier: "d1",
    dir: "L",
    top: 572,
    dur: 46,
    delay: -14,
    y1: 46,
    wobDur: 10.4,
    amp: 14,
    rot: -4,
    hideOnMobile: true,
    render: () => <Pill tone="accent" label="RC book scanned" />,
  },
  {
    id: 9,
    tier: "d3",
    dir: "R",
    top: 630,
    dur: 31,
    delay: -8,
    y1: -26,
    wobDur: 7.6,
    amp: -12,
    rot: 2,
    streak: "left",
    render: () => <Pill tone="teal" label="Quote ready · 28s" />,
  },
];

const TWINKLES = [
  { left: "14%", top: 120, dur: "5.2s", delay: "-1s", tone: "teal" },
  { left: "83%", top: 200, dur: "6.1s", delay: "-2.3s", tone: "accent" },
  { left: "26%", top: 470, dur: "4.8s", delay: "-3.6s", tone: "teal" },
  { left: "74%", top: 540, dur: "6.4s", delay: "-0.5s", tone: "accent" },
  { left: "92%", top: 390, dur: "5.6s", delay: "-4.1s", tone: "teal" },
];

function QuoteCard({ insurer, sub, price, width }) {
  return (
    <div className={styles.quoteCard} style={{ width }}>
      <div className={styles.quoteText}>
        <div className={styles.quoteInsurer}>{insurer}</div>
        <div className={styles.quoteSub}>{sub}</div>
      </div>
      <div className={styles.quotePrice}>{price}</div>
    </div>
  );
}

function WinnerCard({ insurer, sub, price, width }) {
  return (
    <div className={styles.winnerCard} style={{ width }}>
      <div className={styles.quoteText}>
        <div className={styles.quoteInsurer}>{insurer}</div>
        <div className={styles.quoteSub}>{sub}</div>
      </div>
      <div className={styles.quotePrice}>{price}</div>
      <span className={styles.winnerBadge} aria-hidden="true">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path d="M5 12.5l4.5 4.5L19 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

function Pill({ tone, label }) {
  return <span className={`${styles.pill} ${tone === "accent" ? styles.pillAccent : styles.pillTeal}`}>{label}</span>;
}

function MiniDocument() {
  return (
    <div className={styles.miniDoc}>
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={i} className={styles.docBar} />
      ))}
      <span className={styles.scanLine} />
    </div>
  );
}

function Streak({ side, accent }) {
  const classes = [styles.streak, side === "left" ? styles.streakLeft : styles.streakRight, accent ? styles.streakAccent : ""]
    .filter(Boolean)
    .join(" ");
  return <span className={classes} aria-hidden="true" />;
}

function Flyer(f) {
  const flClass = [styles.fl, f.dir === "R" ? styles.dirR : styles.dirL, styles[f.tier], f.hideOnMobile ? styles.hideS : ""]
    .filter(Boolean)
    .join(" ");

  const flStyle = {
    top: f.top,
    "--y0": "0px",
    "--y1": `${f.y1}px`,
    animationDuration: `${f.dur}s`,
    animationDelay: `${f.delay}s`,
  };

  const cyStyle = {
    "--op": f.tier === "d1" ? 0.26 : f.tier === "d2" ? 0.44 : 0.6,
    animationDuration: `${f.dur}s`,
    animationDelay: `${f.delay}s`,
  };

  const wbStyle = {
    "--amp": `${f.amp}px`,
    "--rot": `${f.rot}deg`,
    animationDuration: `${f.wobDur}s`,
  };

  const content = (
    <div className={styles.objectWrap}>
      {f.render()}
      {f.streak && <Streak side={f.streak} accent={f.streakAccent} />}
    </div>
  );

  return (
    <div className={flClass} style={flStyle}>
      <div className={styles.cy} style={cyStyle}>
        <div className={styles.wb} style={wbStyle}>
          {f.ry !== undefined ? (
            <div className={styles.tilt} style={{ "--ry": `${f.ry}deg` }}>
              {content}
            </div>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
}

function RouteNetwork() {
  return (
    <div className={styles.routes} aria-hidden="true">
      <svg className={styles.routeSvg} viewBox="0 0 1200 680" preserveAspectRatio="xMidYMid slice">
        <defs>
          {ROUTES.map((r) => (
            <path key={r.id} id={r.id} d={r.d} />
          ))}
        </defs>

        {ROUTES.map((r) => (
          <path
            key={r.id}
            d={r.d}
            fill="none"
            style={{ stroke: "var(--hb-primary)" }}
            strokeWidth="1.3"
            opacity="0.18"
          />
        ))}

        {ROUTES.map((r) =>
          r.corners.map(([cx, cy], i) => (
            <circle
              key={`${r.id}-corner-${i}`}
              cx={cx}
              cy={cy}
              r="2.8"
              style={{ fill: "var(--hb-primary)" }}
              opacity="0.26"
            />
          ))
        )}

        {ROUTES.map((r) => (
          <circle key={`${r.id}-pulse`} className={styles.pulse} r="3.4" style={{ fill: r.color }}>
            <animateMotion dur={r.dur} begin={r.begin} repeatCount="indefinite">
              <mpath href={`#${r.id}`} />
            </animateMotion>
            <animate
              attributeName="opacity"
              values="0;.85;.85;0"
              keyTimes="0;.12;.82;1"
              dur={r.dur}
              begin={r.begin}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
    </div>
  );
}

export default function HeroBackground() {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.meshA} />
      <div className={styles.meshB} />

      <RouteNetwork />

      <div className={styles.sky}>
        {FLYERS.map((f) => (
          <Flyer key={f.id} {...f} />
        ))}
      </div>

      {TWINKLES.map((t, i) => (
        <span
          key={i}
          className={styles.twinkle}
          style={{
            left: t.left,
            top: t.top,
            "--tw-dur": t.dur,
            "--tw-delay": t.delay,
            "--tw-color": t.tone === "accent" ? "var(--hb-accent)" : "var(--hb-primary)",
          }}
        />
      ))}

      <div className={styles.grain} />
      <div className={styles.veil} />
    </div>
  );
}
