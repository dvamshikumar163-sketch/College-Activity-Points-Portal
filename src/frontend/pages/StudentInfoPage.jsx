

import { useState, useEffect } from "react";
import {
  UserRound,
  Mail,
  IdCard,
  GitBranch,
  GraduationCap,
  Users,
  Trophy,
  CalendarDays,
} from "lucide-react";

function StudentInfoPage() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const email = sessionStorage.getItem("userEmail");

        if (!email) {
          throw new Error("Please log in again.");
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/students`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch student details."
          );
        }

        
        const students = Array.isArray(result)
          ? result
          : result.data;

        if (!Array.isArray(students)) {
          throw new Error("Invalid student data received from the server.");
        }

        const matchedStudent = students.find(
          (item) =>
            item.email?.toLowerCase() === email.toLowerCase()
        );

        if (!matchedStudent) {
          throw new Error("Student profile not found.");
        }

        setStudent(matchedStudent);
      } catch (err) {
        setError(err.message || "Unable to load student details.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, []);

  const categories = [
    { name: "Technical Events", Icon: GitBranch },
    { name: "Workshops", Icon: GraduationCap },
    { name: "Sports", Icon: Trophy },
    { name: "Cultural Activities", Icon: Users },
    { name: "Volunteering", Icon: UserRound },
    { name: "Other Activities", Icon: CalendarDays },
  ];

  // Mongoose Maps may be returned by the API as plain objects.
  const categoryPoints = student?.categoryPoints || {};

  const getCategoryPoints = (category) => {
    let points;

    if (categoryPoints instanceof Map) {
      points = categoryPoints.get(category);
    } else {
      points = categoryPoints[category];
    }

    return Number(points || 0);
  };

  const profileItems = student
    ? [
        { label: "Full Name", value: student.name, Icon: UserRound },
        { label: "Email", value: student.email, Icon: Mail },
        { label: "Roll Number", value: student.roll, Icon: IdCard },
        { label: "Branch", value: student.branch, Icon: GitBranch },
        {
          label: "Academic Year",
          value: `Year ${student.year}`,
          Icon: GraduationCap,
        },
        { label: "Section", value: student.section, Icon: Users },
        {
          label: "Activity Points",
          value: student.activityPoints ?? 0,
          Icon: Trophy,
        },
        {
          label: "Registration Date",
          value: student.createdAt
            ? new Date(student.createdAt).toLocaleDateString()
            : "Not available",
          Icon: CalendarDays,
        },
      ]
    : [];

  return (
    <>
      <h2 className="mb-6 text-2xl font-bold text-slate-800">
        Student Information
      </h2>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-slate-800">
          Student Profile
        </h3>

        {loading ? (
          <p className="text-slate-600">Loading student details...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : student ? (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {profileItems.map(({ label, value, Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon size={22} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-1 break-words font-semibold text-slate-800">
                      {value ?? "Not available"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="mb-5 text-lg font-semibold text-slate-800">
                Category-wise Activity Points
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map(({ name, Icon }) => {
                  const points = getCategoryPoints(name);

                  return (
                    <div
                      key={name}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Icon size={22} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-600">
                          {name}
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-800">
                          {points}
                          <span className="text-sm font-normal text-slate-500">
                            {" "}points
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </section>
    </>
  );
}

export default StudentInfoPage;
