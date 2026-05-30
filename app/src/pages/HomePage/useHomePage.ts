import { useState, useEffect, useRef } from 'react';

export function useHomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const contactSectionRef = useRef<HTMLElement>(null);

  // Scroll progress + nav shrink
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress((scrollTop / scrollHeight) * 100);
      setIsScrolled(scrollTop > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reveal on scroll (IntersectionObserver)
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-element');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('active'); observer.unobserve(e.target); }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Spotlight effect on contact section
  useEffect(() => {
    const section = contactSectionRef.current;
    const spotlight = section?.querySelector('.spotlight') as HTMLElement | null;
    if (!section || !spotlight) return;
    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      spotlight.style.setProperty('--x', ((e.clientX - rect.left) / rect.width) * 100 + '%');
      spotlight.style.setProperty('--y', ((e.clientY - rect.top) / rect.height) * 100 + '%');
    };
    section.addEventListener('mousemove', onMove);
    return () => section.removeEventListener('mousemove', onMove);
  }, []);

  // Magnetic buttons
  useEffect(() => {
    const btns: { el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }[] = [];
    document.querySelectorAll<HTMLElement>('.magnetic-btn').forEach((btn) => {
      const move = (e: MouseEvent) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.2}px)`;
      };
      const leave = () => { btn.style.transform = 'translate(0,0)'; };
      btn.addEventListener('mousemove', move);
      btn.addEventListener('mouseleave', leave);
      btns.push({ el: btn, move, leave });
    });
    return () => btns.forEach(({ el, move, leave }) => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
    });
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileMenuOpen(false);
  };

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = document.createElement('div');
    n.className = 'fixed bottom-8 right-8 glass-panel border border-emerald-500/30 px-6 py-4 rounded-xl flex items-center gap-3 z-50 transform translate-y-20 opacity-0 transition-all duration-500';
    n.innerHTML = `
      <div class="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <div>
        <div class="font-semibold text-white">Mensagem enviada!</div>
        <div class="text-sm text-gray-400">Entraremos em contato em breve.</div>
      </div>
    `;
    document.body.appendChild(n);
    setTimeout(() => n.classList.remove('translate-y-20', 'opacity-0'), 100);
    setTimeout(() => { n.classList.add('translate-y-20', 'opacity-0'); setTimeout(() => n.remove(), 500); }, 3000);
    (e.target as HTMLFormElement).reset();
  };

  return {
    isScrolled,
    mobileMenuOpen,
    setMobileMenuOpen,
    scrollProgress,
    contactSectionRef,
    scrollTo,
    handleContactFormSubmit,
  };
}
