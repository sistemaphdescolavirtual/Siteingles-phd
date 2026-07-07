import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useCursorEffect } from '@/hooks/useCursorEffect';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import EnglishModulesPage from '@/pages/EnglishModulesPage';
import ProfessorDashboard from '@/pages/ProfessorDashboard';
import StudentDashboard from '@/pages/StudentDashboard';
import AdmDashboard from '@/pages/AdmDashboard';

export type Page = 'home' | 'login' | 'register' | 'english-modules' | 'professor-dashboard' | 'student-dashboard' | 'adm-dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { isAuthenticated, currentUser, logout } = useAuthStore();

  // Initialize cursor effect globally
  useCursorEffect();

  // Handle navigation
  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auto-redirect based on auth state
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'professor') {
        setCurrentPage('professor-dashboard');
      } else if (currentUser.role === 'aluno') {
        setCurrentPage('student-dashboard');
      } else if (currentUser.role === 'gestor' || currentUser.role === 'admin') {
        setCurrentPage('adm-dashboard');
      }
    }
  }, [isAuthenticated, currentUser]);

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
      case 'english-modules':
        return <EnglishModulesPage key="english-modules" navigateTo={navigateTo} />;
      case 'professor-dashboard':
        return <ProfessorDashboard key="professor-dashboard" {...pageProps} />;
      case 'student-dashboard':
        return <StudentDashboard key="student-dashboard" {...pageProps} />;
      case 'adm-dashboard':
        return <AdmDashboard key="adm-dashboard" {...pageProps} />;
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
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
