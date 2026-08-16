import { Link } from "react-router-dom";
import Logo from "../common/Logo";
import Button from "../common/Button";
import { MenuIcon } from "../common/icons";
import "./Navbar.css";

const LINKS = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Insurers", href: "#insurers" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" aria-label="Synova home">
          <Logo />
        </Link>

        <nav className="navbar-links" aria-label="Primary">
          {LINKS.map((link) => (
            <a key={link.label} className="navbar-link" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="navbar-actions">
          <Button as={Link} to="/signin" variant="secondary" size="sm">
            Sign In
          </Button>
          <Button as={Link} to="/signup" variant="accent" size="sm">
            Get Started
          </Button>
          <button className="navbar-menu-btn" aria-label="Open menu">
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
