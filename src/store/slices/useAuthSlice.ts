import { useState, useEffect } from "react";
import { UserRole, AppModule } from "../../types";
import { useAuth } from "../../components/AuthProvider";

export const useAuthSlice = (initialRole: UserRole = UserRole.GUEST) => {
  const { role } = useAuth();
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(initialRole);
  const [currentModule, setCurrentModule] = useState<AppModule>(AppModule.HOME);
  const [isTutorMode, setIsTutorMode] = useState(false);

  // Sync role from AuthProvider
  useEffect(() => {
    if (role) {
      setCurrentUserRole(role as UserRole);
    }
  }, [role]);

  const switchRole = (newRole: UserRole) => {
    setCurrentUserRole(newRole);
    setIsTutorMode(false);
    setCurrentModule(AppModule.HOME);
  };

  const toggleTutorMode = () => {
    setIsTutorMode((prev) => !prev);
  };

  return {
    currentUserRole,
    setCurrentUserRole,
    currentModule,
    setCurrentModule,
    isTutorMode,
    setIsTutorMode,
    switchRole,
    toggleTutorMode,
  };
};
