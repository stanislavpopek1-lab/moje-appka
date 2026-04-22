import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { auth } from "@/firebase";

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  const { data: authData, isFetched } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const user = auth.currentUser;

      return {
        user,
        isAuthenticated: !!user,
      };
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full text-center space-y-6">

        {/* 404 */}
        <h1 className="text-7xl font-light text-slate-300">404</h1>

        <div className="h-0.5 w-16 bg-slate-200 mx-auto"></div>

        <h2 className="text-2xl font-medium text-slate-800">
          Page Not Found
        </h2>

        <p className="text-slate-600">
          Stránka <span className="font-medium">"{pageName}"</span> neexistuje.
        </p>

        {/* ADMIN SECTION (optional Firebase future) */}
        {isFetched && authData?.isAuthenticated && (
          <div className="mt-6 p-4 bg-slate-100 rounded-lg">
            <p className="text-sm text-slate-600">
              Přihlášený uživatel: {authData.user?.email}
            </p>
          </div>
        )}

        {/* HOME BUTTON */}
        <button
          onClick={() => (window.location.href = "/")}
          className="px-4 py-2 bg-white border rounded-lg hover:bg-slate-50"
        >
          Domů
        </button>
      </div>
    </div>
  );
}