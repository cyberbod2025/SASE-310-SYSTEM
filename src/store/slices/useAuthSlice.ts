import { useState, useEffect } from "react";
import { UserRole, AppModule } from "../../types";
import { useAuth } from "../../components/AuthProvider";

const sanitizeStoredModule = (saved: string | null): AppModule => {
  if (!Object.values(AppModule).includes(saved as AppModule)) {
    return AppModule.WELCOME;
  }

  return saved === AppModule.FERIA ? AppModule.WELCOME : (saved as AppModule);
};

export const useAuthSlice = (initialRole: UserRole = UserRole.GUEST) => {
  const { role, profile } = useAuth();
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(initialRole);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);
  const [currentModule, setCurrentModule] = useState<AppModule>(() => {
    const saved = sessionStorage.getItem("sase_current_module") || localStorage.getItem("sase_current_module");
    return sanitizeStoredModule(saved);
  });
  const [isTutorMode, setIsTutorMode] = useState(false);

  useEffect(() => {
    if (currentModule === AppModule.FERIA && currentUserRole !== UserRole.ALUMNO) {
      sessionStorage.removeItem("sase_current_module");
      localStorage.removeItem("sase_current_module");
      return;
    }

    sessionStorage.setItem("sase_current_module", currentModule);
    localStorage.setItem("sase_current_module", currentModule);
  }, [currentModule, currentUserRole]);

  const [onboardingDays, setOnboardingDays] = useState(0);
  const [onboardingPhase, setOnboardingPhase] = useState<"intro" | "learning" | "active" | "master">("intro");

  // Sync role and profile from AuthProvider
  useEffect(() => {
    if (role) {
      setCurrentUserRole(role as UserRole);
    }
    if (profile) {
      setCurrentUserProfile(profile);
      setUserCreatedAt(profile?.creado_en || null);
      // Simulación de cálculo de fase basado en fecha de creación del perfil
      const createdDate = profile.creado_en ? new Date(profile.creado_en) : new Date();
      const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setOnboardingDays(diffDays);
      
      if (diffDays <= 1) setOnboardingPhase("intro");
      else if (diffDays <= 30) setOnboardingPhase("learning");
      else if (diffDays <= 60) setOnboardingPhase("active");
      else setOnboardingPhase("master");
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
    userCreatedAt,
    onboardingDays,
    onboardingPhase,
    switchRole,
    toggleTutorMode,
  };
};
