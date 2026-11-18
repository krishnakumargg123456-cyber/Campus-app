import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Phone, User, GraduationCap, MapPin, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlatformConfig } from '../../context/PlatformConfigContext';
import { VerifyOtpModal } from './VerifyOtpModal';

const INDIAN_COLLEGES = [
  'Indian Institute of Technology, Bombay',
  'Indian Institute of Technology, Delhi',
  'Indian Institute of Technology, Madras',
  'Delhi Technological University (DTU)',
  'BITS Pilani',
  'National Institute of Technology, Tiruchirappalli',
  'Vellore Institute of Technology (VIT)',
  'College of Engineering, Pune (COEP)',
  'Jadavpur University, Kolkata',
  'Anna University, Chennai',
  'Banaras Hindu University (BHU)',
  'University of Delhi (DU)',
  'SRM Institute of Science and Technology',
  'Manipal Academy of Higher Education',
  'Symbiosis International University',
  'OTHER_CUSTOM',
];

const DEGREES = [
  'B.Tech in Computer Science & AI',
  'B.Tech in Electronics & Communication',
  'B.Tech in Mechanical Engineering',
  'B.Tech in Electrical Engineering',
  'B.Sc in Data Science & Mathematics',
  'B.Sc in Computer Science / IT',
  'Bachelor of Computer Applications (BCA)',
  'Master of Computer Applications (MCA)',
  'M.Tech in Artificial Intelligence',
  'MBA in Technology Management',
  'Bachelor of Commerce (B.Com / BBA)',
  'B.Des in Product & UI/UX Design',
  'OTHER_CUSTOM',
];

const SEMESTERS = [
  'Semester 1 (1st Year)',
  'Semester 2 (1st Year)',
  'Semester 3 (2nd Year)',
  'Semester 4 (2nd Year)',
  'Semester 5 (3rd Year)',
  'Semester 6 (3rd Year)',
  'Semester 7 (4th Year)',
  'Semester 8 (4th Year)',
];

const STATES = [
  'Maharashtra',
  'Delhi NCR',
  'Karnataka',
  'Tamil Nadu',
  'Uttar Pradesh',
  'Telangana',
  'West Bengal',
  'Rajasthan',
  'Gujarat',
  'Bihar',
  'Madhya Pradesh',
  'Punjab',
  'Other State / UT',
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, verifyOtp, quickLoginDemo } = useAuth();
  const { config } = usePlatformConfig();

  const [selectedCollegeChoice, setSelectedCollegeChoice] = useState(INDIAN_COLLEGES[0]);
  const [customCollegeName, setCustomCollegeName] = useState('');
  const [selectedCourseChoice, setSelectedCourseChoice] = useState(DEGREES[0]);
  const [customCourseName, setCustomCourseName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    dob: '',
    semester: SEMESTERS[5], // Default Sem 6
    state: STATES[0],
    city: 'Mumbai',
    termsAccepted: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 4) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (config?.website?.allowRegistration === false) {
      setError('New student account registration is currently closed by platform administration.');
      return;
    }

    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid student or institutional email.');
      return;
    }
    if (!formData.mobile.trim() || formData.mobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.termsAccepted) {
      setError('You must accept the Terms of Service & Privacy Policy.');
      return;
    }

    const effectiveCollege =
      selectedCollegeChoice === 'OTHER_CUSTOM'
        ? customCollegeName.trim()
        : selectedCollegeChoice;

    const effectiveCourse =
      selectedCourseChoice === 'OTHER_CUSTOM'
        ? customCourseName.trim()
        : selectedCourseChoice;

    if (!effectiveCollege) {
      setError('Please enter your College or University name.');
      return;
    }

    if (!effectiveCourse) {
      setError('Please enter your Degree or Course name.');
      return;
    }

    setIsLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      college: effectiveCollege,
      course: effectiveCourse,
      semester: formData.semester,
      password: formData.password,
    });
    setIsLoading(false);

    if (result.success) {
      setIsOtpModalOpen(true);
    } else if (result.error) {
      setError(result.error);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    const res = await verifyOtp(code);
    if (res.success) {
      setIsOtpModalOpen(false);
      navigate('/onboarding');
    }
    return res;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 sm:px-6 lg:px-8 selection:bg-blue-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center px-4 mb-6">
        <div className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue-600 via-blue-700 to-indigo-900 flex items-center justify-center text-white shadow-md">
            <span className="font-extrabold text-lg tracking-tight">K</span>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-slate-100">
            KAMPUS
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Create Your Student Account
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Join thousands of university scholars managing attendance, coursework & campus life
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl px-4">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200/80 dark:border-slate-800">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </div>
          )}

          {/* 1-Click Demo Profile Option */}
          <div className="mb-6 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                P
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-blue-950 dark:text-blue-200 truncate">
                  Test Instantly as Priya Sharma
                </div>
                <div className="text-[11px] text-blue-700/80 dark:text-blue-300/80 truncate">
                  IIT Bombay · CS & AI Sem 6
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (config?.website?.allowLogin === false) {
                  setError('Student portal sign-in is temporarily paused by administrator policy.');
                  return;
                }
                quickLoginDemo();
                navigate('/');
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold whitespace-nowrap shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              1-Click Demo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. priya.sharma@cse.iitb.ac.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Mobile Number & Date of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number (for OTP) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date of Birth (optional)
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Row 3: College / University with Custom Option */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  College / University *
                </label>
                {selectedCollegeChoice !== 'OTHER_CUSTOM' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCollegeChoice('OTHER_CUSTOM')}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    + Add My College
                  </button>
                )}
              </div>
              <div className="relative">
                <GraduationCap className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <select
                  value={selectedCollegeChoice}
                  onChange={(e) => setSelectedCollegeChoice(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                >
                  {INDIAN_COLLEGES.map((col, idx) => (
                    <option key={idx} value={col}>
                      {col === 'OTHER_CUSTOM' ? '+ Other (Type Your College or University)' : col}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCollegeChoice === 'OTHER_CUSTOM' && (
                <div className="mt-2.5 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1.5 animate-in fade-in duration-200">
                  <label className="block text-[11px] font-bold text-blue-800 dark:text-blue-300">
                    Type Your University or College Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Banaras Hindu University, Patna Women's College, Amity, etc."
                    value={customCollegeName}
                    onChange={(e) => setCustomCollegeName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-blue-600 dark:text-blue-400">
                    Any Indian or international college name is accepted and will appear on your KAMPUS ID.
                  </p>
                </div>
              )}
            </div>

            {/* Row 4: Course & Semester with Custom Course Option */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Course / Degree *
                  </label>
                  {selectedCourseChoice !== 'OTHER_CUSTOM' && (
                    <button
                      type="button"
                      onClick={() => setSelectedCourseChoice('OTHER_CUSTOM')}
                      className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      + Custom
                    </button>
                  )}
                </div>
                <select
                  value={selectedCourseChoice}
                  onChange={(e) => setSelectedCourseChoice(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                >
                  {DEGREES.map((deg, idx) => (
                    <option key={idx} value={deg}>
                      {deg === 'OTHER_CUSTOM' ? '+ Other (Type Your Degree / Course)' : deg}
                    </option>
                  ))}
                </select>

                {selectedCourseChoice === 'OTHER_CUSTOM' && (
                  <div className="mt-2 p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1 animate-in fade-in duration-200">
                    <label className="block text-[11px] font-bold text-blue-800 dark:text-blue-300">
                      Type Your Degree / Course *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. B.Com Honours, MBBS, B.A. History..."
                      value={customCourseName}
                      onChange={(e) => setCustomCourseName(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Year / Semester *
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                >
                  {SEMESTERS.map((sem, idx) => (
                    <option key={idx} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 5: State & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  State *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                >
                  {STATES.map((st, idx) => (
                    <option key={idx} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Row 6: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength indicator */}
                {formData.password && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${(strength.score / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  I agree to the <span className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Terms and Conditions</span> and acknowledge the <span className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Privacy Policy</span>.
                </span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98"
            >
              <span>{isLoading ? 'Creating account...' : 'Create Account & Verify OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Already have an account link */}
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            <span>Already have a KAMPUS account? </span>
            <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <VerifyOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onVerify={handleVerifyOtp}
        emailOrPhone={formData.mobile || formData.email}
      />
    </div>
  );
};
