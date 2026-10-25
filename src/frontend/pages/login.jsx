

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL?.trim();

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!API_URL) {
      setMessage(
        "Backend URL is missing. Please check the Vercel VITE_API_URL environment variable and redeploy."
      );
      console.error("VITE_API_URL is not configured in this build.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const responseText = await response.text();
      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            `The server returned an invalid response (HTTP ${response.status}).`
          );
        }
      }

      if (!response.ok) {
        setMessage(data.message || `Login failed (HTTP ${response.status}).`);
        return;
      }

      if (!data.token) {
        setMessage("The server did not return a login token.");
        return;
      }

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem(
        "userEmail",
        data.user?.email || normalizedEmail
      );

      if (data.user?.role) {
        sessionStorage.setItem("userRole", data.user.role);
      }

      if (data.student?._id) {
        sessionStorage.setItem("studentId", data.student._id);
      }

      if (data.user?.role === "Admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (data.user?.role === "Faculty") {
        navigate("/facultyDashboard", { replace: true });
      } else if (data.user?.role === "Student") {
        navigate("/studentHome", { replace: true });
      } else {
        sessionStorage.clear();
        setMessage(
          "Unrecognized user role. Please contact the administrator."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.message || "Cannot connect to the backend. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-gray-800">
          Welcome Back
        </h1>

        <p className="mb-8 mt-2 text-center text-gray-500">
          College Activity Points Portal
        </p>

        {message && (
          <p
            role="alert"
            className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600"
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
