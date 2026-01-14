import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

interface ConsumoItem {
  CODPROD: number;
  DESCRPROD: string;
  NUNOTA: number;
  DTNEG: string;
  CODPARC: number;
  NOMEPARC: string;
  QTDNEG: number;
  VLRUNIT: number;
  VLRTOT: number;
  CODLOCALORIG: number;
  NOMELOCALORIG: string;
  CODLOCALDES: number;
  NOMELOCALDES: string;
  CODUSUINC: number;
  NOMEUSU_INC: string;
}

const ProductConsumption: React.FC = () => {
  const [codProd, setCodProd] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [consumoData, setConsumoData] = useState<ConsumoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<{ CODPROD: number; DESCRPROD: string } | null>(null);

  const handleSearch = async () => {
    if (!codProd) {
      setError('Por favor, informe o código do produto');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        codProd: codProd,
      });

      if (startDate) {
        params.append('startDate', startDate.toISOString().split('T')[0]);
      }
      if (endDate) {
        params.append('endDate', endDate.toISOString().split('T')[0]);
      }

      const response = await fetch(`http://localhost:3100/consumo-produto?${params}`);

      if (!response.ok) {
        throw new Error('Erro ao buscar dados de consumo');
      }

      const data = await response.json();
      setConsumoData(data);

      if (data.length > 0) {
        setProductInfo({
          CODPROD: data[0].CODPROD,
          DESCRPROD: data[0].DESCRPROD,
        });
      } else {
        setProductInfo(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setConsumoData([]);
      setProductInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const totalQtd = consumoData.reduce((sum, item) => sum + item.QTDNEG, 0);
    const totalVlr = consumoData.reduce((sum, item) => sum + item.VLRTOT, 0);
    return { totalQtd, totalVlr };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totals = calculateTotals();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Consulta de Consumo por Produto
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Código do Produto"
                value={codProd}
                onChange={(e) => setCodProd(e.target.value)}
                type="number"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Data Inicial"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Data Final"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                sx={{ height: '56px' }}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {productInfo && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Produto Selecionado
              </Typography>
              <Typography variant="body1">
                <strong>Código:</strong> {productInfo.CODPROD}
              </Typography>
              <Typography variant="body1">
                <strong>Descrição:</strong> {productInfo.DESCRPROD}
              </Typography>
            </CardContent>
          </Card>
        )}

        {consumoData.length > 0 && (
          <>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Total de Movimentações
                    </Typography>
                    <Typography variant="h5">
                      {consumoData.length}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Quantidade Total
                    </Typography>
                    <Typography variant="h5">
                      {totals.totalQtd.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Valor Total
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(totals.totalVlr)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Nota</strong></TableCell>
                    <TableCell><strong>Data</strong></TableCell>
                    <TableCell><strong>Parceiro</strong></TableCell>
                    <TableCell align="right"><strong>Quantidade</strong></TableCell>
                    <TableCell align="right"><strong>Vlr. Unit.</strong></TableCell>
                    <TableCell align="right"><strong>Vlr. Total</strong></TableCell>
                    <TableCell><strong>Origem</strong></TableCell>
                    <TableCell><strong>Destino</strong></TableCell>
                    <TableCell><strong>Usuário</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {consumoData.map((item, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{item.NUNOTA}</TableCell>
                      <TableCell>{formatDate(item.DTNEG)}</TableCell>
                      <TableCell>
                        {item.CODPARC} - {item.NOMEPARC}
                      </TableCell>
                      <TableCell align="right">
                        {item.QTDNEG.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.VLRUNIT)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.VLRTOT)}
                      </TableCell>
                      <TableCell>
                        {item.CODLOCALORIG} - {item.NOMELOCALORIG}
                      </TableCell>
                      <TableCell>
                        {item.CODLOCALDES} - {item.NOMELOCALDES}
                      </TableCell>
                      <TableCell>
                        {item.NOMEUSU_INC}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {!loading && consumoData.length === 0 && codProd && (
          <Alert severity="info">
            Nenhum consumo encontrado para este produto no período selecionado.
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default ProductConsumption;
