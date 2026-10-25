
import { useEffect, useState } from "react";

function CertificateHistory() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const studentId = sessionStorage.getItem("studentId");

        if (!token || !studentId) {
          throw new Error("Please log in again.");
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/certificates/history/${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch certificate history."
          );
        }

        setCertificates(data.certificates || []);
      } catch (error) {
        setError(error.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <p className="p-6">Loading certificate history...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-2 text-2xl font-bold">Upload History</h1>
      <p className="mb-6 text-slate-500">
        Your previously uploaded certificates
      </p>

      {certificates.length === 0 ? (
        <div className="rounded-lg border border-slate-200 p-6 text-center">
          No certificates uploaded yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3">Certificate</th>
                <th className="p-3">Category</th>
                <th className="p-3">Upload Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">File</th>
              </tr>
            </thead>

            <tbody>
              {certificates.map((certificate) => (
                <tr key={certificate._id} className="border-t">
                  <td className="p-3">{certificate.activityName}</td>
                  <td className="p-3">{certificate.category}</td>
                  <td className="p-3">
                    {certificate.createdAt
                      ? new Date(certificate.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="p-3">
                    {certificate.verificationStatus}
                  </td>
                  <td className="p-3">
                    {certificate.certificateUrl && (
                      <a
                        href={certificate.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CertificateHistory;
