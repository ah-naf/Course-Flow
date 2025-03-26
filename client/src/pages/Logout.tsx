import { useUserStore } from "@/store/userStore";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

function Logout() {
  const { logout, setUser } = useUserStore();

  useEffect(() => {
    logout();
    setUser(null);
  }, []);

  return <Navigate to={"/"} />;
}

export default Logout;
