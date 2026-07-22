import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Paperclip, Check, X } from 'lucide-react';
import { api } from '@/services/api';
import type { Attachment, User } from '@/types';
import { uploadActivityFileToStorage } from '@/lib/supabaseStorage';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  aluno: User | null;
  curso: string | null;
  professorId?: string;
  onCreated?: () => void;
}

const MAX_ACTIVITY_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ACTIVITY_FILES = 3;

const ALLOWED_ACTIVITY_FILE_EXTENSIONS = [
  '.pdf',
  '.txt',
  '.xls',
  '.xlsx',
];

function isAllowedActivityFile(file: File): boolean {
  const fileName = file.name.toLowerCase();

  return ALLOWED_ACTIVITY_FILE_EXTENSIONS.some(
    (extension) => fileName.endsWith(extension),
  );
}

function normalizeExternalUrl(value: string): string | null {
  const rawUrl = value.trim();

  if (!rawUrl) {
    return null;
  }

  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(rawUrl)
    ? rawUrl
    : `https://${rawUrl}`;

  try {
    const parsedUrl = new URL(candidate);

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return null;
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

function normalizeCurso(curso?: string | null): 'ingles' | 'enem' {
  const value = String(curso ?? '').toLowerCase();

  if (value.includes('enem')) {
    return 'enem';
  }

  return 'ingles';
}

export function CreateActivityModal({
  isOpen,
  onClose,
  aluno,
  curso,
  professorId,
  onCreated,
}: CreateActivityModalProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
const [anexos, setAnexos] = useState<Attachment[]>([]);
const [files, setFiles] = useState<File[]>([]);  
const [linkInput, setLinkInput] = useState('');
const [publishDate, setPublishDate] = useState('');
const [publishTime, setPublishTime] = useState('');
const [dueDate, setDueDate] = useState('');
const [dueTime, setDueTime] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
  e: React.ChangeEvent<HTMLInputElement>,
) => {
  const selectedFiles = Array.from(
    e.target.files ?? [],
  );

  const validFiles = selectedFiles.filter((file) => {
    if (!isAllowedActivityFile(file)) {
      alert(
        `"${file.name}" não é permitido. Use PDF, TXT, XLS ou XLSX.`,
      );

      return false;
    }

    if (file.size > MAX_ACTIVITY_FILE_SIZE) {
      alert(
        `"${file.name}" ultrapassa o limite de 5 MB.`,
      );

      return false;
    }

    return true;
  });

  setFiles((currentFiles) => {
    const availableSlots =
      MAX_ACTIVITY_FILES - currentFiles.length;

    if (availableSlots <= 0) {
      alert(
        'Cada atividade pode ter no máximo 3 arquivos.',
      );

      return currentFiles;
    }

    if (validFiles.length > availableSlots) {
      alert(
        `Você pode adicionar somente mais ${availableSlots} arquivo(s).`,
      );
    }

    return [
      ...currentFiles,
      ...validFiles.slice(0, availableSlots),
    ];
  });

  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

    const handleAddLink = () => {
    const normalizedUrl = normalizeExternalUrl(linkInput);

    if (!normalizedUrl) {
      alert(
        'Digite um link válido. Exemplo: https://www.exemplo.com',
      );
      return;
    }

    setAnexos((prev) => [
      ...prev,
      {
        id: `link-${Date.now()}`,
        nome: normalizedUrl,
        tipo: 'link',
        url: normalizedUrl,
      },
    ]);

    setLinkInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!aluno || !professorId) {
      alert('Professor ou aluno não encontrado.');
      return;
    }

    try {
      setIsSubmitting(true);

   const { activity } = await api.createActivity({
  professorId,
  alunoId: aluno.id,
  curso: normalizeCurso(
    aluno.cursoAdquirido || curso,
  ),
  titulo,
  descricao,
  publishAt: publishDate
    ? new Date(
        `${publishDate}T${publishTime || '00:00'}`,
      ).toISOString()
    : undefined,
  dueAt: dueDate
    ? new Date(
        `${dueDate}T${dueTime || '23:59'}`,
      ).toISOString()
    : undefined,
  anexos: anexos.map((anexo) => ({
    nome: anexo.nome,
    tipo: anexo.tipo,
    url: anexo.url,
  })),
});

for (const file of files) {
  const uploadData =
    await api.prepareActivityAttachmentUpload(
      activity.id,
      {
        professorId,
        fileName: file.name,
        fileSize: file.size,
      },
    );

  await uploadActivityFileToStorage({
    path: uploadData.path,
    token: uploadData.token,
    file,
    contentType: uploadData.contentType,
  });

  await api.confirmActivityAttachment(
    activity.id,
    {
      professorId,
      path: uploadData.path,
      fileName: file.name,
    },
  );
}
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setTitulo('');
        setDescricao('');
        setPublishDate('');
        setPublishTime('');
        setDueDate('');
        setDueTime('');
      setAnexos([]);
      setFiles([]);
      onCreated?.();
      onClose();
        }, 1500);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao criar atividade.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl bg-[#0a0a0a] border border-white/10 text-white rounded-[2.5rem] p-0 overflow-hidden flex flex-col max-h-[90vh] cursor-default">
        <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-bold font-display flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center border border-brand-green/20">
                <Plus className="w-6 h-6 text-brand-neon" />
              </div>
              Nova Atividade
            </DialogTitle>
          </DialogHeader>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20 text-center"
            >
              <div className="w-24 h-24 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-green/20">
                <Check className="w-12 h-12 text-brand-neon" />
              </div>

              <h3 className="text-3xl font-bold font-display mb-2">
                Atividade Enviada!
              </h3>

              <p className="text-gray-500">
                O aluno {aluno?.nome} será notificado imediatamente.
              </p>
            </motion.div>
          ) : (
            <form
              id="create-activity-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">
                    Destinatário
                  </p>

                  <p className="text-xl font-bold">
                    {aluno?.nome}
                  </p>
                </div>

                <Badge className="bg-brand-green/10 text-brand-neon border-brand-green/20 uppercase tracking-widest px-4 py-1.5 font-black text-[10px]">
                  {normalizeCurso(aluno?.cursoAdquirido || curso) === 'ingles'
                    ? 'Inglês'
                    : 'ENEM'}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  Título da Atividade
                </Label>

                <Input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Practice: Present Continuous"
                  required
                  className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-brand-green/50 text-lg cursor-text"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  Instruções / Descrição
                </Label>

                <Textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva o que o aluno deve fazer..."
                  required
                  rows={5}
                  className="bg-white/5 border-white/10 rounded-xl focus:border-brand-green/50 resize-none text-base cursor-text"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Data de publicação</Label>
    <input
      type="date"
      value={publishDate}
      onChange={(e) => setPublishDate(e.target.value)}
      className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:border-brand-green/50 outline-none transition-colors cursor-text"
    />
    <p className="text-[10px] text-gray-500">Se vazio, a atividade será publicada agora.</p>
  </div>
  <div className="space-y-2">
    <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Horário de publicação</Label>
    <input
      type="time"
      value={publishTime}
      onChange={(e) => setPublishTime(e.target.value)}
      className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:border-brand-green/50 outline-none transition-colors cursor-text"
    />
  </div>
  <div className="space-y-2">
    <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Data de encerramento</Label>
    <input
      type="date"
      value={dueDate}
      onChange={(e) => setDueDate(e.target.value)}
      className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:border-brand-green/50 outline-none transition-colors cursor-text"
    />
    <p className="text-[10px] text-gray-500">Após essa data, o aluno não poderá mais responder.</p>
  </div>
  <div className="space-y-2">
    <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Horário de encerramento</Label>
    <input
      type="time"
      value={dueTime}
      onChange={(e) => setDueTime(e.target.value)}
      className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:border-brand-green/50 outline-none transition-colors cursor-text"
    />
    <p className="text-[10px] text-gray-500">Se vazio, o padrão será 23:59 do dia selecionado.</p>
  </div>
</div>

              <div className="space-y-4">
                <Label className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  Recursos e Anexos
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-white/10 rounded-2xl hover:border-brand-neon/50 hover:bg-brand-green/5 transition-all group cursor-pointer"
                  >
                    <Paperclip className="w-6 h-6 text-gray-500 group-hover:text-brand-neon" />
                    <span className="text-xs font-bold text-gray-500 group-hover:text-white uppercase tracking-widest">
                      Anexar Arquivo
                    </span>
                  </button>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                                            <Input
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            handleAddLink();
                          }
                        }}
                        placeholder="Link externo..."
                        className="bg-white/5 border-white/10 rounded-xl cursor-text"
                      />

                      <Button
                        type="button"
                        onClick={handleAddLink}
                        className="bg-white/10 hover:bg-white/20 text-white rounded-xl cursor-pointer"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                
              {(files.length > 0 || anexos.length > 0) && (
  <div className="flex flex-wrap gap-2 pt-2">
    {files.map((file, index) => (
      <div
        key={`${file.name}-${file.size}-${file.lastModified}`}
        className="flex items-center gap-2 px-3 py-2 bg-brand-green/10 border border-brand-green/20 rounded-xl"
      >
        <span className="text-xs font-bold text-brand-neon truncate max-w-[150px]">
          {file.name}
        </span>

        <button
          type="button"
          onClick={() =>
            setFiles((currentFiles) =>
              currentFiles.filter(
                (_, fileIndex) => fileIndex !== index,
              ),
            )
          }
          className="text-brand-neon/50 hover:text-red-400 transition-colors cursor-pointer"
          aria-label={`Remover ${file.name}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ))}

    {anexos.map((anexo) => (
      <div
        key={anexo.id}
        className="flex items-center gap-2 px-3 py-2 bg-brand-green/10 border border-brand-green/20 rounded-xl"
      >
        <span className="text-xs font-bold text-brand-neon truncate max-w-[150px]">
          {anexo.nome}
        </span>

        <button
          type="button"
          onClick={() =>
            setAnexos((currentAnexos) =>
              currentAnexos.filter(
                (item) => item.id !== anexo.id,
              ),
            )
          }
          className="text-brand-neon/50 hover:text-red-400 transition-colors cursor-pointer"
          aria-label={`Remover ${anexo.nome}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ))}
  </div>
)}
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1 h-14 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-xs cursor-pointer"
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] h-14 bg-brand-neon hover:bg-brand-lime text-black font-black rounded-2xl text-base cursor-pointer"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                      className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full"
                    />
                  ) : (
                    'Lançar Atividade'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.xls,.xlsx,.txt"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </DialogContent>
    </Dialog>
  );
}
