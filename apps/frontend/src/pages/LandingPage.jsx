import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Button from "../components/common/Button";
import TextReveal from "../components/common/TextReveal";
import HeroBackground from "../components/HeroBackground";
import {
  SparkleIcon,
  UploadIcon,
  LayersIcon,
  ShieldIcon,
  ArrowRightIcon,
} from "../components/common/icons";
import "./LandingPage.css";

const INSURERS = ["ICICI Lombard", "ACKO", "Tata AIG", "HDFC ERGO", "Bajaj Allianz"];

const STEPS = [
  {
    title: "Login & pick a flow",
    desc: "Agents sign in and choose New Insurance or Renewal for the customer in front of them.",
  },
  {
    title: "Fill or upload",
    desc: "New business: the AI assistant fills the form with you. Renewals: upload Aadhaar and the existing policy — details are auto-extracted.",
  },
  {
    title: "Auto-fill every insurer",
    desc: "Extracted data flows straight into ICICI Lombard, ACKO, Tata AIG and more — no retyping per portal.",
  },
  {
    title: "Compare & close",
    desc: "Quotes come back into one view, ranked by premium, coverage and benefits, so the agent can advise and confirm.",
  },
];

const FEATURES = [
  {
    icon: <SparkleIcon />,
    title: "AI form-fill assistant",
    desc: "A conversational assistant completes new-business applications with the agent, field by field.",
  },
  {
    icon: <UploadIcon />,
    title: "Document extraction",
    desc: "Upload Aadhaar and existing policy PDFs — customer details are pulled out automatically for renewals.",
  },
  {
    icon: <LayersIcon />,
    title: "Multi-insurer quoting",
    desc: "One dataset, submitted to every connected mock insurer at once, instead of repeating the work per portal.",
  },
  {
    icon: <ShieldIcon />,
    title: "Guided comparison",
    desc: "Quotes are ranked by premium, coverage and benefits, with the best-fit option surfaced for the customer.",
  },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />

      <section className="hero">
        <HeroBackground />
        <div className="container hero-content">
          <span className="hero-badge center-out">
            <span className="dot" />
            AI copilot for insurance agents
          </span>
          <h1>
            <TextReveal
              as="span"
              lines={[
                <>
                  One form. <em>Every insurer.</em>
                </>,
                "The best quote, every time.",
              ]}
            />
          </h1>
          <p className="hero-subtext">
            Synova fills new applications with an AI assistant, extracts customer
            details from documents for renewals, and pulls quotes from every
            connected insurer into one comparison — so agents spend less time on
            paperwork and more time closing.
          </p>
          <div className="hero-cta">
            <Button as={Link} to="/signup" variant="accent">
              Get Started <ArrowRightIcon width={18} height={18} />
            </Button>
            <Button as={Link} to="/signin" variant="secondary">
              Sign In
            </Button>
          </div>

          <div className="hero-visual center-out" style={{ animationDelay: "0.35s" }}>
            <div className="hero-visual-inner">
              <div className="browser-bar">
                <span className="browser-dot" />
                <span className="browser-dot" />
                <span className="browser-dot" />
                <span className="browser-url">app.synova.ai/quotes/renewal</span>
              </div>
              <div className="mock-app">
                <div className="mock-sidebar">
                  <span className="mock-sidebar-item active">Quotes</span>
                  <span className="mock-sidebar-item">New Insurance</span>
                  <span className="mock-sidebar-item">Renewals</span>
                  <span className="mock-sidebar-item">Customers</span>
                  <span className="mock-sidebar-item">Documents</span>
                </div>
                <div className="mock-main">
                  <div className="mock-main-title">Comparing 4 quotes for Ramesh K. — Motor Renewal</div>
                  <div className="mock-quote-row best">
                    <span className="mock-insurer">Tata AIG</span>
                    <span className="mock-premium">₹6,240 / yr</span>
                    <span className="mock-bar-track">
                      <span className="mock-bar-fill" style={{ width: "88%" }} />
                    </span>
                    <span className="mock-tag">Best fit</span>
                  </div>
                  <div className="mock-quote-row">
                    <span className="mock-insurer">ICICI Lombard</span>
                    <span className="mock-premium">₹6,890 / yr</span>
                    <span className="mock-bar-track">
                      <span className="mock-bar-fill" style={{ width: "74%" }} />
                    </span>
                    <span />
                  </div>
                  <div className="mock-quote-row">
                    <span className="mock-insurer">ACKO</span>
                    <span className="mock-premium">₹5,980 / yr</span>
                    <span className="mock-bar-track">
                      <span className="mock-bar-fill" style={{ width: "61%" }} />
                    </span>
                    <span />
                  </div>
                  <div className="mock-quote-row">
                    <span className="mock-insurer">HDFC ERGO</span>
                    <span className="mock-premium">₹7,120 / yr</span>
                    <span className="mock-bar-track">
                      <span className="mock-bar-fill" style={{ width: "69%" }} />
                    </span>
                    <span />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="trusted-strip">
        <div className="container">
          <div className="trusted-label">Quoting live across</div>
          <div className="trusted-logos">
            {INSURERS.map((name) => (
              <span key={name} className="trusted-logo">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">How it works</span>
            <h2>From login to a signed renewal in four steps</h2>
            <p>Built around how agents actually work — with an assistant at every step.</p>
          </div>
          <div className="steps-grid">
            {STEPS.map((step, i) => (
              <div className="step-card hover-lift" key={step.title}>
                <div className="step-number">{i + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="product">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">Product</span>
            <h2>Everything an agent needs, in one workspace</h2>
            <p>No more switching between insurer portals or re-typing the same details.</p>
          </div>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div className="feature-card hover-lift" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="insurers">
        <div className="container">
          <div className="stats-band">
            <div>
              <div className="stat-value">3+</div>
              <div className="stat-label">Mock insurers connected</div>
            </div>
            <div>
              <div className="stat-value">1</div>
              <div className="stat-label">Form to fill, not five</div>
            </div>
            <div>
              <div className="stat-value">&lt; 2 min</div>
              <div className="stat-label">Document to extracted profile</div>
            </div>
            <div>
              <div className="stat-value">100%</div>
              <div className="stat-label">Quotes compared side by side</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="container">
          <div className="cta-banner">
            <div>
              <h2>Ready to quote your next customer?</h2>
              <p>Create an agent account and run your first comparison in minutes.</p>
            </div>
            <Button as={Link} to="/signup" variant="accent">
              Create free account
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
