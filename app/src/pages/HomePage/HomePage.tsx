import type { Page } from '@/App';
import { GLOBAL_STYLES } from './styles';
import { useHomePage } from './useHomePage';
import { StatIcon } from './components/StatIcon';
import {
  NAV_LINKS, MARQUEE_ITEMS, HERO_STATS, FLOATING_CARDS,
  INSTITUTIONAL_CARDS, FEATURES_GRID, BENTO_CARDS,
  CONTACT_INFO, CONTACT_FIELDS,
} from './constants';
import logoPhd from '@/assets/logo_phd.png';

interface HomePageProps {
  navigateTo: (page: Page) => void;
}

export default function HomePage({ navigateTo }: HomePageProps) {
  const {
    isScrolled, mobileMenuOpen, setMobileMenuOpen,
    scrollProgress, contactSectionRef,
    scrollTo, handleContactFormSubmit,
  } = useHomePage();

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;500;700&display=swap" rel="stylesheet" />

      <div className="gui-root min-h-screen antialiased">

        {/* Progress Bar */}
        <div id="progress-bar" style={{
          position: 'fixed', top: 0, left: 0, height: '3px', zIndex: 10000,
          width: `${scrollProgress}%`, transition: 'width 0.1s',
          background: 'linear-gradient(90deg, #10b981, #a3e635, #00ff88)',
          boxShadow: '0 0 20px rgba(16,185,129,0.8)',
        }} />

        <div className="noise-overlay" />

        {/* ── Navigation ── */}
        <nav className={`fixed w-full z-50 transition-all duration-500 top-0 ${isScrolled ? 'glass-panel border-b border-white/10' : ''}`}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <button onClick={() => navigateTo('home')} className="flex items-center gap-3 group magnetic-btn">
                <img src={logoPhd} alt="PHD Escola Virtual" className="h-10 w-auto object-contain" />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold tracking-tight text-white display-font">PHD</span>
                  <span className="text-[10px] text-emerald-500 tracking-[0.2em] uppercase font-semibold">Escola Virtual</span>
                </div>
              </button>

              <div className="hidden md:flex items-center gap-8">
                {NAV_LINKS.map(([id, label]) => (
                  <button key={id} onClick={() => scrollTo(id)} className="text-sm text-gray-400 hover:text-emerald-400 transition-colors magnetic-btn relative group">
                    {label}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-emerald-500 group-hover:w-full transition-all duration-300" />
                  </button>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-4">
                <button onClick={() => navigateTo('login')} className="text-sm text-gray-400 hover:text-emerald-400 transition-colors magnetic-btn">Login</button>
                <button onClick={() => navigateTo('register')} className="group relative px-6 py-3 bg-transparent border border-emerald-500/50 text-emerald-400 font-semibold rounded-full overflow-hidden magnetic-btn text-sm">
                  <span className="relative z-10 group-hover:text-black transition-colors duration-300">Começar Agora</span>
                  <div className="absolute inset-0 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </button>
              </div>

              <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen
                  ? <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>}
              </button>
            </div>
          </div>

          <div className={`md:hidden absolute top-full left-0 w-full glass-panel border-t border-white/10 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-4'}`}>
            <div className="px-6 py-8 space-y-4">
              {NAV_LINKS.map(([id, label]) => (
                <button key={id} onClick={() => scrollTo(id)} className="block text-gray-300 hover:text-emerald-500 text-lg transition-colors w-full text-left">{label}</button>
              ))}
              <button onClick={() => { navigateTo('register'); setMobileMenuOpen(false); }} className="block w-full text-center px-6 py-3 bg-emerald-500 text-black font-bold rounded-full mt-4 hover:bg-emerald-400 transition-colors">
                Matricule-se
              </button>
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="relative flex items-center py-8 lg:py-10 overflow-hidden bg-gradient-to-b from-[#0a0a0a] to-[#050505]" style={{ minHeight: '100vh' }}>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-lime-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-emerald-900/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 grid-pattern opacity-30" />

          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10 pt-24 lg:pt-8">
            <div className="space-y-6 order-2 lg:order-1">

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                Domine o{' '}
                <span className="gradient-text italic font-light glitch-text" data-text="Inglês">Inglês</span>
                {' '}e conquiste o <span className="text-gray-500">ENEM</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-lg leading-relaxed border-l-2 border-emerald-500/30 pl-4">
                Aprenda no seu ritmo com métodos inovadores. Cursos preparatórios com resultados comprovados.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => scrollTo('cursos')} className="group relative px-8 py-4 bg-emerald-500 text-black font-bold rounded-full overflow-hidden magnetic-btn shadow-lg shadow-emerald-500/20 text-base">
                  <span className="relative z-10 flex items-center gap-2">
                    Explorar Cursos
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </span>
                  <div className="absolute inset-0 bg-lime-400 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
                <button onClick={() => scrollTo('sobre')} className="px-8 py-4 border border-white/10 rounded-full hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 text-gray-300 magnetic-btn text-base">
                  Saiba Mais
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8 mt-4">
                {HERO_STATS.map((stat, i) => (
                  <div key={i} className={`reveal-element group glass-panel p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${stat.featured ? 'border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10' : stat.color === 'lime' ? 'border-white/10 hover:border-lime-500/30 hover:bg-lime-500/5' : 'border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5'}`} style={{ transitionDelay: stat.delay }}>
                    {stat.featured && <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />}
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${stat.featured ? 'bg-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black' : stat.color === 'lime' ? 'bg-lime-500/10 group-hover:bg-lime-500/20 group-hover:scale-110' : 'bg-emerald-500/10 group-hover:bg-emerald-500/20 group-hover:scale-110'}`}>
                        <StatIcon name={stat.icon} color={stat.color === 'lime' ? 'text-lime-400' : 'text-emerald-500'} featured={stat.featured} />
                      </div>
                    </div>
                    <div className={`text-3xl md:text-4xl font-bold mb-1 display-font transition-colors relative z-10 ${stat.color === 'lime' ? 'text-white group-hover:text-lime-400' : 'text-white group-hover:text-emerald-400'}`}>{stat.value}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider group-hover:text-gray-400 transition-colors relative z-10">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative order-1 lg:order-2 h-[400px] md:h-[500px] lg:h-[600px]" style={{ transform: 'translateY(-80px)' }}>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-emerald-500/20 via-emerald-900/10 to-transparent border border-emerald-500/30 animate-pulse shadow-[0_0_60px_rgba(16,185,129,0.3)] reveal-element" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-80 md:h-80 border border-dashed border-emerald-500/20 rounded-full animate-spin reveal-element" style={{ animationDuration: '20s' }} />
              <div className="absolute top-1/2 left-1/2 w-64 h-64 md:w-72 md:h-72 animate-spin reveal-element" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-lime-400 rounded-full shadow-[0_0_15px_rgba(163,230,53,0.8)]" />
              </div>

              {FLOATING_CARDS.map((card, i) => (
                <div key={i} className={`absolute ${card.pos} glass-panel p-4 rounded-xl animate-float reveal-element border border-emerald-500/20 ${card.hideMobile ? 'hidden md:block' : ''}`} style={{ animationDelay: card.delay }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-lg flex items-center justify-center ${!card.solid ? 'border border-emerald-500/30' : ''}`}>
                      <StatIcon name={card.icon} color={card.iconColor} />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{card.value}</div>
                      <div className={`text-xs ${card.color === 'lime' ? 'text-lime-400' : 'text-emerald-400'}`}>{card.label}</div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="absolute top-1/4 left-1/4 w-20 h-20 border-l-2 border-t-2 border-emerald-500/30 rounded-tl-3xl reveal-element" />
              <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border-r-2 border-b-2 border-lime-400/20 rounded-br-3xl reveal-element" />

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 reveal-element">
                <div className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-emerald-500 to-lime-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 rotate-12 hover:rotate-0 transition-transform duration-500 cursor-pointer group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="text-black w-14 h-14 md:w-16 md:h-16 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 hidden md:flex">
            <span className="text-xs uppercase tracking-[0.3em] text-gray-500">Scroll</span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-emerald-500 to-transparent" />
          </div>
        </section>

        {/* ── Marquee ── */}
        <div className="py-8 bg-emerald-500/5 border-y border-emerald-500/10 marquee-container">
          <div className="marquee-content">
            {MARQUEE_ITEMS.map((text, i) => (
              <span key={i} className={`text-4xl md:text-6xl font-bold mx-8 display-font ${i % 2 === 0 ? 'text-white/10' : 'text-emerald-500/20'}`}>
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* ── Institutional (Sobre) ── */}
        <section id="sobre" className="diagonal-clip py-32 bg-[#0a0a0a] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">

              {/* Visual */}
              <div className="relative h-[600px] reveal-element" id="experience-visual">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="relative w-40 h-40 md:w-48 md:h-48">
                    <div className="absolute inset-0 border-2 border-dashed border-emerald-500/30 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
                    <div className="absolute inset-2 border border-lime-400/20 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                    <div className="absolute inset-4 bg-gradient-to-br from-emerald-500 to-lime-400 rounded-full flex flex-col items-center justify-center shadow-2xl shadow-emerald-500/40 pulse-glow cursor-pointer">
                      <span className="text-5xl md:text-6xl font-bold text-black leading-none display-font">15</span>
                      <span className="text-xs text-black/80 font-bold uppercase tracking-widest mt-1">Anos</span>
                      <span className="text-[10px] text-black/60 font-medium mt-0.5">de excelência</span>
                    </div>
                    <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    </div>
                    <div className="absolute inset-0 animate-spin" style={{ animationDuration: '14s', animationDirection: 'reverse' }}>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-lime-400 rounded-full shadow-[0_0_10px_rgba(163,230,53,0.8)]" />
                    </div>
                  </div>
                </div>

                {INSTITUTIONAL_CARDS.map((card, i) => (
                  <div key={i} className={`absolute ${card.pos} glass-panel p-5 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 animate-float cursor-pointer group`} style={{ animationDelay: card.delay }}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-${card.color}-500/30 group-hover:scale-110 transition-transform ${card.color === 'lime' ? 'bg-gradient-to-br from-lime-400/20 to-lime-400/5' : 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5'}`}>
                        <StatIcon name={card.icon} color={card.color === 'lime' ? 'text-lime-400' : 'text-emerald-500'} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white display-font">{card.value}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">{card.label}</div>
                      </div>
                    </div>
                  </div>
                ))}

                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ opacity: 0.3 }}>
                  <line x1="50%" y1="50%" x2="75%" y2="20%" stroke="#10b981" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse"/>
                  <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="#a3e635" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse" style={{ animationDelay: '1s' }}/>
                  <line x1="50%" y1="50%" x2="80%" y2="85%" stroke="#10b981" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse" style={{ animationDelay: '2s' }}/>
                </svg>

                <div className="absolute top-16 left-8 w-20 h-20 border border-emerald-500/20 rounded-full animate-pulse" />
                <div className="absolute bottom-32 right-8 w-16 h-16 border border-lime-400/20 rotate-45 animate-pulse" style={{ animationDelay: '1s' }} />
              </div>

              {/* Text */}
              <div className="space-y-8 reveal-element">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold tracking-wider uppercase border border-emerald-500/20">
                  Institucional
                </div>
                <h2 className="text-4xl md:text-6xl font-bold leading-tight display-font">
                  Educação que <br />
                  <span className="gradient-text">transforma</span> vidas
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Oferecemos uma metodologia inovadora que combina tecnologia de ponta com excelência pedagógica. Nossos cursos são desenvolvidos por especialistas e constantemente atualizados.
                </p>
                <div className="grid sm:grid-cols-2 gap-6 pt-4">
                  {FEATURES_GRID.map((f, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl glass-panel hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                        <StatIcon name={f.icon} color="text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">{f.title}</h4>
                        <p className="text-sm text-gray-500">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => scrollTo('diferenciais')} className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-semibold group magnetic-btn">
                  Conheça nossos diferenciais
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Diferenciais — Bento Grid ── */}
        <section id="diferenciais" className="py-32 bg-[#050505] relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20 reveal-element">
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold tracking-wider uppercase border border-emerald-500/20 mb-6">
                Por que escolher PHD?
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 display-font">
                Diferenciais que <span className="gradient-text">impulsionam</span> sua carreira
              </h2>
              <p className="text-gray-400 text-lg">Tecnologia de ponta, metodologia comprovada e resultados reais.</p>
            </div>

            <div className="bento-container">
              {/* Large card */}
              <div className="bento-card bento-large bg-gradient-to-br from-emerald-900/20 to-transparent border-emerald-500/20 reveal-element cursor-pointer">
                <div className="h-full flex flex-col justify-between">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 pulse-glow">
                    <svg xmlns="http://www.w3.org/2000/svg" className="text-emerald-500 w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3 display-font">Metodologia Acelerada</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Aprenda 3x mais rápido com nossa técnica exclusiva de imersão linguística combinada com neurociência aplicada à educação.
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-emerald-500 text-sm font-semibold">
                      <span>Conheça o método</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Small cards */}
              {BENTO_CARDS.map((card, i) => (
                <div key={i} className="bento-card reveal-element cursor-pointer" style={{ transitionDelay: card.delay }}>
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                    <StatIcon name={card.icon} color="text-emerald-500" size="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 display-font">{card.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
                </div>
              ))}

              {/* Wide card */}
              <div className="bento-card bento-wide bg-gradient-to-r from-emerald-500/10 to-transparent border-emerald-500/30 reveal-element cursor-pointer" style={{ transitionDelay: '300ms' }}>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="text-emerald-500 w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 display-font">Foco no ENEM</h3>
                    <p className="text-gray-400 leading-relaxed max-w-lg">
                      Preparação específica para as provas de linguagens do ENEM com análise de editais e questões dos últimos 10 anos.
                    </p>
                  </div>
                  <div className="flex gap-8 text-center">
                    <div>
                      <div className="text-3xl font-bold text-emerald-500 display-font">850+</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Nota Máxima</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white display-font">1.2k</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Aprovados</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Cursos ── */}
        <section id="cursos" className="py-32 bg-[#0a0a0a] relative overflow-hidden">
          <div className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-lime-500/5 rounded-full blur-[120px]" />

          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
            <div className="text-center mb-20 reveal-element">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-emerald-500/20 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-emerald-400 text-sm font-semibold tracking-wider uppercase">Nossos Cursos</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold mb-6 display-font">
                Escolha seu <span className="gradient-text italic">caminho</span>
              </h2>
              <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
                Do básico ao avançado, do ENEM à fluência. Temos o curso ideal para seu objetivo.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Inglês do Zero */}
              <div
                onClick={() => navigateTo('english-modules')}
                className="group relative bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 rounded-[2rem] overflow-hidden hover:border-emerald-500/40 transition-all duration-500 reveal-element cursor-pointer course-3d">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-lime-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <div className="p-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-lime-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <svg xmlns="http://www.w3.org/2000/svg" className="text-black w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                      Mais Popular
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4 display-font">Inglês do Zero</h3>
                  <p className="text-gray-400 leading-relaxed mb-8">
                    Do básico à fluência com metodologia imersiva. Conversação, gramática e vocabulário em um único curso completo.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {[['500+','Aulas'],['5 níveis','Progressão'],['Ao vivo','Aulas'],['Certificado','Incluído']].map(([v,l],i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="text-emerald-400 font-bold text-sm">{v}</div>
                        <div className="text-gray-500 text-xs">{l}</div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl group-hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2">
                    Ver Módulos e Preços
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </button>
                </div>
              </div>

              {/* ENEM Master */}
              <div
                onClick={() => { sessionStorage.setItem('cursoAdquirido', 'enem'); navigateTo('register'); }}
                className="group relative bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 rounded-[2rem] overflow-hidden hover:border-lime-500/40 transition-all duration-500 reveal-element cursor-pointer course-3d"
                style={{ transitionDelay: '150ms' }}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-400 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <div className="p-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-lime-400/30">
                      <svg xmlns="http://www.w3.org/2000/svg" className="text-black w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-semibold uppercase tracking-wider">
                      Alta Demanda
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4 display-font">ENEM Master</h3>
                  <p className="text-gray-400 leading-relaxed mb-8">
                    Preparação completa para o ENEM com foco em Linguagens e Redação. Análise das últimas provas e simulados semanais.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {[['300+','Questões'],['10 anos','De provas'],['Redação','Corrigida'],['Simulados','Semanais']].map(([v,l],i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="text-lime-400 font-bold text-sm">{v}</div>
                        <div className="text-gray-500 text-xs">{l}</div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-4 bg-lime-400 text-black font-bold rounded-xl group-hover:bg-lime-300 transition-colors flex items-center justify-center gap-2">
                    Matricular-se Agora
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <button onClick={() => scrollTo('contato')} className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors group magnetic-btn">
                Não sabe qual escolher? Fale com um consultor
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </button>
            </div>
          </div>
        </section>

        {/* ── Contact ── */}
        <section id="contato" ref={contactSectionRef} className="py-32 bg-[#050505] relative overflow-hidden">
          <div className="absolute inset-0 spotlight opacity-30" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Info */}
              <div className="reveal-element">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold tracking-wider uppercase border border-emerald-500/20 mb-6">
                  Comece Agora
                </div>
                <h2 className="text-4xl md:text-6xl font-bold mb-6 display-font">
                  Pronto para <br />
                  <span className="gradient-text">transformar</span> seu futuro?
                </h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Entre em contato e receba uma análise gratuita do seu nível atual de inglês e um plano de estudos personalizado.
                </p>
                <div className="space-y-6">
                  {CONTACT_INFO.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl glass-panel hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all duration-300">
                        <StatIcon name={item.icon} color="text-emerald-500" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">{item.label}</div>
                        <div className="text-white font-semibold group-hover:text-emerald-400 transition-colors">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <div className="reveal-element" style={{ transitionDelay: '200ms' }}>
                <form onSubmit={handleContactFormSubmit} className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-500" />
                  <h3 className="text-2xl font-bold text-white mb-8 display-font">Solicite informações</h3>
                  <div className="space-y-6">
                    {CONTACT_FIELDS.map((field) => (
                      <div key={field.id} className="relative">
                        <input
                          type={field.type} id={field.id} required placeholder=" "
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all peer"
                        />
                        <label
                          htmlFor={field.id}
                          className="absolute left-4 top-4 text-gray-500 transition-all duration-300 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-emerald-500 peer-focus:bg-[#0a0a0a] peer-focus:px-2 peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:left-2 peer-not-placeholder-shown:text-xs pointer-events-none"
                        >
                          {field.label}
                        </label>
                      </div>
                    ))}

                    <div className="relative">
                      <select id="course" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer">
                        <option value="" disabled className="bg-[#0a0a0a]">Selecione um curso</option>
                        <option value="basico"   className="bg-[#0a0a0a]">Inglês do Zero</option>
                        <option value="enem"     className="bg-[#0a0a0a]">ENEM Master</option>
                        <option value="avancado" className="bg-[#0a0a0a]">Inglês Avançado</option>
                      </select>
                      <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                    </div>

                    <div className="relative">
                      <textarea id="message" rows={4} placeholder=" " className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all peer resize-none" />
                      <label htmlFor="message" className="absolute left-4 top-4 text-gray-500 transition-all duration-300 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:text-emerald-500 peer-focus:bg-[#0a0a0a] peer-focus:px-2 peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:left-2 peer-not-placeholder-shown:text-xs pointer-events-none">
                        Mensagem (opcional)
                      </label>
                    </div>

                    <button type="submit" className="w-full group relative px-8 py-4 bg-emerald-500 text-black font-bold rounded-xl overflow-hidden magnetic-btn">
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Enviar mensagem
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      </span>
                      <div className="absolute inset-0 bg-lime-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              <div className="lg:col-span-2">
                <button onClick={() => navigateTo('home')} className="flex items-center gap-3 mb-6 group">
                  <img src={logoPhd} alt="PHD Escola Virtual" className="h-12 w-auto object-contain" />
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold tracking-tight text-white display-font">PHD Escola Virtual</span>
                    <span className="text-[10px] text-emerald-500 tracking-[0.2em] uppercase font-semibold">Escola Virtual</span>
                  </div>
                </button>
                <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
                  Transformando vidas através da educação de qualidade. Cursos de inglês e preparatórios ENEM com metodologia exclusiva e resultados comprovados.
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href="https://www.instagram.com/phdescolavirtual/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-white hover:from-purple-600/40 hover:to-pink-600/40 transition-all duration-300 text-sm font-semibold group"
                  >
                    <svg className="w-5 h-5 text-pink-400 group-hover:text-pink-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                    <span>@phdescolavirtual</span>
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-6 display-font">Cursos</h4>
                <ul className="space-y-4">
                  <li><button onClick={() => navigateTo('english-modules')} className="text-gray-400 hover:text-emerald-500 transition-colors text-sm">Inglês do Zero</button></li>
                  <li><button onClick={() => { sessionStorage.setItem('cursoAdquirido', 'enem'); navigateTo('register'); }} className="text-gray-400 hover:text-emerald-500 transition-colors text-sm">ENEM Master</button></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-6 display-font">Acesso</h4>
                <ul className="space-y-4">
                  <li><button onClick={() => scrollTo('sobre')}   className="text-gray-400 hover:text-emerald-500 transition-colors text-sm">Sobre nós</button></li>
                  <li><button onClick={() => scrollTo('contato')} className="text-gray-400 hover:text-emerald-500 transition-colors text-sm">Contato</button></li>
                  <li><button onClick={() => navigateTo('login')}     className="text-gray-400 hover:text-emerald-500 transition-colors text-sm">Login</button></li>
                  <li><button onClick={() => navigateTo('register')}  className="text-gray-400 hover:text-emerald-500 transition-colors text-sm">Cadastro</button></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">© 2024 PHD Escola Virtual. Todos os direitos reservados.</p>
              <div className="flex gap-6 text-sm text-gray-500">
                <button className="hover:text-emerald-500 transition-colors">Política de Privacidade</button>
                <button className="hover:text-emerald-500 transition-colors">Termos de Uso</button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
