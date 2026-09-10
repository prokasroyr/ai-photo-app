import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          const role = data.role || "photographer";
          const isApproved = data.isApproved === true || data.approved === true;

          // 🛑 অ্যাডমিন ছাড়া অন্য কাউকে unapproved অবস্থায় ঢুকতে দেওয়া হবে না
          if (role !== "admin" && !isApproved) {
            await signOut(auth);
            setIsAuthorized(false);
            setLoading(false);
            return;
          }

          if (allowedRoles.length === 0 || allowedRoles.includes(role)) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(true); // ফলব্যাক এক্সেস
        }
      } catch (error) {
        console.error("Error checking role & approval:", error);
        setIsAuthorized(false);
      } font-medium {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center font-semibold text-gray-600 animate-pulse">
          Authenticating...
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}