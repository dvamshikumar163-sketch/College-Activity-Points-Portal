import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [branch, setBranch] = useState("CSE");
  const [year, setYear] = useState("1");
  const [section, setSection] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const email =
    location.state?.email || sessionStorage.getItem("userEmail") || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const token = sessionStorage.getItem("profileSetupToken");

    if (!token) {
      setMessage("Your setup session is missing or expired. Please register again.");
      return;
    }

    if (!name.trim() || !roll.trim() || !section.trim()) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/students`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            roll: roll.trim(),
            branch,
            year: Number(year),
            section: section.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to save student details.");
        return;
      }

      if (data.data?.email) {
        sessionStorage.setItem("userEmail", data.data.email);
      }

      if (data.data?._id) {
        sessionStorage.setItem("studentId", data.data._id);
      }

      sessionStorage.removeItem("profileSetupToken");

      navigate("/login", {
        state: { email: data.data?.email || email },
      });
    } catch (error) {
      console.error("Student profile error:", error);
      setMessage("Cannot connect to the backend. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg sm:p-10">
        <h1 className="text-center text-3xl font-bold text-gray-800">
          Student Details
        </h1>
        <p className="mb-8 mt-2 text-center text-gray-500">
          Complete your profile before logging in.
        </p>

        {email && (
          <p className="mb-5 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            Registered email: <strong>{email}</strong>
          </p>
        )}

        {message && (
          <p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block font-medium">
              Full Name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="roll" className="mb-2 block font-medium">
              Roll Number
            </label>
            <input
              id="roll"
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
              placeholder="Enter your roll number"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="branch" className="mb-2 block font-medium">
                Branch
              </label>
              <select
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
              >
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="CIVIL">CIVIL</option>
                <option value="MECH">MECH</option>
              </select>
            </div>

            <div>
              <label htmlFor="year" className="mb-2 block font-medium">
                Academic Year
              </label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="section" className="mb-2 block font-medium">
              Section
            </label>
            <input
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="Enter your section"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Saving Details..." : "Save Student Details"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StudentDashboard;