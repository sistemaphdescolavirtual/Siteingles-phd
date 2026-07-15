import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Page } from '@/App';

interface TermsOfUsePageProps {
  navigateTo: (page: Page) => void;
}

export default function TermsOfUsePage({ navigateTo }: TermsOfUsePageProps) {
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
            <FileText className="w-8 h-8 text-brand-green" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-green font-bold">
                PHD Escola Virtual
              </p>
              <h1 className="text-3xl md:text-4xl font-bold font-display">
                Termos de Uso
              </h1>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-10">
            Última atualização: 15/07/2026
          </p>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Aceitação dos termos</h2>
              <p>
                Ao acessar ou utilizar a PHD Escola Virtual, o usuário declara que leu,
                compreendeu e concorda com estes Termos de Uso e com a Política de Privacidade.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Sobre a plataforma</h2>
              <p>
                A PHD Escola Virtual é uma plataforma educacional voltada para organização
                de cursos, atividades, comunicação entre professor e aluno, envio de respostas,
                correção de atividades e acompanhamento acadêmico.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Cadastro e acesso</h2>
              <p>
                O usuário deve fornecer informações verdadeiras e manter seus dados atualizados.
                O acesso pode depender de aprovação, vínculo com professor ou liberação por gestor.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Responsabilidades do usuário</h2>
              <p>
                O usuário se compromete a utilizar a plataforma de forma adequada, não compartilhar
                sua senha, não tentar acessar dados de terceiros, não enviar conteúdos ofensivos,
                ilegais ou que prejudiquem o funcionamento do sistema.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Atividades, mensagens e anexos</h2>
              <p>
                Professores podem criar atividades e anexos educacionais. Alunos podem enviar
                respostas e mensagens relacionadas ao processo de aprendizagem. O conteúdo enviado
                deve respeitar a finalidade educacional da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Suspensão ou bloqueio</h2>
              <p>
                A PHD Escola Virtual pode restringir, suspender ou remover acessos em caso de uso
                indevido, violação destes termos, tentativa de invasão, compartilhamento indevido
                de credenciais ou descumprimento das regras da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Disponibilidade do serviço</h2>
              <p>
                Buscamos manter a plataforma disponível, mas podem ocorrer interrupções temporárias
                por manutenção, atualizações, falhas técnicas, indisponibilidade de serviços externos
                ou situações fora do controle da administração.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">8. Propriedade intelectual</h2>
              <p>
                A identidade visual, estrutura da plataforma, textos, interfaces e recursos do sistema
                pertencem à PHD Escola Virtual ou aos seus respectivos titulares. O uso da plataforma
                não concede direito de cópia, revenda ou exploração comercial não autorizada.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">9. Alterações dos termos</h2>
              <p>
                Estes Termos de Uso podem ser atualizados para refletir mudanças na plataforma,
                exigências legais ou melhorias operacionais. A versão mais recente ficará disponível
                nesta página.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">10. Contato</h2>
              <p>
                Para dúvidas sobre estes termos, entre em contato pelo email:
                sistemaphdescolavirtual@gmail.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}