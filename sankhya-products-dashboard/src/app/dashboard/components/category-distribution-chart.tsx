'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, PieChart, Pie, Cell } from 'recharts';

import { useProductsStore } from '@/stores/products-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export const description = 'Product distribution by category chart';

type ChartType = 'bar' | 'pie';

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

const chartConfig = {
  products: {
    label: 'Produtos',
  },
  count: {
    label: 'Quantidade',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export function CategoryDistributionChart() {
  const products = useProductsStore((state) => state.products);
  const [chartType, setChartType] = React.useState<ChartType>('bar');

  // Process products data to get category distribution
  const categoryData = React.useMemo(() => {
    const categoryMap = new Map<string, number>();

    products.forEach((product) => {
      const category = product.descrgrupoprod || 'Sem Categoria';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    // Convert to array and sort by count (descending)
    return Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        fill: `var(--chart-${categoryMap.size > 5 ? 1 : categoryMap.size})`,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Limit to top 10 categories
  }, [products]);

  // Prepare data for pie chart (limit to top 5 for better visualization)
  const pieChartData = React.useMemo(() => {
    return categoryData.slice(0, 5).map((item, index) => ({
      name: item.category,
      value: item.count,
      fill: COLORS[index % COLORS.length],
    }));
  }, [categoryData]);

  const totalProducts = React.useMemo(() => {
    return products.length;
  }, [products]);

  const topCategoryPercentage = React.useMemo(() => {
    if (categoryData.length === 0 || totalProducts === 0) return 0;
    return (((categoryData[0]?.count || 0) / totalProducts) * 100).toFixed(1);
  }, [categoryData, totalProducts]);

  if (products.length === 0) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Distribuição por Categoria</CardTitle>
          <CardDescription>Carregue produtos para visualizar a distribuição</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            Nenhum produto encontrado
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Distribuição por Categoria</CardTitle>
        <CardDescription>
          {categoryData.length} categorias encontradas • {totalProducts} produtos totais
        </CardDescription>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={chartType}
            onValueChange={(value) => setChartType(value as ChartType)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[540px]/card:flex"
          >
            <ToggleGroupItem value="bar">Barras</ToggleGroupItem>
            <ToggleGroupItem value="pie">Pizza</ToggleGroupItem>
          </ToggleGroup>
          <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
            <SelectTrigger
              className="flex w-32 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[540px]/card:hidden"
              size="sm"
              aria-label="Select chart type"
            >
              <SelectValue placeholder="Gráfico" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="bar" className="rounded-lg">
                Barras
              </SelectItem>
              <SelectItem value="pie" className="rounded-lg">
                Pizza
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {chartType === 'bar' ? (
          <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
            <BarChart
              data={categoryData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                angle={-45}
                textAnchor="end"
                height={80}
                tickFormatter={(value) => {
                  // Truncate long category names
                  return value.length > 15 ? `${value.slice(0, 15)}...` : value;
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value) => [`${value} produtos`, 'Quantidade']}
                  />
                }
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value) => [`${value} produtos`, 'Quantidade']}
                  />
                }
              />
            </PieChart>
          </ChartContainer>
        )}

        {categoryData.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Categoria principal:</span>
              <span className="font-medium">
                {categoryData[0]?.category} ({topCategoryPercentage}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Média por categoria:</span>
              <span className="font-medium">
                {(totalProducts / categoryData.length).toFixed(1)} produtos
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
