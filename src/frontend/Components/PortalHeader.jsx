
import { GraduationCap } from "lucide-react";

function PortalHeader() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full rounded-lg border border-slate-100 bg-slate-900">
      <div className="mx-auto flex w-full items-center justify-center gap-3 p-3">
        <GraduationCap className="h-10 w-10 shrink-0 rounded-lg bg-blue-600 p-1 text-white sm:h-12 sm:w-12" />

        <h1 className="text-center text-lg font-bold text-white sm:text-2xl md:text-3xl">
          Activity Points & Certificate Portal
        </h1>
      </div>
    </header>
  );
}

export default PortalHeader;


