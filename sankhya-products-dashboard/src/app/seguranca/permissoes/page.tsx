import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import {
  Shield,
  Users,
  Key,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Lock,
  Unlock,
  Filter,
  RefreshCw,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';

interface Permission {
  IDACESSO: string;
  DESCRICAO: string;
  SIGLA: string;
  ACESSO: string;
  ORIGEM: 'USUARIO' | 'GRUPO';
  CODUSU?: number;
  CODGRUPO?: number;
  VERSAO?: number;
}

interface UserPermissions {
  CODUSU: number;
  NOMEUSU: string;
  CODGRU: number;
  DESCRGRU: string;
  permissions: Permission[];
  totalPermissions: number;
}

interface Usuario {
  CODUSU: number;
  NOMEUSU: string;
  CODGRU: number;
  DESCRGRU: string;
  ATIVO: string;
}

interface Resource {
  IDACESSO: string;
  DESCRICAO: string;
  SIGLA: string;
  SEQUENCIA: number;
}

export default function PermissoesPage() {
  const { token } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para usuários
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);

  // Estado para recursos
  const [resources, setResources] = useState<Resource[]>([]);
  const [grupos, setGrupos] = useState<{CODGRU: number, DESCRGRU: string}[]>([]);

  // Search local com debounce
  const [localUserSearch, setLocalUserSearch] = useState('');

  // Estado derivado da URL
  const selectedUser = searchParams.get('user') ? parseInt(searchParams.get('user')!) : null;
  const userSearchTerm = searchParams.get('search') || '';
  const filterGrupo = searchParams.get('grupo') === 'ALL' ? 'ALL' : (searchParams.get('grupo') ? parseInt(searchParams.get('grupo')!) : 'ALL');
  const filterAtivo = (searchParams.get('ativo') as 'ALL' | 'S' | 'N') || 'ALL';
  const searchTerm = searchParams.get('permSearch') || '';
  const filterOrigem = (searchParams.get('origem') as 'ALL' | 'USUARIO' | 'GRUPO') || 'ALL';
  const filterAcesso = (searchParams.get('acesso') as 'ALL' | 'COMPLETO' | 'BLOQUEADO') || 'ALL';

  // Carregar usuários ao montar
  useEffect(() => {
    loadUsers();
    loadResources();
    loadGroups();
  }, []);

  // Sincronizar localUserSearch com URL
  useEffect(() => {
    setLocalUserSearch(userSearchTerm);
  }, [userSearchTerm]);

  // Debounce para atualizar URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (localUserSearch) {
        params.set('search', localUserSearch);
      } else {
        params.delete('search');
      }
      setSearchParams(params);
    }, 300);

    return () => clearTimeout(timer);
  }, [localUserSearch]);

  // Filtrar usuários usando useMemo para otimização
  const filteredUsuarios = useMemo(() => {
    let filtered = usuarios;

    // Filtro por nome
    if (userSearchTerm.trim()) {
      const term = userSearchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.NOMEUSU.toLowerCase().includes(term) ||
        u.CODUSU.toString().includes(term)
      );
    }

    // Filtro por grupo
    if (filterGrupo !== 'ALL') {
      filtered = filtered.filter(u => u.CODGRU === filterGrupo);
    }

    // Filtro por ativo
    if (filterAtivo !== 'ALL') {
      filtered = filtered.filter(u => u.ATIVO === filterAtivo);
    }

    return filtered;
  }, [usuarios, userSearchTerm, filterGrupo, filterAtivo]);

  // Filtrar permissões usando useMemo
  const filteredResources = useMemo(() => {
    if (!userPermissions) return [];

    let filtered: Permission[] = userPermissions.permissions;

    // Filtro por origem
    if (filterOrigem !== 'ALL') {
      filtered = filtered.filter(p => p.ORIGEM === filterOrigem);
    }

    // Filtro por nível de acesso
    if (filterAcesso === 'COMPLETO') {
      filtered = filtered.filter(p => p.ACESSO !== '0');
    } else if (filterAcesso === 'BLOQUEADO') {
      filtered = filtered.filter(p => p.ACESSO === '0');
    }

    // Filtro por busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.DESCRICAO?.toLowerCase().includes(term) ||
          p.IDACESSO?.toLowerCase().includes(term) ||
          p.SIGLA?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [searchTerm, filterOrigem, filterAcesso, userPermissions]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/permissions/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar usuários');
      }

      const data = await response.json();
      setUsuarios(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      const response = await fetch('/permissions/resources', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar recursos');
      }

      const data = await response.json();
      setResources(data);
    } catch (err: any) {
      console.error('Erro ao carregar recursos:', err);
    }
  };

  const loadGroups = async () => {
    try {
      const response = await fetch('/permissions/groups', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar grupos');
      }

      const data = await response.json();
      setGrupos(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar grupos:', err);
      // Define array vazio em caso de erro
      setGrupos([]);
    }
  };

  const loadUserPermissions = async (codUsu: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/permissions/user/${codUsu}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar permissões do usuário');
      }

      const data = await response.json();
      setUserPermissions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (codUsu: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('user', codUsu.toString());
    // Reset permission filters
    params.delete('permSearch');
    params.delete('origem');
    params.delete('acesso');
    setSearchParams(params);
    loadUserPermissions(codUsu);
  };

  const updateFilterGrupo = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'ALL') {
      params.set('grupo', value);
    } else {
      params.delete('grupo');
    }
    setSearchParams(params);
  };

  const updateFilterAtivo = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'ALL') {
      params.set('ativo', value);
    } else {
      params.delete('ativo');
    }
    setSearchParams(params);
  };

  const updatePermSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('permSearch', value);
    } else {
      params.delete('permSearch');
    }
    setSearchParams(params);
  };

  const updateFilterOrigem = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'ALL') {
      params.set('origem', value);
    } else {
      params.delete('origem');
    }
    setSearchParams(params);
  };

  const updateFilterAcesso = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'ALL') {
      params.set('acesso', value);
    } else {
      params.delete('acesso');
    }
    setSearchParams(params);
  };

  const getAccessBadge = (acesso: string) => {
    if (acesso === '0') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Bloqueado
        </Badge>
      );
    } else if (acesso === '1249') {
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Completo
        </Badge>
      );
    } else if (acesso === '9249') {
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-purple-600">
          <Shield className="h-3 w-3" />
          Admin
        </Badge>
      );
    } else if (acesso === '1209') {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Lock className="h-3 w-3" />
          Leitura
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Key className="h-3 w-3" />
        {acesso}
      </Badge>
    );
  };

  const getOrigemIcon = (origem: 'USUARIO' | 'GRUPO') => {
    if (origem === 'USUARIO') {
      return <User className="h-4 w-4 text-blue-600" />;
    }
    return <Users className="h-4 w-4 text-orange-600" />;
  };

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('permSearch');
    params.delete('origem');
    params.delete('acesso');
    setSearchParams(params);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Segurança e Permissões
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie permissões e acessos dos usuários do sistema
          </p>
        </div>
        <Button onClick={loadUsers} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="permissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="permissions">Permissões por Usuário</TabsTrigger>
          <TabsTrigger value="resources">Recursos Disponíveis</TabsTrigger>
        </TabsList>

        {/* Tab: Permissões por Usuário */}
        <TabsContent value="permissions" className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            {/* Sidebar: Lista de Usuários */}
            <div className="col-span-12 lg:col-span-4">
              <Card className="h-[calc(100vh-16rem)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Usuários
                  </CardTitle>
                  <CardDescription>
                    {filteredUsuarios.length} de {usuarios.length} usuários
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filtros de Usuário */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        placeholder="Buscar usuário..."
                        value={localUserSearch}
                        onChange={e => setLocalUserSearch(e.target.value)}
                        className="w-full pr-8"
                      />
                      {localUserSearch && (
                        <button
                          onClick={() => setLocalUserSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-sm transition-colors"
                          type="button"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>

                    <Select value={filterGrupo.toString()} onValueChange={updateFilterGrupo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todos os Grupos</SelectItem>
                        {grupos.map(g => (
                          <SelectItem key={g.CODGRU} value={g.CODGRU.toString()}>
                            {g.DESCRGRU}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filterAtivo} onValueChange={updateFilterAtivo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todos</SelectItem>
                        <SelectItem value="S">Ativos</SelectItem>
                        <SelectItem value="N">Inativos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Lista de Usuários */}
                  <ScrollArea className="h-[calc(100vh-32rem)]">
                    <div className="space-y-2">
                      {loading && usuarios.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Carregando...
                        </div>
                      ) : filteredUsuarios.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Nenhum usuário encontrado
                        </div>
                      ) : (
                        filteredUsuarios.map(user => (
                          <button
                            key={user.CODUSU}
                            onClick={() => handleUserClick(user.CODUSU)}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              selectedUser === user.CODUSU
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'hover:bg-accent hover:border-accent-foreground'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {user.ATIVO === 'S' ? (
                                    <UserCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  ) : (
                                    <UserX className="h-4 w-4 text-red-500 flex-shrink-0" />
                                  )}
                                  <p className="font-semibold truncate">{user.NOMEUSU}</p>
                                </div>
                                <p className={`text-xs mt-1 ${selectedUser === user.CODUSU ? 'opacity-90' : 'text-muted-foreground'}`}>
                                  Cód: {user.CODUSU}
                                </p>
                                {user.DESCRGRU && (
                                  <p className={`text-xs mt-0.5 truncate ${selectedUser === user.CODUSU ? 'opacity-80' : 'text-muted-foreground'}`}>
                                    Grupo: {user.DESCRGRU}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Área Principal: Permissões do Usuário */}
            <div className="col-span-12 lg:col-span-8">
              {!selectedUser ? (
                <Card className="h-[calc(100vh-16rem)]">
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <Shield className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">Selecione um usuário na lista ao lado</p>
                      <p className="text-sm mt-2">Clique em um usuário para visualizar suas permissões</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4 h-[calc(100vh-16rem)] overflow-y-auto">
                  {userPermissions ? (
                    <React.Fragment>
                      <Card>
                        <CardHeader>
                          <CardTitle>Informações do Usuário</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Código</p>
                              <p className="font-semibold">{userPermissions.CODUSU}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Nome</p>
                              <p className="font-semibold">{userPermissions.NOMEUSU}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Grupo</p>
                              <p className="font-semibold">
                                {userPermissions.DESCRGRU || 'Sem grupo'} ({userPermissions.CODGRU})
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total de Permissões</p>
                              <p className="font-semibold">{userPermissions.totalPermissions}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtros de Permissões
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-1">
                              <Input
                                placeholder="Buscar permissão..."
                                value={searchTerm}
                                onChange={e => updatePermSearch(e.target.value)}
                                className="w-full"
                              />
                            </div>
                            <Select value={filterOrigem} onValueChange={updateFilterOrigem}>
                              <SelectTrigger>
                                <SelectValue placeholder="Origem" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ALL">Todas as Origens</SelectItem>
                                <SelectItem value="USUARIO">Usuário</SelectItem>
                                <SelectItem value="GRUPO">Grupo</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={filterAcesso} onValueChange={updateFilterAcesso}>
                              <SelectTrigger>
                                <SelectValue placeholder="Nível de Acesso" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ALL">Todos os Níveis</SelectItem>
                                <SelectItem value="COMPLETO">Com Acesso</SelectItem>
                                <SelectItem value="BLOQUEADO">Bloqueados</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="mt-2">
                            <Button onClick={resetFilters} variant="ghost" size="sm">
                              Limpar Filtros
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>
                            Permissões ({filteredResources.length} de {userPermissions.totalPermissions})
                          </CardTitle>
                          <CardDescription>
                            Lista completa de permissões do usuário, incluindo herança de grupo
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="rounded-md border max-h-[400px] overflow-y-auto">
                            <Table>
                              <TableHeader className="sticky top-0 bg-background">
                                <TableRow>
                                  <TableHead>Origem</TableHead>
                                  <TableHead>Recurso</TableHead>
                                  <TableHead>Descrição</TableHead>
                                  <TableHead>Nível de Acesso</TableHead>
                                  <TableHead>Código</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {loading ? (
                                  <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                      Carregando...
                                    </TableCell>
                                  </TableRow>
                                ) : filteredResources.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                      Nenhuma permissão encontrada com os filtros aplicados
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  filteredResources.map((perm, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          {getOrigemIcon(perm.ORIGEM)}
                                          <Badge variant={perm.ORIGEM === 'USUARIO' ? 'default' : 'secondary'}>
                                            {perm.ORIGEM}
                                          </Badge>
                                        </div>
                                      </TableCell>
                                      <TableCell className="font-mono text-xs max-w-xs truncate">
                                        {perm.SIGLA || perm.IDACESSO}
                                      </TableCell>
                                      <TableCell className="max-w-md">
                                        <div>
                                          <p className="font-medium">{perm.DESCRICAO}</p>
                                          <p className="text-xs text-muted-foreground truncate">
                                            {perm.IDACESSO}
                                          </p>
                                        </div>
                                      </TableCell>
                                      <TableCell>{getAccessBadge(perm.ACESSO)}</TableCell>
                                      <TableCell className="font-mono text-xs">{perm.ACESSO}</TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </React.Fragment>
                  ) : loading ? (
                    <Card>
                      <CardContent className="py-12">
                        <div className="text-center text-muted-foreground">
                          <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-20 animate-spin" />
                          <p>Carregando permissões...</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab: Recursos Disponíveis */}
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Recursos do Sistema
              </CardTitle>
              <CardDescription>
                Lista de todos os recursos disponíveis para controle de acesso ({resources.length} recursos)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Buscar recursos..."
                  value={searchTerm}
                  onChange={e => updatePermSearch(e.target.value)}
                />
              </div>
              <div className="rounded-md border max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead>Sigla</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>ID do Recurso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources
                      .filter(r => {
                        if (!searchTerm.trim()) return true;
                        const term = searchTerm.toLowerCase();
                        return (
                          r.DESCRICAO?.toLowerCase().includes(term) ||
                          r.IDACESSO?.toLowerCase().includes(term) ||
                          r.SIGLA?.toLowerCase().includes(term)
                        );
                      })
                      .map((resource, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-semibold">{resource.SIGLA}</TableCell>
                          <TableCell>{resource.DESCRICAO}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {resource.IDACESSO}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
