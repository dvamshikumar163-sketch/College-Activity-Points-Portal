
import { useCallback, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("faculty");
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");
    window.location.href = "/login";
  };

  const fetchFaculty = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Admin token not found. Please log in again.");
      }

      if (!API_URL) {
        throw new Error("API URL is not configured. Please contact the administrator.");
      }

      const response = await fetch(`${API_URL}/api/admin/faculty`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load faculty.");
      }

      setFaculty(result.faculty || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const handleToggleAccess = async (member) => {
    setUpdatingId(member._id);
    setError("");
    setMessage("");

    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Admin token not found. Please log in again.");
      }

      const enableAccess = !member.facultyAccess;

      const response = await fetch(
        `${API_URL}/api/admin/faculty/${member._id}/access`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            facultyAccess: enableAccess,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update faculty access."
        );
      }

      setMessage(
        enableAccess
          ? `Faculty access approved for ${member.email}.`
          : `Faculty access disabled for ${member.email}.`
      );

      await fetchFaculty();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setUpdatingId("");
    }
  };

  const handleCreateFaculty = async (event) => {
    event.preventDefault();
    setCreating(true);
    setError("");
    setMessage("");

    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Admin token not found. Please log in again.");
      }

      if (!API_URL) {
        throw new Error("API URL is not configured. Please contact the administrator.");
      }

      const response = await fetch(`${API_URL}/api/admin/faculty`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create faculty.");
      }

      setMessage("Faculty account created successfully!");
      setEmail("");
      setPassword("");

      await fetchFaculty();
      setActiveTab("faculty");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              CollegePoints
            </h1>
            <p className="text-sm text-gray-500">Admin Dashboard</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700">
              Administrator
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome, Admin
        </h2>

        <p className="mt-2 text-gray-600">
          Manage faculty accounts and permissions.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => {
              setActiveTab("faculty");
              setError("");
              setMessage("");
            }}
            className={`rounded-lg px-5 py-3 font-medium ${
              activeTab === "faculty"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Faculty Management
          </button>

          <button
            onClick={() => {
              setActiveTab("create");
              setError("");
              setMessage("");
            }}
            className={`rounded-lg px-5 py-3 font-medium ${
              activeTab === "create"
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            Create Faculty
          </button>
        </div>

        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          {error && (
            <p className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
              {error}
            </p>
          )}

          {message && (
            <p className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">
              {message}
            </p>
          )}

          {activeTab === "faculty" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Faculty Accounts
                </h3>

                <button
                  onClick={fetchFaculty}
                  disabled={loading}
                  className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Refresh"}
                </button>
              </div>

              {loading ? (
                <p>Loading faculty accounts...</p>
              ) : faculty.length === 0 ? (
                <p className="text-gray-500">
                  No faculty accounts found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b text-gray-600">
                        <th className="p-3">Email</th>
                        <th className="p-3">Access</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {faculty.map((member) => (
                        <tr
                          key={member._id}
                          className="border-b last:border-0"
                        >
                          <td className="p-3">{member.email}</td>

                          <td className="p-3">
                            <span
                              className={`rounded-full px-3 py-1 text-sm ${
                                member.facultyAccess
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {member.facultyAccess
                                ? "Approved"
                                : "Pending"}
                            </span>
                          </td>

                          <td className="p-3">
                            <button
                              onClick={() => handleToggleAccess(member)}
                              disabled={updatingId === member._id}
                              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                                member.facultyAccess
                                  ? "bg-red-600 hover:bg-red-700"
                                  : "bg-green-600 hover:bg-green-700"
                              }`}
                            >
                              {updatingId === member._id
                                ? "Updating..."
                                : member.facultyAccess
                                ? "Disable Access"
                                : "Approve"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "create" && (
            <div className="max-w-lg">
              <h3 className="text-xl font-semibold">
                Create Faculty Account
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                The faculty member will use these credentials to log in.
              </p>

              <form
                onSubmit={handleCreateFaculty}
                className="mt-6 space-y-5"
              >
                <div>
                  <label
                    htmlFor="faculty-email"
                    className="mb-2 block font-medium text-gray-700"
                  >
                    Faculty Email
                  </label>

                  <input
                    id="faculty-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="faculty@college.edu"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="faculty-password"
                    className="mb-2 block font-medium text-gray-700"
                  >
                    Temporary Password
                  </label>

                  <input
                    id="faculty-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter a temporary password"
                    minLength={8}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-purple-500"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    Use a strong temporary password and share it securely.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Faculty"}
                </button>
              </form>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;

