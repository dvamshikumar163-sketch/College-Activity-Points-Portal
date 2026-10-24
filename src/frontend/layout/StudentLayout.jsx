
import { Outlet } from "react-router-dom";

import PortalHeader from "../Components/PortalHeader";
import StudentSidebar from "../Components/StudentSidebar";

function StudentLayout() {
  return (
    <>
      <PortalHeader />

      <div className="pt-24">
        <StudentSidebar />

        <main className="ml-64 min-h-screen ml-67 mr-2 rounded-lg bg-slate-200 p-6">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default StudentLayout;
