
import { useEffect, useState } from "react";
const API = `${import.meta.env.VITE_API_URL}/api/certificates`;

function FacultyDashboard() {
  const [certificates, setCertificates] = useState([]);
  const [points, setPoints] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Logout faculty
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");

    window.location.href = "/login";
  };

  const fetchPending = async () => {
    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(`${API}/faculty/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load certificates.");
      }

      setCertificates(data.certificates || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const reviewCertificate = async (certificateId, decision) => {
    const awardedPoints =
      decision === "Approved"
        ? Number(points[certificateId] ?? 0)
        : 0;

    if (
      decision === "Approved" &&
      (!Number.isInteger(awardedPoints) || awardedPoints < 0)
    ) {
      setError("Enter a valid non-negative whole number of points.");
      return;
    }

    setBusyId(certificateId);
    setError("");
    setMessage("");

    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API}/faculty/${certificateId}/review`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            decision,
            points: awardedPoints,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Review failed.");
      }

      setMessage(`Certificate ${decision.toLowerCase()} successfully.`);
      await fetchPending();
    } catch (err) {
      setError(err.message || "Could not review certificate.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <p className="p-6">Loading pending certificates...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header with Logout */}
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold">
              Faculty Dashboard
            </h1>

            <p className="text-gray-600">
              Review student activity certificates and award points.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-lg bg-red-600 px-5 py-2 font-semibold text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </header>

        {error && (
          <p className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p className="mb-4 rounded bg-green-100 p-3 text-green-700">
            {message}
          </p>
        )}

        <div className="mb-6 rounded-xl bg-white p-5 shadow">
          <p className="text-gray-500">Pending certificates</p>
          <p className="text-3xl font-bold">{certificates.length}</p>
        </div>

        {certificates.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            No pending certificates found.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {certificates.map((certificate) => (
              <div
                key={certificate._id}
                className="rounded-xl bg-white p-5 shadow"
              >
                <h2 className="mb-3 text-xl font-semibold">
                  {certificate.activityName}
                </h2>

                <p>
                  <strong>Student:</strong>{" "}
                  {certificate.student?.name || "Unknown"}
                </p>

                <p>
                  <strong>Roll number:</strong>{" "}
                  {certificate.student?.roll || "N/A"}
                </p>

                <p>
                  <strong>Category:</strong> {certificate.category}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {certificate.verificationStatus}
                </p>

                {certificate.certificateUrl && (
                  <a
                    href={certificate.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-blue-600 underline"
                  >
                    View Certificate
                  </a>
                )}

                <div className="mt-5">
                  <label
                    htmlFor={`points-${certificate._id}`}
                    className="mb-1 block text-sm font-medium"
                  >
                    Points to award
                  </label>

                  <input
                    id={`points-${certificate._id}`}
                    type="number"
                    min="0"
                    step="1"
                    value={points[certificate._id] ?? ""}
                    onChange={(event) =>
                      setPoints((previous) => ({
                        ...previous,
                        [certificate._id]: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border p-2"
                    placeholder="Enter points"
                  />
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    disabled={busyId === certificate._id}
                    onClick={() =>
                      reviewCertificate(certificate._id, "Approved")
                    }
                    className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50"
                  >
                    {busyId === certificate._id
                      ? "Processing..."
                      : "Approve"}
                  </button>

                  <button
                    disabled={busyId === certificate._id}
                    onClick={() =>
                      reviewCertificate(certificate._id, "Rejected")
                    }
                    className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={fetchPending}
          className="mt-6 rounded-lg border bg-white px-4 py-2"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

export default FacultyDashboard;

