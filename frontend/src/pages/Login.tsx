import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { authService } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { resolvedTheme } = useTheme();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) return;
    setLoading(true);
    try {
      const email = identifier.includes("@") ? identifier : `${identifier}@habitflow.app`;
      const { user } = await authService.login({ email, password });
      setUser(user);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen flex-col items-center justify-center bg-background px-6"
    >
      <div className="w-full max-w-sm lg:max-w-[450px]">
        <div className="mb-8 text-center">
          <img
            src="/logoo.png"
            alt="HabitFlow logo"
            className={`mx-auto mb-3 h-12 w-12 object-contain ${resolvedTheme === "light" ? "invert" : "invert-0"}`}
          />
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-1">Sign in to HabitFlow</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">Username or Phone</label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter username or phone"
              className="w-full rounded-[10px] border border-border bg-card px-4 py-3 lg:py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              maxLength={100}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-[10px] border border-border bg-card px-4 py-3 lg:py-4 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                maxLength={100}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} className="text-xl" />
              </button>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogin}
            disabled={loading || !identifier.trim() || !password}
            className=" w-full rounded-[10px] bg-primary py-4 font-semibold text-primary-foreground disabled:opacity-40 transition-opacity"
          >
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-foreground underline-offset-2 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
