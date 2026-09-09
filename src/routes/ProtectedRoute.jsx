import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase"; // db (Firestore) ইমপোর্ট করা নিশ্চিত করুন

function ProtectedRoute({ allowedRoles }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Firestore থেকে ইউজারের রোল রিড করা
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          } else {
            setRole("client"); // ডাটা না থাকলে ডিফল্ট client
          }
        } catch (error) {
          console.error("Role fetching error:", error);
          setRole("client");
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">🔐 Checking Authorization...</div>
      </div>
    );
  }

  // ১. ইউজার লগইন না থাকলে লগইন পেজে পাঠাবে
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ২. যদি নির্দিষ্ট রোল দেওয়া থাকে এবং ইউজারের রোল না মিলে
  if (allowedRoles && !allowedRoles.includes(role)) {
    return role === "admin" ? <Navigate to="/dashboard" replace /> : <Navigate to="/client" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;