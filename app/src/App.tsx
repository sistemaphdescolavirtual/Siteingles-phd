import { Suspense, lazy, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useCursorEffect } from '@/hooks/useCursorEffect';

// Pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const EnglishModulesPage = lazy(() => import('@/pages/EnglishModulesPage'));
const ProfessorDashboard = lazy(() => import('@/pages/ProfessorDashboard'));
const StudentDashboard = lazy(() => import('@/pages/StudentDashboard'));
const AdmDashboard = lazy(() => import('@/pages/AdmDashboard'));
const PrivacyPolicyPage = lazy(() => import('@/pages/LegalPages/PrivacyPolicyPage'));
const TermsOfUsePage = lazy(() => import('@/pages/LegalPages/TermsOfUsePage'));

const ForgotPasswordPage = lazy(
  () => import('@/pages/ForgotPasswordPage'),
);

const ResetPasswordPage = lazy(
  () => import('@/pages/ResetPasswordPage'),
);


export type Page =
  | 'home'
  | 'login'
  | 'register'
  | 'english-modules'
  | 'professor-dashboard'
  | 'student-dashboard'
  | 'adm-dashboard'
  | 'forgot-password'
  | 'reset-password'
  | 'privacy-policy'
  | 'terms-of-use';


function getInitialPage(): Page {
  const page = new URLSearchParams(
    window.location.search,
  ).get('page');

  return page === 'reset-password'
    ? 'reset-password'
    : 'home';
}


function AppLoading() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-brand-green/20 border-t-brand-green animate-spin" />
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
          Carregando PHD
        </p>
      </div>
    </div>
  );
}


function App() {
 const [currentPage, setCurrentPage] = useState<Page>(
  getInitialPage,
); 
  const { isAuthenticated, currentUser, logout } = useAuthStore();

  // Initialize cursor effect globally
  useCursorEffect();

  // Handle navigation
  const navigateTo = (page: Page) => {
        if (
      page !== 'reset-password' &&
      window.location.search
    ) {
      window.history.replaceState(
        {},
        '',
        window.location.pathname,
      );
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auto-redirect based on auth state

   

  useEffect(() => {
 if (currentPage === 'reset-password') {
      return;
    }

    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'professor') {
        setCurrentPage('professor-dashboard');
      } else if (currentUser.role === 'aluno') {
        setCurrentPage('student-dashboard');
      } else if (currentUser.role === 'gestor' || currentUser.role === 'admin') {
        setCurrentPage('adm-dashboard');
      }
    }
 }, [isAuthenticated, currentUser, currentPage]);

  // Handle logout
  const handleLogout = () => {
    logout();
    setCurrentPage('home');
  };

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const renderPage = () => {
    const pageProps = { navigateTo, onLogout: handleLogout };

    switch (currentPage) {
      case 'home':
        return <HomePage key="home" navigateTo={navigateTo} />;
      case 'login':
        return <LoginPage key="login" navigateTo={navigateTo} />;
      case 'register':
        return <RegisterPage key="register" navigateTo={navigateTo} />;
        case 'forgot-password':
  return (
    <ForgotPasswordPage
      key="forgot-password"
      navigateTo={navigateTo}
    />
  );

case 'reset-password':
  return (
    <ResetPasswordPage
      key="reset-password"
      navigateTo={navigateTo}
    />
  );
        
      case 'english-modules':
        return <EnglishModulesPage key="english-modules" navigateTo={navigateTo} />;
      case 'professor-dashboard':
        return <ProfessorDashboard key="professor-dashboard" {...pageProps} />;
      case 'student-dashboard':
        return <StudentDashboard key="student-dashboard" {...pageProps} />;
      case 'adm-dashboard':
        return <AdmDashboard key="adm-dashboard" {...pageProps} />;
           case 'privacy-policy':
        return <PrivacyPolicyPage key="privacy-policy" navigateTo={navigateTo} />;

      case 'terms-of-use':
        return <TermsOfUsePage key="terms-of-use" navigateTo={navigateTo} />;
      default:
        return <HomePage key="home" navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
        <Suspense fallback={<AppLoading />}>
            {renderPage()}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
