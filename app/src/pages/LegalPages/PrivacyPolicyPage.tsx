import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Page } from '@/App';

interface PrivacyPolicyPageProps {
  navigateTo: (page: Page) => void;
}

export default function PrivacyPolicyPage({ navigateTo }: PrivacyPolicyPageProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigateTo('home')}
          variant="ghost"
          className="mb-8 text-gray-400 hover:text-brand-green"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="glass-panel rounded-[2rem] border border-white/10 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-8 h-8 text-brand-green" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-green font-bold">
                PHD Escola Virtual
              </p>
              <h1 className="text-3xl md:text-4xl font-bold font-display">
                Política de Privacidade
              </h1>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-10">
            Última atualização: 15/07/2026
          </p>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Objetivo</h2>
              <p>
                Esta Política de Privacidade explica como a PHD Escola Virtual coleta,
                utiliza, armazena e protege os dados pessoais dos usuários da plataforma,
                incluindo alunos, professores e gestores.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Dados coletados</h2>
              <p>
                Podemos coletar dados como nome, email, documento, tipo de perfil,
                curso adquirido, vínculo com professor, mensagens, atividades, respostas,
                anexos enviados e registros necessários para funcionamento da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Finalidade do uso dos dados</h2>
              <p>
                Os dados são utilizados para cadastro, autenticação, liberação de acesso,
                comunicação entre aluno e professor, envio e correção de atividades,
                gestão administrativa, segurança da plataforma e melhoria dos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Compartilhamento de dados</h2>
              <p>
                Os dados não são vendidos. O compartilhamento ocorre apenas quando necessário
                para funcionamento da plataforma, cumprimento de obrigações legais,
                segurança, hospedagem, banco de dados, autenticação e serviços técnicos
                utilizados pela PHD Escola Virtual.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Segurança</h2>
              <p>
                Adotamos medidas técnicas e administrativas para proteger os dados,
                incluindo autenticação por token, controle de permissões, rotas protegidas,
                armazenamento privado de arquivos, políticas de acesso e restrição por perfil.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Direitos do usuário</h2>
              <p>
                O usuário pode solicitar informações sobre seus dados, correção,
                atualização, exclusão quando aplicável, bloqueio de dados tratados de forma
                inadequada e esclarecimentos sobre o uso de suas informações.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Retenção dos dados</h2>
              <p>
                Os dados são mantidos enquanto forem necessários para prestação do serviço,
                cumprimento de obrigações legais, segurança, auditoria e histórico acadêmico
                da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">8. Contato</h2>
              <p>
                Para dúvidas, solicitações ou pedidos relacionados à privacidade,
                entre em contato pelo email: sistemaphdescolavirtual@gmail.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}