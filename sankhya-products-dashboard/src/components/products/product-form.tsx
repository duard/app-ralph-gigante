import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Save,
  Upload,
  X,
  Camera,
  FileText,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Loader2,
  EyeOff,
} from "lucide-react"
import { type Product } from "@/stores/products-store"
import { productFormSchema, type ProductFormSchemaType } from "@/lib/validations/product-schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useCreateProduct } from "@/hooks/use-create-product"
import { useUpdateProduct } from "@/hooks/use-update-product"

interface ProductFormProps {
  product?: Product | null
  mode?: "create" | "edit" | "view"
  onClose?: () => void
  onSuccess?: (product: Product) => void
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[^\d,]/g, "").replace(",", ".")
  return parseFloat(cleaned) || 0
}

export function ProductForm({ product = null, mode = "create", onClose, onSuccess }: ProductFormProps) {
  const { createProduct, isLoading: isCreating } = useCreateProduct()
  const { updateProduct, isLoading: isUpdating } = useUpdateProduct()
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState("basic")
  const [draftSaved, setDraftSaved] = React.useState(false)
  const [lastAutoSave, setLastAutoSave] = React.useState<Date | null>(null)

  const isLoading = isCreating || isUpdating
  const isReadOnly = mode === "view"

  const form = useForm<ProductFormSchemaType>({
    resolver: zodResolver(productFormSchema) as never,
    defaultValues: {
      descrprod: product?.descrprod || "",
      reffab: product?.reffab || "",
      codvol: product?.codvol || "UN",
      vlrvenda: product?.vlrvenda ?? undefined,
      vlrcusto: product?.vlrcusto ?? undefined,
      estoque: product?.estoque ?? undefined,
      estmin: product?.estmin ?? undefined,
      ativo: product?.ativo || "S",
      codgrupoprod: product?.codgrupoprod ?? undefined,
      codmarca: product?.codmarca ?? undefined,
      ncm: product?.ncm || "",
      cest: product?.cest || "",
      pesoliq: product?.pesoliq ?? undefined,
      pesobruto: product?.pesobruto ?? undefined,
      observacao: product?.observacao || "",
      imagem: product?.imagem || "",
    },
  })

  const { register, handleSubmit, setValue, watch, formState: { errors, isDirty } } = form

  const watchedValues = watch()

  React.useEffect(() => {
    if (product?.imagem) {
      setImagePreview(product.imagem)
    }
  }, [product])

  React.useEffect(() => {
    if (product?.imagem) {
      setValue("imagem", product.imagem)
    }
  }, [product, setValue])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB")
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setValue("imagem", result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setValue("imagem", "")
  }

  const handleAutoSave = React.useCallback(() => {
    const draft = localStorage.getItem("product-draft")
    const currentDraft = draft ? JSON.parse(draft) : {}

    const newDraft = {
      ...currentDraft,
      ...watchedValues,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem("product-draft", JSON.stringify(newDraft))
    setDraftSaved(true)
    setLastAutoSave(new Date())

    setTimeout(() => setDraftSaved(false), 2000)
  }, [watchedValues])

  React.useEffect(() => {
    const savedDraft = localStorage.getItem("product-draft")
    if (savedDraft && mode === "create") {
      try {
        const draft = JSON.parse(savedDraft)
        Object.keys(draft).forEach((key) => {
          if (key !== "updatedAt" && draft[key] !== undefined) {
            setValue(key as keyof ProductFormSchemaType, draft[key])
          }
        })
        toast.info("Rascunho recuperado com sucesso")
      } catch (e) {
        console.error("Erro ao recuperar rascunho:", e)
      }
    }
  }, [mode, setValue])

  React.useEffect(() => {
    if (isDirty && mode === "create") {
      const timer = setTimeout(() => {
        handleAutoSave()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isDirty, handleAutoSave, mode])

  const onSubmit = async (data: ProductFormSchemaType) => {
    if (isReadOnly) {
      toast.info("Modo somente leitura - operações não são permitidas")
      return
    }

    try {
      let result

      if (mode === "create") {
        result = await createProduct(data)
        if (result) {
          localStorage.removeItem("product-draft")
          toast.success("Produto criado com sucesso (simulado)")
          if (onSuccess && result) {
            onSuccess(result)
          }
        }
      } else if (mode === "edit" && product) {
        result = await updateProduct(product.codprod, data)
        if (result) {
          toast.success("Produto atualizado com sucesso (simulado)")
          if (onSuccess && result) {
            onSuccess(result)
          }
        }
      }
    } catch {
      toast.error("Erro ao salvar produto")
    }
  }

  const handleDelete = async () => {
    if (isReadOnly) {
      toast.info("Modo somente leitura - operações não são permitidas")
      return
    }

    toast.info("Exclusão não permitida em modo de demonstração")
  }

  const handleClearDraft = () => {
    localStorage.removeItem("product-draft")
    setDraftSaved(false)
    setLastAutoSave(null)
    if (mode === "create") {
      form.reset({
        descrprod: "",
        reffab: "",
        codvol: "UN",
        vlrvenda: undefined,
        vlrcusto: undefined,
        estoque: undefined,
        estmin: undefined,
        ativo: "S",
        codgrupoprod: undefined,
        codmarca: undefined,
        ncm: "",
        cest: "",
        pesoliq: undefined,
        pesobruto: undefined,
        observacao: "",
        imagem: "",
      })
      setImagePreview(null)
    }
    toast.success("Rascunho limpo")
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="pricing">Preços</TabsTrigger>
            <TabsTrigger value="inventory">Estoque</TabsTrigger>
            <TabsTrigger value="additional">Adicional</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="descrprod">Descrição do Produto *</Label>
                    <Input
                      id="descrprod"
                      placeholder="Nome completo do produto"
                      disabled={isLoading || isReadOnly}
                      {...register("descrprod")}
                    />
                    {errors.descrprod && (
                      <p className="text-sm text-destructive">{errors.descrprod.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reffab">Referência do Fabricante</Label>
                    <Input
                      id="reffab"
                      placeholder="Código de referência"
                      disabled={isLoading || isReadOnly}
                      {...register("reffab")}
                    />
                    {errors.reffab && (
                      <p className="text-sm text-destructive">{errors.reffab.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codvol">Unidade de Medida</Label>
                    <Select
                      value={watch("codvol") || "UN"}
                      onValueChange={(value) => setValue("codvol", value)}
                      disabled={isLoading || isReadOnly}
                    >
                      <SelectTrigger id="codvol">
                        <SelectValue placeholder="Selecione a unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UN">UN - Unidade</SelectItem>
                        <SelectItem value="KG">KG - Quilograma</SelectItem>
                        <SelectItem value="LT">LT - Litro</SelectItem>
                        <SelectItem value="MT">MT - Metro</SelectItem>
                        <SelectItem value="PC">PC - Peça</SelectItem>
                        <SelectItem value="CX">CX - Caixa</SelectItem>
                        <SelectItem value="FD">FD - Fardo</SelectItem>
                        <SelectItem value="RL">RL - Rolo</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.codvol && (
                      <p className="text-sm text-destructive">{errors.codvol.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codgrupoprod">Grupo/Categoria</Label>
                    <Select
                      value={watch("codgrupoprod")?.toString() || ""}
                      onValueChange={(value) => setValue("codgrupoprod", parseInt(value) || undefined)}
                      disabled={isLoading || isReadOnly}
                    >
                      <SelectTrigger id="codgrupoprod">
                        <SelectValue placeholder="Selecione o grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Eletrônicos</SelectItem>
                        <SelectItem value="2">Vestuário</SelectItem>
                        <SelectItem value="3">Alimentos</SelectItem>
                        <SelectItem value="4">Bebidas</SelectItem>
                        <SelectItem value="5">Limpeza</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ativo">Status</Label>
                    <Select
                      value={watch("ativo") || "S"}
                      onValueChange={(value: "S" | "N") => setValue("ativo", value)}
                      disabled={isLoading || isReadOnly}
                    >
                      <SelectTrigger id="ativo">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="S">Ativo</SelectItem>
                        <SelectItem value="N">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Imagem do Produto</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg overflow-hidden flex items-center justify-center bg-muted/50">
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          {!isReadOnly && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={removeImage}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </>
                      ) : (
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    {!isReadOnly && (
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Label
                          htmlFor="image-upload"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Button type="button" variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload de Imagem
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            PNG, JPG até 5MB
                          </span>
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Preços e Custos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="vlrvenda">Preço de Venda</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="vlrvenda"
                        type="text"
                        placeholder="0,00"
                        disabled={isLoading || isReadOnly}
                        className="pl-9"
                        value={watch("vlrvenda") ? formatCurrency(watch("vlrvenda")!) : ""}
                        onChange={(e) => {
                          const value = parseCurrency(e.target.value)
                          setValue("vlrvenda", value)
                        }}
                      />
                    </div>
                    {errors.vlrvenda && (
                      <p className="text-sm text-destructive">{errors.vlrvenda.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vlrcusto">Preço de Custo</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="vlrcusto"
                        type="text"
                        placeholder="0,00"
                        disabled={isLoading || isReadOnly}
                        className="pl-9"
                        value={watch("vlrcusto") ? formatCurrency(watch("vlrcusto")!) : ""}
                        onChange={(e) => {
                          const value = parseCurrency(e.target.value)
                          setValue("vlrcusto", value)
                        }}
                      />
                    </div>
                    {errors.vlrcusto && (
                      <p className="text-sm text-destructive">{errors.vlrcusto.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="observacao">Observações</Label>
                    <Textarea
                      id="observacao"
                      placeholder="Observações adicionais sobre o produto..."
                      disabled={isLoading || isReadOnly}
                      rows={3}
                      {...register("observacao")}
                    />
                    {errors.observacao && (
                      <p className="text-sm text-destructive">{errors.observacao.message}</p>
                    )}
                  </div>
                </div>

                {watch("vlrcusto") !== undefined && watch("vlrvenda") !== undefined && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Margem de Lucro</span>
                      <Badge variant="outline">
                        {watch("vlrcusto")! > 0
                          ? `${(((watch("vlrvenda")! - watch("vlrcusto")!) / watch("vlrcusto")!) * 100).toFixed(1)}%`
                          : "N/A"}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Controle de Estoque
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="estoque">Estoque Atual</Label>
                    <Input
                      id="estoque"
                      type="number"
                      min="0"
                      placeholder="0"
                      disabled={isLoading || isReadOnly}
                      {...register("estoque", { valueAsNumber: true })}
                    />
                    {errors.estoque && (
                      <p className="text-sm text-destructive">{errors.estoque.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estmin">Estoque Mínimo</Label>
                    <Input
                      id="estmin"
                      type="number"
                      min="0"
                      placeholder="0"
                      disabled={isLoading || isReadOnly}
                      {...register("estmin", { valueAsNumber: true })}
                    />
                    {errors.estmin && (
                      <p className="text-sm text-destructive">{errors.estmin.message}</p>
                    )}
                  </div>
                </div>

                {watch("estoque") !== undefined && watch("estmin") !== undefined && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {watch("estoque")! <= (watch("estmin") || 0) ? (
                        <AlertCircle className="h-4 w-4 text-warning" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      )}
                      <span className="text-sm font-medium">
                        {watch("estoque")! <= (watch("estmin") || 0)
                          ? "Estoque abaixo do mínimo!"
                          : "Estoque adequado"}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ncm">NCM</Label>
                    <Input
                      id="ncm"
                      placeholder="00000000"
                      maxLength={8}
                      disabled={isLoading || isReadOnly}
                      {...register("ncm")}
                    />
                    {errors.ncm && (
                      <p className="text-sm text-destructive">{errors.ncm.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cest">CEST</Label>
                    <Input
                      id="cest"
                      placeholder="0000000"
                      maxLength={7}
                      disabled={isLoading || isReadOnly}
                      {...register("cest")}
                    />
                    {errors.cest && (
                      <p className="text-sm text-destructive">{errors.cest.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pesoliq">Peso Líquido (kg)</Label>
                    <Input
                      id="pesoliq"
                      type="number"
                      min="0"
                      step="0.001"
                      placeholder="0,000"
                      disabled={isLoading || isReadOnly}
                      {...register("pesoliq", { valueAsNumber: true })}
                    />
                    {errors.pesoliq && (
                      <p className="text-sm text-destructive">{errors.pesoliq.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pesobruto">Peso Bruto (kg)</Label>
                    <Input
                      id="pesobruto"
                      type="number"
                      min="0"
                      step="0.001"
                      placeholder="0,000"
                      disabled={isLoading || isReadOnly}
                      {...register("pesobruto", { valueAsNumber: true })}
                    />
                    {errors.pesobruto && (
                      <p className="text-sm text-destructive">{errors.pesobruto.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {mode === "create" && (
              <>
                {draftSaved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Rascunho salvo</span>
                  </>
                ) : lastAutoSave ? (
                  <>
                    <span>Último save: {lastAutoSave.toLocaleTimeString()}</span>
                  </>
                ) : null}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {mode === "create" && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClearDraft}
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar Rascunho
              </Button>
            )}

            {mode === "edit" && product && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading || isReadOnly}
              >
                Excluir
              </Button>
            )}

            <Button
              type="submit"
              disabled={isLoading || isReadOnly}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === "create" ? "Criar Produto" : "Salvar Alterações"}
                </>
              )}
            </Button>

            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>

        {isReadOnly && (
          <div className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg">
            <EyeOff className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Modo somente leitura - As alterações não serão salvas
            </span>
          </div>
        )}
      </form>
    </div>
  )
}

export default ProductForm
