
import { useState, useEffect } from "react";

function StudentEdit() {
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const fetchStudent = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setMessage("Please log in first.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:8000/api/students",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load student details."
          );
        }

        const email = sessionStorage.getItem("userEmail");

        const student = result.data?.find(
          (item) => item.email === email
        );

        if (!student) {
          throw new Error("Student details not found.");
        }

        setYear(String(student.year ?? ""));
        setSection(student.section ?? "");
      } catch (error) {
        setMessage(
          error.message || "Unable to load student details."
        );
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    const token = sessionStorage.getItem("token");

    if (!token) {
      setMessage("Please log in first.");
      setMessageType("error");
      return;
    }

    if (!year || !section.trim()) {
      setMessage("Please fill in both fields.");
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "http://localhost:8000/api/students/profile/edit",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            year: Number(year),
            section: section.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to save student details."
        );
      }

      setMessage(
        result.message || "Student details saved successfully."
      );
      setMessageType("success");
    } catch (error) {
      setMessage(
        error.message || "Unable to save changes."
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="p-6 text-slate-600">
        Loading student details...
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-6 shadow-md">
        <h1 className="mb-2 text-2xl font-bold text-slate-800">
          Edit Student Details
        </h1>

        <p className="mb-6 text-sm text-slate-500">
          Update your academic year and section.
        </p>

        {message && (
          <p
            className={`mb-4 rounded-lg p-3 text-sm ${
              messageType === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="year"
              className="mb-2 block font-medium text-slate-700"
            >
              Academic Year
            </label>

            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
            >
              <option value="">Select year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="section"
              className="mb-2 block font-medium text-slate-700"
            >
              Section
            </label>

            <input
              id="section"
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="Enter your section"
              required
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default StudentEdit;
