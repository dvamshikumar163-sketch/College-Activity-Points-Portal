

import { useRef, useState, useEffect } from "react";

function UploadCertificate() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("Other Activities");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [studentId, setStudentId] = useState("");

  const categories = [
    "Technical Events",
    "Workshops",
    "Sports",
    "Cultural Activities",
    "Volunteering",
    "Other Activities",
  ];

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const email = sessionStorage.getItem("userEmail");
        const token = sessionStorage.getItem("token");

        if (!email || !token) {
          throw new Error("Please log in again.");
        }

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
            result.message || "Failed to fetch student details."
          );
        }

        const students = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.students)
          ? result.students
          : [];

        const matchedStudent = students.find(
          (item) =>
            item.email?.toLowerCase() === email.toLowerCase()
        );

        if (!matchedStudent) {
          throw new Error("Student profile not found.");
        }

        setStudentId(matchedStudent._id);
      } catch (error) {
        setMessage(
          error.message || "Unable to load student details."
        );
      }
    };

    fetchStudent();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a certificate first.");
      return;
    }

    if (!studentId) {
      setMessage("Student details are not loaded. Please try again.");
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      setMessage("Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("certificate", file);
    formData.append("category", category);

    try {
      setLoading(true);
      setMessage("");
      setDetails(null);

      const response = await fetch(
        `http://localhost:8000/api/certificates/process/${studentId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Certificate upload failed."
        );
      }

      setMessage(
        data.message || "Certificate uploaded successfully!"
      );

      setDetails(data.details);
      console.log("Extracted certificate details:", data.details);

      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 rounded-xl border p-6 shadow-sm">
      <h1 className="text-2xl font-bold mb-2">
        Upload Certificate
      </h1>

      <p className="text-slate-500 mb-5">
        Select your certificate and choose its activity category.
        Supported formats: PDF, JPG, JPEG, PNG. Maximum size: 10 MB.
      </p>

      <label
        htmlFor="certificate-category"
        className="block text-sm font-medium text-slate-700 mb-2"
      >
        Activity Category
      </label>

      <select
        id="certificate-category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        className="w-full border rounded-lg p-3 mb-4 bg-white"
      >
        {categories.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <label
        htmlFor="certificate-file"
        className="block text-sm font-medium text-slate-700 mb-2"
      >
        Certificate File
      </label>

      <input
        id="certificate-file"
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="w-full border rounded-lg p-3 mb-4"
        onChange={(event) => {
          setFile(event.target.files?.[0] || null);
          setMessage("");
        }}
      />

      {file && (
        <p className="text-sm mb-4">
          Selected: {file.name}
        </p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={loading || !studentId}
        className="bg-slate-900 text-white px-5 py-3 rounded-lg hover:bg-slate-700 disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload Certificate"}
      </button>

      {message && (
        <p className="mt-4 text-sm" role="status">
          {message}
        </p>
      )}

      {details && (
        <div className="mt-6 rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-3">
            Extracted Certificate Details
          </h2>

          <p>
            <strong>Student Name:</strong>{" "}
            {details.student_name ?? "Not detected"}
          </p>

          <p>
            <strong>Certificate Title:</strong>{" "}
            {details.certificate_title ?? "Not detected"}
          </p>

          <p>
            <strong>Organization:</strong>{" "}
            {details.organization ?? "Not detected"}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {details.date ?? "Not detected"}
          </p>

          <p>
            <strong>Selected Category:</strong> {category}
          </p>
        </div>
      )}
    </div>
  );
}

export default UploadCertificate;
