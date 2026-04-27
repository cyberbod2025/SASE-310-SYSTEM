export type OnboardingState = {
  completed: boolean
  step: number
  lastSeen: string
}

const KEY = "sase_onboarding"

export const getOnboarding = (): OnboardingState => {
  if (typeof window === 'undefined') return { completed: false, step: 0, lastSeen: new Date().toISOString() };
  return JSON.parse(localStorage.getItem(KEY) || '{"completed": false, "step": 0}')
}

export const setOnboarding = (data: Partial<OnboardingState>) => {
  if (typeof window === 'undefined') return;
  const current = getOnboarding();
  const newData = { ...current, ...data, lastSeen: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(newData));
  return newData;
}

export const resetOnboarding = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
