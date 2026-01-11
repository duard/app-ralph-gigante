"use client"

import * as React from "react"
import { AnimatedDrawer } from "@/components/ui/animated-drawer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { formatProductCode, formatProductPrice, formatProductStatus, formatDate, formatCurrency } from "@/lib/utils/product-utils"
import type { Product } from "@/stores/products-store"
import { useProductPriceHistory } from "@/hooks/use-product-price-history"
import { PriceHistoryChart } from "./price-history-chart"
import {
  Package,
  DollarSign,
  Box,
  Tag,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Edit,
  TrendingUp,
  Clock
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface ProductDetailsModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onPrevious?: () => void
  onNext?: () => void
  onEdit?: (product: Product) => void
  hasPrevious?: boolean
  hasNext?: boolean
}

export function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  onEdit,
  hasPrevious = false,
  hasNext = false
}: ProductDetailsModalProps) {
  const [activeTab, setActiveTab] = React.useState("details")
  
  const {
    priceHistory,
    isLoading: isLoadingPriceHistory,
    fetchLast30Days,
    fetchLast90Days,
    getAveragePrice,
    getPriceTrend
  } = useProductPriceHistory()

  // Load price history when tab changes to price-history
  React.useEffect(() => {
    if (activeTab === "price-history" && product?.codprod && !priceHistory) {
      fetchLast30Days(product.codprod)
    }
  }, [activeTab, product?.codprod, fetchLast30Days, priceHistory])

  if (!product) return null

  const handleEdit = () => {
    if (onEdit && product) {
      toast.success(`Modo de edição ativado para ${product.descrprod}`)
      onEdit(product)
    }
  }

  const handlePeriodChange = (period: '30' | '90') => {
    if (product?.codprod) {
      if (period === '30') {
        fetchLast30Days(product.codprod)
      } else {
        fetchLast90Days(product.codprod)
      }
    }
  }

  return (
    <AnimatedDrawer 
      isOpen={isOpen} 
      onClose={onClose}
      size="xl"
      className="max-w-2xl mx-auto"
    >
      <div className="flex flex-col h-full">
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <Package className="h-6 w-6 text-muted-foreground" />
              </motion.div>
              <div>
                <motion.h2 
                  className="text-lg font-semibold"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  {formatProductCode(product.codprod)}
                </motion.h2>
                <motion.p 
                  className="text-sm text-muted-foreground mt-1 line-clamp-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                >
                  {product.descrprod}
                </motion.p>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (hasPrevious && onPrevious) {
                      onPrevious();
                      toast.info("Navegando para produto anterior");
                    }
                  }}
                  disabled={!hasPrevious}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (hasNext && onNext) {
                      onNext();
                      toast.info("Navegando para próximo produto");
                    }
                  }}
                  disabled={!hasNext}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <ScrollArea className="flex-1 px-6 py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <TabsTrigger value="details" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Detalhes
                  </TabsTrigger>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <TabsTrigger value="price-history" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Histórico de Preços
                  </TabsTrigger>
                </motion.div>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent key="details" value="details" className="mt-6">
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Product Image */}
                    {product.imagem && (
                      <motion.div 
                        className="flex justify-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                      >
                        <Card className="w-48 h-48 overflow-hidden">
                          <CardContent className="p-0 h-full flex items-center justify-center">
                            <img
                              src={product.imagem}
                              alt={product.descrprod}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                target.parentElement!.innerHTML = '<div class="flex flex-col items-center justify-center h-full text-muted-foreground"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><p class="text-xs mt-2">Imagem não disponível</p></div>'
                              }}
                            />
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    {/* Status and Basic Info */}
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Badge 
                            variant={product.ativo === "S" ? "default" : "secondary"}
                            className="text-sm"
                          >
                            {formatProductStatus(product.ativo)}
                          </Badge>
                        </motion.div>
                        {product.descrgrupoprod && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Badge variant="outline" className="text-sm">
                              {product.descrgrupoprod}
                            </Badge>
                          </motion.div>
                        )}
                      </div>
                      <motion.div 
                        className="text-right"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                      >
                        <p className="text-2xl font-bold text-green-600">
                          {formatProductPrice(product.vlrvenda || 0)}
                        </p>
                      </motion.div>
                    </motion.div>

                    <Separator />

                    {/* Product Information */}
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                            Informações Básicas
                          </h4>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Tag className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Código</p>
                                <p className="text-lg">{formatProductCode(product.codprod)}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Descrição</p>
                                <p className="text-sm">{product.descrprod}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <Box className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Unidade</p>
                                <p className="text-sm">{product.codvol || "-"}</p>
                              </div>
                            </div>

                            {product.descrgrupoprod && (
                              <div className="flex items-center gap-3">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">Grupo</p>
                                  <p className="text-sm">{product.descrgrupoprod}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                            Estoque e Valores
                          </h4>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Box className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Estoque Atual</p>
                                <p className="text-lg">{product.estoque || 0} unidades</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Preço de Venda</p>
                                <p className="text-lg font-semibold text-green-600">
                                  {formatProductPrice(product.vlrvenda || 0)}
                                </p>
                              </div>
                            </div>

                            {product.vlrcusto && (
                              <div className="flex items-center gap-3">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">Custo</p>
                                  <p className="text-lg text-orange-600">
                                    {formatProductPrice(product.vlrcusto)}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Additional Information */}
                    {(product.codvol || product.pesoliq || product.codmarca || product.ncm) && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                            Informações Adicionais
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {product.codvol && (
                              <div>
                                <p className="text-sm font-medium">Unidade de Venda</p>
                                <p className="text-sm">{product.codvol}</p>
                              </div>
                            )}
                            
                            {product.ncm && (
                              <div>
                                <p className="text-sm font-medium">NCM</p>
                                <p className="text-sm">{product.ncm}</p>
                              </div>
                            )}
                            
                            {product.pesoliq && (
                              <div>
                                <p className="text-sm font-medium">Peso Líquido</p>
                                <p className="text-sm">{product.pesoliq} kg</p>
                              </div>
                            )}
                            
                            {product.pesobruto && (
                              <div>
                                <p className="text-sm font-medium">Peso Bruto</p>
                                <p className="text-sm">{product.pesobruto} kg</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Timestamp Information */}
                    {(product.dtcad || product.dtalter) && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                            Informações de Sistema
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {product.dtcad && (
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">Data de Inclusão</p>
                                  <p className="text-sm">{formatDate(product.dtcad)}</p>
                                </div>
                              </div>
                            )}
                            
                            {product.dtalter && (
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">Última Alteração</p>
                                  <p className="text-sm">{formatDate(product.dtalter)}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                </TabsContent>

                <TabsContent key="price-history" value="price-history" className="mt-6">
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      <PriceHistoryChart
                        data={priceHistory?.movimentacoes || []}
                        isLoading={isLoadingPriceHistory}
                        onPeriodChange={handlePeriodChange}
                        averagePrice={getAveragePrice()}
                        priceTrend={getPriceTrend()}
                      />
                    </motion.div>
                    
                    {/* Price History Summary */}
                    {priceHistory && !isLoadingPriceHistory && (
                      <motion.div 
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Card className="p-4">
                            <div className="flex items-center gap-3">
                              <Clock className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Período</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(priceHistory.dataInicio).toLocaleDateString('pt-BR')} até {' '}
                                  {new Date(priceHistory.dataFim).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Card className="p-4">
                            <div className="flex items-center gap-3">
                              <DollarSign className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Preço Médio</p>
                                <p className="text-sm font-semibold text-green-600">
                                  {formatCurrency(getAveragePrice())}
                                </p>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Card className="p-4">
                            <div className="flex items-center gap-3">
                              <Tag className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Movimentações</p>
                                <p className="text-sm font-semibold">
                                  {priceHistory.totalMovimentacoes} registros
                                </p>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </motion.div>
        </ScrollArea>

        <motion.div 
          className="border-t px-6 py-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Produto
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatedDrawer>
  )
}