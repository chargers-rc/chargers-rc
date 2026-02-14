import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import PageContainer from "@/components/ui/PageContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function Login() {
  const navigate = useNavigate();
  const { clubSlug } = useParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    navigate(`/${clubSlug}/dashboard`);
  };

  return (
    <PageContainer>

      <h1 className="text-2xl font-bold text-text-base mb-md">
        Login
      </h1>

      <Card className="flex flex-col gap-md">

        <form onSubmit={handleLogin} className="flex flex-col gap-md">

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {errorMsg && (
            <p className="text-red-600 text-sm">{errorMsg}</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </Button>

        </form>

      </Card>

      <p className="text-center mt-md text-text-muted">
        Don’t have an account?{" "}
        <Link
          to={`/${clubSlug}/signup`}
          className="text-brand-primary font-semibold"
        >
          Sign up
        </Link>
      </p>

    </PageContainer>
  );
}
