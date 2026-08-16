import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../features/auth/components/AuthLayout";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { GoogleIcon } from "../components/common/icons";

export default function SignInPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/admin");
  };

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back — pick up where you left off.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@agency.com"
          value={form.email}
          onChange={update("email")}
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Your password"
          value={form.password}
          onChange={update("password")}
          required
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -4 }}>
          <a href="#" style={{ fontSize: 13, fontWeight: 500 }}>
            Forgot password?
          </a>
        </div>
        <Button type="submit" block>
          Continue
        </Button>
      </form>

      <div className="auth-divider">or</div>

      <button type="button" className="auth-google-btn">
        <GoogleIcon />
        Continue with Google
      </button>

      <p className="auth-switch">
        Don&apos;t have an account? <Link to="/signup">Sign up</Link>
      </p>
      <p className="auth-terms">
        By continuing, you agree to Synova&apos;s Terms of Service.
      </p>
    </AuthLayout>
  );
}
