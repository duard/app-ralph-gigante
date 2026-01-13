'use client';

import { useState, useEffect } from 'react';
import { useProdutosV2Listagem } from '@/hooks/produtos-v2/use-produtos-v2-listagem';
import { useProdutosV2Filtros } from '@/hooks/produtos-v2/use-produtos-v2-filtros';
import { FilterPanel } from '@/components/produtos-v2/filter-panel';
import { ProdutoTable } from '@/components/produtos-v2/produto-table';
import { Pagination } from '@/components/produtos-v2/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { useSearchParams } from 'react-router-dom';

interface ProdutoV2ListagemContainerProps {}

export function ListagemContainer({}: ProdutoV2ListagemContainerProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params
  const [page, setPage] = useState<number>(() => {
    const param = searchParams.get('page');
    return param ? parseInt(param, 10) : 1;
  });

  const [perPage, setPerPage] = useState<number>(() => {
    const param = searchParams.get('perPage');
    return param ? parseInt(param, 10) : 20;
  });

  const [sort, setSort] = useState<string>(() => {
    const param = searchParams.get('sort');
    return param || 'codprod-desc';
  });

  const [search, setSearch] = useState<string>(() => {
    const param = searchParams.get('search');
    return param || '';
  });

  const [grupos, setGrupos] = useState<string[]>(() => {
    const param = searchParams.get('grupos');
    return param ? param.split(',') : [];
  });

  const [locais, setLocais] = useState<string[]>(() => {
    const param = searchParams.get('locais');
    return param ? param.split(',') : [];
  });

  const [controles, setControles] = useState<string[]>(() => {
    const param = searchParams.get('controles');
    return param ? param.split(',') : [];
  });

  const [marcas, setMarcas] = useState<string[]>(() => {
    const param = searchParams.get('marcas');
    return param ? param.split(',') : [];
  });

  const [ativo, setAtivo] = useState<string>(() => {
    const param = searchParams.get('ativo');
    return param || '';
  });

  const [comEstoque, setComEstoque] = useState<boolean>(() => {
    const param = searchParams.get('comEstoque');
    return param === 'true';
  });

  const [semEstoque, setSemEstoque] = useState<boolean>(() => {
    const param = searchParams.get('semEstoque');
    return param === 'true';
  });

  const [critico, setCritico] = useState<boolean>(() => {
    const param = searchParams.get('critico');
    return param === 'true';
  });

  const [estoqueMin, setEstoqueMin] = useState<string>(() => {
    const param = searchParams.get('estoqueMin');
    return param || '';
  });

  const [estoqueMax, setEstoqueMax] = useState<string>(() => {
    const param = searchParams.get('estoqueMax');
    return param || '';
  });

  // Update URL params when state changes
  useEffect(() => {
    const params = new URLSearchParams();

    if (page > 1) params.set('page', page.toString());
    if (perPage !== 20) params.set('perPage', perPage.toString());
    if (sort !== 'codprod-desc') params.set('sort', sort);
    if (search) params.set('search', search);
    if (grupos.length > 0) params.set('grupos', grupos.join(','));
    if (locais.length > 0) params.set('locais', locais.join(','));
    if (controles.length > 0) params.set('controles', controles.join(','));
    if (marcas.length > 0) params.set('marcas', marcas.join(','));
    if (ativo) params.set('ativo', ativo);
    if (comEstoque) params.set('comEstoque', 'true');
    if (semEstoque) params.set('semEstoque', 'true');
    if (critico) params.set('critico', 'true');
    if (estoqueMin) params.set('estoqueMin', estoqueMin);
    if (estoqueMax) params.set('estoqueMax', estoqueMax);

    setSearchParams(params);
  }, [
    page,
    perPage,
    sort,
    search,
    grupos,
    locais,
    controles,
    marcas,
    ativo,
    comEstoque,
    semEstoque,
    critico,
    estoqueMin,
    estoqueMax,
    setSearchParams,
  ]);

  const { data, isLoading, error } = useProdutosV2Listagem({
    page,
    perPage,
    sort,
    search,
    grupos: grupos.map(Number),
    locais: locais.map(Number),
    controles,
    marcas,
    ativo: ativo || undefined,
    comEstoque,
    semEstoque,
    critico,
    estoqueMin: estoqueMin ? Number(estoqueMin) : undefined,
    estoqueMax: estoqueMax ? Number(estoqueMax) : undefined,
  });

  const {
    grupos: gruposOptions,
    locais: locaisOptions,
    controles: controlesOptions,
    marcas: marcasOptions,
    isLoading: isLoadingFiltros,
  } = useProdutosV2Filtros();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1); // Reset to first page when changing per page
  };

  const handleSortChange = (column: string, direction: 'asc' | 'desc') => {
    const newSort = `${column}-${direction}`;
    setSort(newSort);
    setPage(1); // Reset to first page when sorting changes
  };

  const handleClearFilters = () => {
    setSearch('');
    setGrupos([]);
    setLocais([]);
    setControles([]);
    setMarcas([]);
    setAtivo('');
    setComEstoque(false);
    setSemEstoque(false);
    setCritico(false);
    setEstoqueMin('');
    setEstoqueMax('');
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <FilterPanel
          search={search}
          setSearch={setSearch}
          grupos={grupos}
          setGrupos={setGrupos}
          locais={locais}
          setLocais={setLocais}
          controles={controles}
          setControles={setControles}
          marcas={marcas}
          setMarcas={setMarcas}
          ativo={ativo}
          setAtivo={setAtivo}
          comEstoque={comEstoque}
          setComEstoque={setComEstoque}
          semEstoque={semEstoque}
          setSemEstoque={setSemEstoque}
          critico={critico}
          setCritico={setCritico}
          estoqueMin={estoqueMin}
          setEstoqueMin={setEstoqueMin}
          estoqueMax={estoqueMax}
          setEstoqueMax={setEstoqueMax}
          gruposOptions={gruposOptions}
          locaisOptions={locaisOptions}
          controlesOptions={controlesOptions}
          marcasOptions={marcasOptions}
          isLoading={isLoadingFiltros}
          onClearFilters={handleClearFilters}
        />
      </Card>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          <h3 className="font-medium">Erro ao carregar dados</h3>
          <p className="text-sm">{error.message}</p>
        </div>
      ) : (
        <>
          <ProdutoTable
            data={data?.data || []}
            loading={isLoading}
            sort={sort}
            onSortChange={handleSortChange}
          />

          {data && (
            <Pagination
              page={page}
              perPage={perPage}
              total={data.total}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
