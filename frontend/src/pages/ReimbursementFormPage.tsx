import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWR from "swr";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { listCategories } from "@/services/categoriesService";
import {
  createReimbursement,
  createReimbursementAttachment,
  getReimbursement,
  submitReimbursement,
  updateReimbursement,
} from "@/services/reimbursementsService";
import type { CreateReimbursementInput } from "@/types";

const attachmentSchema = z.object({
  nomeArquivo: z.string().trim().min(1, "Informe o nome do anexo"),
  urlArquivo: z.string().trim().url("Informe uma URL válida"),
  tipoArquivo: z.enum(["PDF", "JPG", "PNG"]),
});

const reimbursementFormSchema = z.object({
  categoriaId: z.string().trim().min(1, "Selecione uma categoria"),
  descricao: z.string().trim().min(1, "Informe a descrição"),
  valor: z
    .string()
    .trim()
    .min(1, "Informe o valor")
    .refine((value) => {
      const normalized = Number(value.replace(/\./g, "").replace(",", "."));
      return Number.isFinite(normalized) && normalized > 0;
    }, "Informe um valor maior que zero"),
  dataDespesa: z.string().trim().min(1, "Informe a data da despesa"),
  anexos: z.array(attachmentSchema),
});

type ReimbursementFormValues = z.infer<typeof reimbursementFormSchema>;

type ReimbursementFormMode = "create" | "edit";

interface ReimbursementFormPageProps {
  mode: ReimbursementFormMode;
  reimbursementId?: string;
}

interface AttachmentRow {
  nomeArquivo: string;
  urlArquivo: string;
  tipoArquivo: "PDF" | "JPG" | "PNG";
}

const emptyAttachment = (): AttachmentRow => ({
  nomeArquivo: "",
  urlArquivo: "",
  tipoArquivo: "PDF",
});

const defaultValues: ReimbursementFormValues = {
  categoriaId: "",
  descricao: "",
  valor: "",
  dataDespesa: dayjs().format("YYYY-MM-DD"),
  anexos: [],
};

function toReimbursementInput(values: ReimbursementFormValues): CreateReimbursementInput {
  return {
    categoriaId: values.categoriaId,
    descricao: values.descricao,
    valor: Number(values.valor.replace(/\./g, "").replace(",", ".")),
    dataDespesa: values.dataDespesa,
  };
}

async function persistAttachments(reimbursementId: string, attachments: AttachmentRow[]) {
  await Promise.all(
    attachments.map((attachment) =>
      createReimbursementAttachment(reimbursementId, {
        nomeArquivo: attachment.nomeArquivo,
        urlArquivo: attachment.urlArquivo,
        tipoArquivo: attachment.tipoArquivo,
      })
    )
  );
}

function LoadingCard({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <Card className="border-destructive/50 bg-destructive/10">
      <CardHeader>
        <CardTitle className="text-destructive">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-destructive">{message}</p>
      </CardContent>
    </Card>
  );
}

function ReimbursementFormPage({ mode, reimbursementId }: ReimbursementFormPageProps) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useSWR(
    isAuthenticated ? "categories-for-reimbursement-form" : null,
    async () => {
      const response = await listCategories(1, 100);
      return response.items.filter((category) => category.ativo);
    },
    { revalidateOnFocus: false }
  );

  const {
    data: reimbursement,
    isLoading: reimbursementLoading,
    error: reimbursementError,
  } = useSWR(
    mode === "edit" && reimbursementId ? ["reimbursement-form", reimbursementId] : null,
    async () => getReimbursement(reimbursementId!),
    { revalidateOnFocus: false }
  );

  const form = useForm<ReimbursementFormValues>({
    resolver: zodResolver(reimbursementFormSchema),
    defaultValues,
  });

  const { control, register, handleSubmit, formState: { errors }, reset } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "anexos",
  });

  const isEdit = mode === "edit";
  const pageTitle = isEdit ? "Editar Solicitação" : "Nova Solicitação";
  const pageDescription = isEdit
    ? "Atualize a solicitação e mantenha os anexos organizados."
    : "Preencha os dados da despesa e salve como rascunho ou envie depois.";

  useEffect(() => {
    if (!reimbursement) {
      return;
    }

    reset({
      categoriaId: reimbursement.categoriaId,
      descricao: reimbursement.descricao,
      valor: reimbursement.valor,
      dataDespesa: dayjs(reimbursement.dataDespesa).format("YYYY-MM-DD"),
      anexos: [],
    });
  }, [reimbursement, reset]);

  const existingAttachments = useMemo(() => reimbursement?.anexos ?? [], [reimbursement]);

  const saveReimbursement = async (values: ReimbursementFormValues, sendAfterSave: boolean) => {
    const input = toReimbursementInput(values);

    const saved = isEdit
      ? await updateReimbursement(reimbursementId!, input)
      : await createReimbursement(input);

    if (values.anexos.length > 0) {
      await persistAttachments(saved.id, values.anexos);
    }

    const finalReimbursement = sendAfterSave ? await submitReimbursement(saved.id) : saved;

    toast.success(
      sendAfterSave
        ? "Solicitação salva e enviada com sucesso"
        : isEdit
          ? "Solicitação atualizada com sucesso"
          : "Solicitação salva como rascunho"
    );

    await navigate({ to: `/reimbursements/${finalReimbursement.id}` });
  };

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Você não está autenticado.</p>
        </div>
      </AppLayout>
    );
  }

  if (isEdit && reimbursementLoading) {
    return (
      <AppLayout>
        <LoadingCard message="Carregando solicitação para edição..." />
      </AppLayout>
    );
  }

  if (categoriesLoading) {
    return (
      <AppLayout>
        <LoadingCard message="Carregando categorias..." />
      </AppLayout>
    );
  }

  if (categoriesError || reimbursementError) {
    return (
      <AppLayout>
        <ErrorCard
          title="Erro ao carregar"
          message={categoriesError?.message || reimbursementError?.message || "Não foi possível carregar os dados do formulário."}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
        </div>

        {isEdit && reimbursement?.status !== "RASCUNHO" && (
          <Card className="border-amber-500/30 bg-amber-500/10">
            <CardContent className="pt-6 text-sm text-amber-900 dark:text-amber-100">
              Esta solicitação já foi enviada. O backend pode restringir alterações dependendo do status.
            </CardContent>
          </Card>
        )}

        <form className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados da despesa</CardTitle>
              <CardDescription>Preencha os campos principais da solicitação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="categoriaId">Categoria</Label>
                <select
                  id="categoriaId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register("categoriaId")}
                  defaultValue=""
                >
                  <option value="">Selecione uma categoria</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nome}
                    </option>
                  ))}
                </select>
                {errors.categoriaId && <p className="text-sm text-destructive">{errors.categoriaId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <textarea
                  id="descricao"
                  rows={4}
                  className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Descreva a despesa com contexto suficiente"
                  {...register("descricao")}
                />
                {errors.descricao && <p className="text-sm text-destructive">{errors.descricao.message}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor</Label>
                  <Input id="valor" placeholder="123,45" {...register("valor")} />
                  {errors.valor && <p className="text-sm text-destructive">{errors.valor.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataDespesa">Data da despesa</Label>
                  <Input id="dataDespesa" type="date" {...register("dataDespesa")} />
                  {errors.dataDespesa && <p className="text-sm text-destructive">{errors.dataDespesa.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anexos</CardTitle>
              <CardDescription>Adicione links para comprovantes, recibos ou arquivos relevantes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {existingAttachments.length > 0 && (
                <div className="space-y-3 rounded-md border border-border/70 bg-muted/20 p-4">
                  <p className="text-sm font-medium">Anexos já salvos</p>
                  <div className="space-y-2">
                    {existingAttachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.urlArquivo}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted/40"
                      >
                        {attachment.nomeArquivo} <span className="text-muted-foreground">({attachment.tipoArquivo})</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {fields.length === 0 && <p className="text-sm text-muted-foreground">Nenhum anexo adicionado ainda.</p>}

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">Anexo {index + 1}</p>
                      <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                        Remover
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`anexos.${index}.nomeArquivo`}>Nome do arquivo</Label>
                        <Input id={`anexos.${index}.nomeArquivo`} {...register(`anexos.${index}.nomeArquivo`)} />
                        {errors.anexos?.[index]?.nomeArquivo && (
                          <p className="text-sm text-destructive">{errors.anexos[index]?.nomeArquivo?.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`anexos.${index}.tipoArquivo`}>Tipo</Label>
                        <select
                          id={`anexos.${index}.tipoArquivo`}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          {...register(`anexos.${index}.tipoArquivo`)}
                        >
                          <option value="PDF">PDF</option>
                          <option value="JPG">JPG</option>
                          <option value="PNG">PNG</option>
                        </select>
                        {errors.anexos?.[index]?.tipoArquivo && (
                          <p className="text-sm text-destructive">{errors.anexos[index]?.tipoArquivo?.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`anexos.${index}.urlArquivo`}>URL do arquivo</Label>
                      <Input id={`anexos.${index}.urlArquivo`} placeholder="https://..." {...register(`anexos.${index}.urlArquivo`)} />
                      {errors.anexos?.[index]?.urlArquivo && (
                        <p className="text-sm text-destructive">{errors.anexos[index]?.urlArquivo?.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <Button type="button" variant="outline" onClick={() => append(emptyAttachment())}>
                  Adicionar anexo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {user?.perfil === "COLABORADOR"
                  ? "Você pode salvar como rascunho ou enviar a solicitação."
                  : "Somente colaboradores podem criar e editar solicitações."}
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSubmit((values) => saveReimbursement(values, false))}
                >
                  Salvar rascunho
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit((values) => saveReimbursement(values, true))}
                >
                  Salvar e enviar
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}

export function ReimbursementNewPage() {
  return <ReimbursementFormPage mode="create" />;
}

export function ReimbursementEditPage() {
  const { id } = useParams({ from: "/reimbursements/$id/edit" });

  return <ReimbursementFormPage mode="edit" reimbursementId={id} />;
}