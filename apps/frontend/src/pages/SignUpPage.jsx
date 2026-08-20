import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../features/auth/components/AuthLayout";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { GoogleIcon } from "../components/common/icons";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/signin");
  };

  return (
    <AuthLayout title="Sign up" subtitle="Create your agent account to start quoting.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form-row">
          <Input
            id="firstName"
            label="First name"
            placeholder="Your first name"
            value={form.firstName}
            onChange={update("firstName")}
            required
          />
          <Input
            id="lastName"
            label="Last name"
            placeholder="Your last name"
            value={form.lastName}
            onChange={update("lastName")}
            required
          />
        </div>
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="Your email address"
          value={form.email}
          onChange={update("email")}
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Create a password"
          value={form.password}
          onChange={update("password")}
          required
        />
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
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
      <p className="auth-terms">
        By creating an account, you agree to Synova&apos;s Terms of Service.
      </p>
    </AuthLayout>
  );
}
