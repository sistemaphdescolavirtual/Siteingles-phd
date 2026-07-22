import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  Clock,
  Paperclip,
  CheckCircle,
  RotateCcw,
  Send,
  Download,
  ExternalLink,
  LoaderCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { CorrectionStatusBadge } from '@/components/shared/CorrectionStatusBadge';
import { api } from '@/services/api';
import type { Activity } from '@/types';


interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  onSubmitted?: () => void | Promise<void>;
}

function getSafeExternalUrl(value: string): string | null {
  try {
    const parsedUrl = new URL(value);

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null;
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}


export function ActivityModal({
  isOpen,
  onClose,
  activity,
  onSubmitted,
}: ActivityModalProps) {
 const [resposta, setResposta] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
const [submitted, setSubmitted] = useState(false);

const [attachmentAction, setAttachmentAction] =
  useState<string | null>(null);

const currentUser = useAuthStore(
  (state) => state.currentUser,
);

useEffect(() => {
    if (!isOpen) {
      setResposta('');
      setSubmitted(false);
      setIsSubmitting(false);
       setAttachmentAction(null);
    }
  }, [isOpen]);

  if (!activity) {
    return null;
  }

const canResubmit =
  activity.correctionStatus === 'devolvida' ||
  activity.correctionStatus === 'incorreta';

const canSubmit =
  canResubmit ||
  (!activity.resposta &&
    activity.correctionStatus !== 'correta' &&
    activity.correctionStatus !== 'em_analise');


const handleOpenAttachment = async (
  attachmentId: string,
) => {
  if (!currentUser?.id) {
    return;
  }

  const actionId = `open-${attachmentId}`;

  try {
    setAttachmentAction(actionId);

    const access =
      await api.getActivityAttachmentAccess(
        activity.id,
        attachmentId,
        currentUser.id,
      );

    window.open(
      access.viewUrl,
      '_blank',
      'noopener,noreferrer',
    );
  } catch (error) {
    console.error(
      'Erro ao abrir arquivo:',
      error,
    );

    alert(
      error instanceof Error
        ? error.message
        : 'Erro ao abrir arquivo.',
    );
  } finally {
    setAttachmentAction(null);
  }
};

const handleDownloadAttachment = async (
  attachmentId: string,
) => {
  if (!currentUser?.id) {
    return;
  }

  const actionId = `download-${attachmentId}`;

  try {
    setAttachmentAction(actionId);

    const access =
      await api.getActivityAttachmentAccess(
        activity.id,
        attachmentId,
        currentUser.id,
      );

    if (!access.downloadUrl) {
      window.open(
        access.viewUrl,
        '_blank',
        'noopener,noreferrer',
      );

      return;
    }

    const downloadLink =
      document.createElement('a');

    downloadLink.href = access.downloadUrl;
    downloadLink.download = access.fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  } catch (error) {
    console.error(
      'Erro ao baixar arquivo:',
      error,
    );

    alert(
      error instanceof Error
        ? error.message
        : 'Erro ao baixar arquivo.',
    );
  } finally {
    setAttachmentAction(null);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resposta.trim() || !currentUser?.id) {
      return;
    }

    try {
      setIsSubmitting(true);

      await api.submitActivityResponse(activity.id, {
        alunoId: currentUser.id,
        tipo: 'texto',
        conteudo: resposta.trim(),
      });

      await onSubmitted?.();

      setSubmitted(true);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);

      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao enviar resposta.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0a0a0a] border border-white/10 text-white rounded-[2.5rem] p-0 overflow-hidden flex flex-col max-h-[90vh] cursor-default">
        <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-start justify-between gap-6 mb-8">
            <div className="flex-1">
              <CorrectionStatusBadge status={activity.correctionStatus} />

              <h2 className="text-3xl font-bold font-display tracking-tight leading-tight mt-3 mb-2">
                {activity.titulo}
              </h2>

              <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                <Clock className="w-3.5 h-3.5" />
                {new Date(activity.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <FileText className="w-8 h-8 text-brand-neon" />
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h4 className="text-brand-green font-black uppercase tracking-[0.2em] text-[10px] mb-3">
                Instruções
              </h4>

              <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl leading-relaxed text-gray-300 italic">
                "{activity.descricao}"
              </div>
            </section>

           {activity.anexos?.length > 0 && (
  <section>
    <h4 className="text-brand-green font-black uppercase tracking-[0.2em] text-[10px] mb-3">
      Materiais de Apoio
    </h4>

    <div className="space-y-3">
      {activity.anexos.map((anexo) => {
        const isOpening =
          attachmentAction === `open-${anexo.id}`;

        const isDownloading =
          attachmentAction ===
          `download-${anexo.id}`;

        const isBusy =
          isOpening || isDownloading;

        const externalUrl =
          anexo.tipo === 'link'
            ? getSafeExternalUrl(anexo.url)
            : null;

        return (
          <div
            key={anexo.id}
            className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-brand-neon/30 transition-all"
          >
            <Paperclip className="w-5 h-5 text-gray-500 shrink-0" />

            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white truncate">
                {anexo.nome}
              </p>

              <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest mt-1">
                {anexo.tipo === 'link'
                  ? 'Link externo'
                  : anexo.tipo}
              </p>
            </div>

                        {anexo.tipo === 'link' ? (
              externalUrl ? (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-xl px-3 text-brand-neon hover:bg-brand-green hover:text-black"
                  title="Abrir link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <span
                  className="inline-flex h-10 items-center justify-center rounded-xl px-3 text-red-400/70"
                  title="Link inválido"
                >
                  <ExternalLink className="w-4 h-4" />
                </span>
              )
            ) : (
              <Button
                type="button"
                variant="ghost"
                disabled={isBusy}
                onClick={() =>
                  void handleOpenAttachment(anexo.id)
                }
                className="h-10 px-3 rounded-xl text-brand-neon hover:text-black hover:bg-brand-green"
                title="Abrir arquivo"
              >
                {isOpening ? (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
              </Button>
            )}

            {anexo.tipo !== 'link' && (
              <Button
                type="button"
                variant="ghost"
                disabled={isBusy}
                onClick={() =>
                  void handleDownloadAttachment(
                    anexo.id,
                  )
                }
                className="h-10 px-3 rounded-xl text-gray-400 hover:text-black hover:bg-brand-green"
                title="Baixar arquivo"
              >
                {isDownloading ? (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  </section>
)}
            {activity.resposta && (
              <section className="relative">
                <div className="relative p-6 bg-brand-green/5 border border-brand-green/20 rounded-2xl">
                  <h4 className="text-brand-neon font-black uppercase tracking-[0.2em] text-[10px] mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Sua Resposta
                  </h4>

                  <p className="text-white leading-relaxed mb-4">
                    {activity.resposta.conteudo}
                  </p>

                  <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">
                    Enviada em:{' '}
                    {new Date(activity.resposta.enviadoEm).toLocaleString(
                      'pt-BR',
                    )}
                  </p>
                </div>
              </section>
            )}

            {activity.correctionFeedback && (
              <section className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                <h4 className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] mb-3">
                  Feedback do Professor
                </h4>

                <p className="text-gray-300 italic">
                  "{activity.correctionFeedback}"
                </p>
              </section>
            )}

           {canResubmit && (
  <div className="flex items-center gap-4 p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
    <RotateCcw className="w-5 h-5 text-orange-400 shrink-0" />
    <p className="text-orange-300 text-sm font-medium">
      {activity.correctionStatus === 'incorreta'
        ? 'Sua atividade foi marcada como incorreta. Veja o feedback, corrija e reenvie abaixo.'
        : 'Sua atividade foi devolvida para revisão. Corrija e reenvie abaixo.'}
    </p>
  </div>
)}

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center"
              >
                <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-green/20">
                  <CheckCircle className="w-10 h-10 text-brand-neon" />
                </div>

                <h3 className="text-2xl font-bold font-display mb-2">
                  Resposta Enviada!
                </h3>

                <p className="text-gray-500 text-sm">
                  Sua atividade foi enviada para análise do professor.
                </p>
              </motion.div>
            ) : (
              canSubmit && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-brand-green font-black uppercase tracking-[0.2em] text-[10px]">
                      Sua Resposta
                    </h4>

                    <Textarea
                      value={resposta}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setResposta(e.target.value)
                      }
                      placeholder="Escreva sua resposta aqui..."
                      className="min-h-[200px] bg-white/5 border-white/10 rounded-2xl focus:border-brand-green text-white placeholder:text-gray-600 resize-none p-6"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !resposta.trim()}
                    className="w-full h-14 bg-brand-green hover:bg-brand-neon text-black font-bold rounded-2xl"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        <span>Enviando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        <span>Enviar Resposta</span>
                      </div>
                    )}
                  </Button>
                </form>
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}