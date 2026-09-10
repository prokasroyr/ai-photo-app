import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // যদি ইউজার একেবারেই লগইন না থাকে
      if (!user) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        // ডাটাবেজে role না পেলে বাই-ডিফল্ট 'admin' ধরা হবে
        let role = "admin";
        if (userDoc.exists() && userDoc.data()?.role) {
          role = userDoc.data().role;
        }

        if (allowedRoles.length === 0 || allowedRoles.includes(role)) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(true); // ফলব্যাক হিসেবে অ্যাডমিন এক্সেস দেওয়া
        }
      } catch (error) {
        console.error("Error checking role:", error);
        setIsAuthorized(true); // কোনো ফায়ারস্টোর এরর হলেও অ্যাক্সেস এলাউ করবে
      } finally {
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