import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, User, Mail, Lock, Camera, Shield, AlertTriangle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    nome?: string;
    email?: string;
    role?: string | null;
    codigo?: string;
  } | null;
}

const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  professor: 'Professor',
  aluno: 'Aluno',
};

const roleColor: Record<string, string> = {
  admin: 'text-brand-neon bg-brand-green/10 border-brand-green/25',
  professor: 'text-blue-400 bg-blue-500/10 border-blue-500/25',
  aluno: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
};

const accentColor: Record<string, string> = {
  admin: 'from-brand-green to-brand-neon',
  professor: 'from-blue-500 to-blue-400',
  aluno: 'from-purple-500 to-pink-500',
};

export function SettingsModal({ isOpen, onClose, currentUser }: SettingsModalProps) {
  const [nome, setNome] = useState(currentUser?.nome ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [saved, setSaved] = useState(false);

  const role: string = currentUser?.role ?? 'aluno';
  const initials = (currentUser?.nome ?? 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.75)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[420px] rounded-[22px] border border-white/10 overflow-hidden"
            style={{ background: '#0a0a0a' }}
          >
            {/* Accent bar */}
            <div className={`h-[2px] bg-gradient-to-r ${accentColor[role]}`} />

            {/* Header */}
            <div className="flex items-center gap-4 px-7 py-5 border-b border-white/[0.06]">
              <div className="w-11 h-11 rounded-[14px] bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Settings className="w-5 h-5 text-brand-neon" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[17px] font-bold text-white tracking-tight">Configurações</p>
                <p className="text-[11px] text-gray-500 mt-0.5 font-medium">Gerencie seu perfil e preferências</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-[9px] bg-white/5 border border-white/8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div>
              {/* Seção: Perfil */}
              <div className="px-7 py-5 border-b border-white/[0.05]">
                <SectionLabel>Perfil</SectionLabel>
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-14 h-14 rounded-[18px] flex items-center justify-center text-[19px] font-bold text-white bg-gradient-to-br ${accentColor[role]}`}
                    >
                      {initials}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-5 h-5 rounded-[7px] bg-brand-green border-2 border-[#0a0a0a] flex items-center justify-center cursor-pointer">
                      <Camera className="w-2.5 h-2.5 text-black" />
                    </button>
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-white">{currentUser?.nome}</p>
                    <span className={`inline-flex items-center gap-1.5 mt-1.5 text-[9px] font-bold uppercase tracking-[0.12em] border rounded-full px-2.5 py-[3px] ${roleColor[role]}`}>
                      <User className="w-2.5 h-2.5" />
                      {roleLabel[role] ?? role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seção: Dados pessoais */}
              <div className="px-7 py-5 border-b border-white/[0.05]">
                <SectionLabel>Dados pessoais</SectionLabel>
                <div className="space-y-3">
                  <FieldInput
                    label="Nome completo"
                    icon={<User className="w-[14px] h-[14px]" />}
                    value={nome}
                    onChange={setNome}
                    placeholder="Seu nome"
                  />
                  <FieldInput
                    label="E-mail"
                    icon={<Mail className="w-[14px] h-[14px]" />}
                    value={email}
                    onChange={setEmail}
                    placeholder="seu@email.com"
                    type="email"
                  />
                  {/* Código do professor — somente leitura */}
                  {role === 'professor' && currentUser?.codigo && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.1em] mb-1.5">Código de turma</p>
                      <div className="flex items-center gap-3 bg-brand-green/5 border border-brand-green/15 rounded-[11px] px-4 py-2.5">
                        <Shield className="w-3.5 h-3.5 text-brand-green/60 flex-shrink-0" />
                        <code className="font-mono text-[13px] text-brand-neon font-bold tracking-wider">
                          {currentUser.codigo}
                        </code>
                        <span className="ml-auto text-[9px] text-gray-600 uppercase tracking-widest font-bold">somente leitura</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Seção: Segurança */}
              <div className="px-7 py-5">
                <SectionLabel>Segurança</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                  <FieldInput
                    label="Senha atual"
                    icon={<Lock className="w-[14px] h-[14px]" />}
                    value={senhaAtual}
                    onChange={setSenhaAtual}
                    type="password"
                    placeholder="••••••••"
                  />
                  <FieldInput
                    label="Nova senha"
                    icon={<Lock className="w-[14px] h-[14px]" />}
                    value={novaSenha}
                    onChange={setNovaSenha}
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-7 py-4 border-t border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-[11px] bg-transparent border border-white/10 text-gray-500 text-[12px] font-bold hover:text-white hover:border-white/20 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button className="flex items-center gap-1.5 text-[10px] text-gray-600 hover:text-red-400 transition-colors cursor-pointer ml-1">
                <AlertTriangle className="w-3 h-3" />
                Excluir conta
              </button>
              <motion.button
                onClick={handleSave}
                whileTap={{ scale: 0.97 }}
                className="ml-auto flex items-center gap-2 px-5 py-2 rounded-[11px] bg-brand-green text-black text-[12px] font-bold hover:bg-brand-neon transition-all cursor-pointer"
              >
                {saved ? (
                  <>✓ Salvo!</>
                ) : (
                  <>Salvar alterações</>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Helpers ── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.14em] whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-white/[0.04]" />
    </div>
  );
}

function FieldInput({
  label,
  icon,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.1em] mb-1.5">{label}</p>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-[11px] pl-9 pr-4 py-2.5 text-[13px] text-gray-200 outline-none transition-all placeholder:text-gray-700 focus:border-brand-green/40 focus:bg-brand-green/[0.03]"
        />
      </div>
    </div>
  );
}
