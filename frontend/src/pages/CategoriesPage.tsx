import { useEffect, useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { createCategory, listCategories, updateCategory } from "@/services/categoriesService";
import type { Category } from "@/types";
import { getApiErrorMessage } from "@/utils/error";

const createCategorySchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome da categoria"),
  ativo: z.enum(["true", "false"]),
});

type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;

const editCategorySchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome da categoria"),
  ativo: z.enum(["true", "false"]),
});

type EditCategoryFormValues = z.infer<typeof editCategorySchema>;

function toBooleanStatus(value: "true" | "false") {
  return value === "true";
}

export function CategoriesPage() {
  const { isAuthenticated, user, permissions } = useAuth();
  const [isSavingCreate, setIsSavingCreate] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const {
    data: categories,
    error,
    isLoading,
    mutate,
  } = useSWR(
    isAuthenticated ? "categories-management" : null,
    async () => {
      const response = await listCategories(1, 100);
      return response.items;
    },
    { revalidateOnFocus: false }
  );

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: createErrors },
    reset: resetCreate,
  } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      nome: "",
      ativo: "true",
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors },
    reset: resetEdit,
  } = useForm<EditCategoryFormValues>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: {
      nome: "",
      ativo: "true",
    },
  });

  useEffect(() => {
    if (!selectedCategory) {
      return;
    }

    resetEdit({
      nome: selectedCategory.nome,
      ativo: selectedCategory.ativo ? "true" : "false",
    });
  }, [selectedCategory, resetEdit]);

  const canManageCategories = permissions.includes("manage_categories") || user?.perfil === "ADMIN";

  async function onCreate(values: CreateCategoryFormValues) {
    setIsSavingCreate(true);

    try {
      await createCategory({
        nome: values.nome,
        ativo: toBooleanStatus(values.ativo),
      });
      toast.success("Categoria criada com sucesso");
      resetCreate({ nome: "", ativo: "true" });
      await mutate();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível criar a categoria."));
    } finally {
      setIsSavingCreate(false);
    }
  }

  async function onEdit(values: EditCategoryFormValues) {
    if (!selectedCategory) {
      return;
    }

    setIsSavingEdit(true);

    try {
      await updateCategory(selectedCategory.id, {
        nome: values.nome,
        ativo: toBooleanStatus(values.ativo),
      });
      toast.success("Categoria atualizada com sucesso");
      setSelectedCategory(null);
      await mutate();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível atualizar a categoria."));
    } finally {
      setIsSavingEdit(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Você não está autenticado.
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  if (!canManageCategories) {
    return (
      <AppLayout>
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Acesso negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">Apenas administradores podem gerenciar categorias.</p>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Categorias</h1>
          <p className="text-muted-foreground">Crie e atualize categorias utilizadas nas solicitações de reembolso.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nova categoria</CardTitle>
            <CardDescription>Cadastre uma nova categoria para uso no formulário de solicitação.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-3" onSubmit={handleSubmitCreate(onCreate)}>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="create-nome">Nome</Label>
                <Input id="create-nome" placeholder="Ex.: Viagem" {...registerCreate("nome")} />
                {createErrors.nome && <p className="text-sm text-destructive">{createErrors.nome.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-ativo">Status</Label>
                <select
                  id="create-ativo"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...registerCreate("ativo")}
                >
                  <option value="true">Ativa</option>
                  <option value="false">Inativa</option>
                </select>
              </div>

              <div className="md:col-span-3 flex justify-end">
                <Button type="submit" disabled={isSavingCreate}>
                  {isSavingCreate ? "Salvando..." : "Criar categoria"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorias cadastradas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && <p className="text-sm text-muted-foreground">Carregando categorias...</p>}

            {error && (
              <p className="text-sm text-destructive">
                {getApiErrorMessage(error, "Não foi possível carregar as categorias.")}
              </p>
            )}

            {!isLoading && !error && categories && categories.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada.</p>
            )}

            {!isLoading && !error && categories && categories.length > 0 && (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Nome</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Atualizada em</th>
                      <th className="px-4 py-3 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td className="px-4 py-3">{category.nome}</td>
                        <td className="px-4 py-3">
                          <span className={category.ativo ? "text-green-700" : "text-slate-500"}>
                            {category.ativo ? "Ativa" : "Inativa"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(category.atualizadoEm).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button type="button" variant="outline" size="sm" onClick={() => setSelectedCategory(category)}>
                            Editar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={Boolean(selectedCategory)} onOpenChange={(open) => !open && setSelectedCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar categoria</DialogTitle>
              <DialogDescription>
                Atualize nome e status da categoria selecionada.
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmitEdit(onEdit)}>
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome</Label>
                <Input id="edit-nome" {...registerEdit("nome")} />
                {editErrors.nome && <p className="text-sm text-destructive">{editErrors.nome.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-ativo">Status</Label>
                <select
                  id="edit-ativo"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...registerEdit("ativo")}
                >
                  <option value="true">Ativa</option>
                  <option value="false">Inativa</option>
                </select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedCategory(null)} disabled={isSavingEdit}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSavingEdit}>
                  {isSavingEdit ? "Salvando..." : "Salvar alterações"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}