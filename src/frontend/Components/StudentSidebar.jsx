

import {
  LayoutDashboard,
  UserRound,
  Upload,
  History,
  LogOut,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

function StudentSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
        name: "Student Info",
        path: "/studentHome",
        icon: UserRound,
    },
    {
        name: "Upload Certificate",
        path: "/uploadCertificate",
        icon: Upload,
    },
    {
        name: "Certificate History",
        path: "/history",
        icon: History,
    },
    {
        name: "Dashboard",
        path: "/studentEdit",
        icon: LayoutDashboard,
    },
];
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("studentId");
    sessionStorage.removeItem("userEmail");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed left-0 top-18 rounded-lg  bottom-0 z-40 flex w-64 flex-col border-r border-slate-700 bg-slate-900 p-4 text-white">
      <h2 className="mb-6 px-3 text-lg font-bold">
        Student Menu
      </h2>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-700 pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg p-3 text-slate-300 transition-colors hover:bg-red-600 hover:text-white"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default StudentSidebar;
