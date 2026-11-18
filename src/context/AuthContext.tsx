import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAuthData, StudentProfile } from '../types';
import { CURRENT_STUDENT } from '../data/mockData';
import { resolveAssetUrl } from '../utils/assetResolver';

interface AuthContextType {
  user: UserAuthData | null;
  profile: StudentProfile;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  login: (emailOrPhone: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (studentData: Partial<UserAuthData> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (code: string) => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: (onboardingData: Partial<StudentProfile>) => void;
  logout: () => void;
  quickLoginDemo: () => void;
  updateProfile: (updated: Partial<StudentProfile>) => void;
}

const DEFAULT_DEMO_USER: UserAuthData = {
  id: 'usr_22b030149',
  name: CURRENT_STUDENT.name,
  email: CURRENT_STUDENT.email,
  mobile: CURRENT_STUDENT.mobile,
  college: CURRENT_STUDENT.college,
  course: CURRENT_STUDENT.course,
  semester: CURRENT_STUDENT.semester,
  enrollmentNo: CURRENT_STUDENT.enrollmentNo,
  avatarUrl: CURRENT_STUDENT.avatarUrl,
  hasCompletedOnboarding: true,
  isVerified: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with demo user or persisted user in localStorage
  const [user, setUser] = useState<UserAuthData | null>(() => {
    try {
      const saved = localStorage.getItem('kampus_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...parsed, avatarUrl: resolveAssetUrl(parsed?.avatarUrl) || CURRENT_STUDENT.avatarUrl };
      }
      // Default to demo student Priya Sharma so app works immediately out of the box
      return DEFAULT_DEMO_USER;
    } catch {
      return DEFAULT_DEMO_USER;
    }
  });

  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const savedProfile = localStorage.getItem('kampus_student_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        return { ...parsed, avatarUrl: resolveAssetUrl(parsed?.avatarUrl) || CURRENT_STUDENT.avatarUrl };
      }
      return CURRENT_STUDENT;
    } catch {
      return CURRENT_STUDENT;
    }
  });

  const [pendingRegistration, setPendingRegistration] = useState<UserAuthData | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('kampus_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('kampus_auth_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('kampus_student_profile', JSON.stringify(profile));
  }, [profile]);

  const login = async (emailOrPhone: string, password: string, rememberMe: boolean = true) => {
    // Basic validation
    if (!emailOrPhone.trim()) {
      return { success: false, error: 'Please enter your college email or mobile number.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // Check if user was registered or log in as demo
    const authenticatedUser: UserAuthData = {
      id: user?.id || 'usr_registered_' + Date.now(),
      name: user?.name || (emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : 'KAMPUS Scholar'),
      email: emailOrPhone.includes('@') ? emailOrPhone : 'student@kampus.edu.in',
      mobile: !emailOrPhone.includes('@') ? emailOrPhone : '+91 98765 43210',
      college: user?.college || 'Indian Institute of Technology, Bombay',
      course: user?.course || 'B.Tech in Computer Science & AI',
      semester: user?.semester || 'Semester 6',
      enrollmentNo: user?.enrollmentNo || '22B030149',
      avatarUrl: user?.avatarUrl || CURRENT_STUDENT.avatarUrl,
      hasCompletedOnboarding: user?.hasCompletedOnboarding ?? true,
      isVerified: true,
    };

    setUser(authenticatedUser);
    return { success: true };
  };

  const register = async (studentData: Partial<UserAuthData> & { password: string }) => {
    if (!studentData.name?.trim()) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!studentData.email?.trim() || !studentData.email.includes('@')) {
      return { success: false, error: 'A valid university or personal email address is required.' };
    }
    if (!studentData.mobile?.trim()) {
      return { success: false, error: 'Mobile number is required for OTP verification.' };
    }
    if (!studentData.college?.trim()) {
      return { success: false, error: 'Please select your college or university.' };
    }
    if (!studentData.course?.trim()) {
      return { success: false, error: 'Please select your course or degree program.' };
    }
    if (!studentData.semester?.trim()) {
      return { success: false, error: 'Please select your current semester or year.' };
    }

    const newUser: UserAuthData = {
      id: 'usr_' + Date.now(),
      name: studentData.name,
      email: studentData.email,
      mobile: studentData.mobile,
      college: studentData.college,
      course: studentData.course,
      semester: studentData.semester,
      enrollmentNo: studentData.enrollmentNo || 'REG' + Math.floor(100000 + Math.random() * 900000),
      avatarUrl: CURRENT_STUDENT.avatarUrl,
      hasCompletedOnboarding: false,
      isVerified: false,
    };

    setPendingRegistration(newUser);
    return { success: true };
  };

  const verifyOtp = async (code: string) => {
    if (code.length !== 6) {
      return { success: false, error: 'Please enter the complete 6-digit OTP code.' };
    }

    const activeUser = pendingRegistration || {
      ...DEFAULT_DEMO_USER,
      hasCompletedOnboarding: false,
      isVerified: true,
    };

    const verifiedUser: UserAuthData = {
      ...activeUser,
      isVerified: true,
      hasCompletedOnboarding: false,
    };

    setUser(verifiedUser);
    setProfile(prev => ({
      ...prev,
      name: verifiedUser.name,
      email: verifiedUser.email,
      mobile: verifiedUser.mobile,
      college: verifiedUser.college,
      course: verifiedUser.course,
      semester: verifiedUser.semester,
      enrollmentNo: verifiedUser.enrollmentNo,
    }));

    setPendingRegistration(null);
    return { success: true };
  };

  const completeOnboarding = (onboardingData: Partial<StudentProfile>) => {
    if (user) {
      const updatedUser: UserAuthData = {
        ...user,
        hasCompletedOnboarding: true,
        isVerified: true,
      };
      setUser(updatedUser);
    }
    setProfile(prev => ({
      ...prev,
      ...onboardingData,
    }));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kampus_auth_user');
  };

  const quickLoginDemo = () => {
    setUser(DEFAULT_DEMO_USER);
    setProfile(CURRENT_STUDENT);
  };

  const updateProfile = (updated: Partial<StudentProfile>) => {
    setProfile(prev => ({ ...prev, ...updated }));
    if (user) {
      setUser({
        ...user,
        name: updated.name || user.name,
        college: updated.college || user.college,
        course: updated.course || user.course,
        semester: updated.semester || user.semester,
        avatarUrl: updated.avatarUrl || user.avatarUrl,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        hasCompletedOnboarding: user?.hasCompletedOnboarding ?? false,
        login,
        register,
        verifyOtp,
        completeOnboarding,
        logout,
        quickLoginDemo,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
