import { useState, useEffect } from "react";
import { UserRole, AppModule } from "../../types";
import { useAuth } from "../../components/AuthProvider";

export const useAuthSlice = (initialRole: UserRole = UserRole.GUEST) => {
  const { role, profile } = useAuth();
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(initialRole);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [currentModule, setCurrentModule] = useState<AppModule>(
    AppModule.WELCOME,
  );
  const [isTutorMode, setIsTutorMode] = useState(false);

  // Sync role and profile from AuthProvider
  useEffect(() => {
    if (role) {
      setCurrentUserRole(role as UserRole);
    }
    if (profile) {
      setCurrentUserProfile(profile);
    }
  }, [role, profile]);

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
    currentUserProfile,
    setCurrentUserProfile,
    currentModule,
    setCurrentModule,
    isTutorMode,
    setIsTutorMode,
    switchRole,
    toggleTutorMode,
  };
};
