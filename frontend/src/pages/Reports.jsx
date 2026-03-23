import { useMemo, useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';
import {
  Download,
  Filter,
  Calendar,
  Users,
  UtensilsCrossed,
  Leaf,
  FileText,
  Printer,
  TrendingUp,
  TrendingDown,
  Minus,
  Search
} from 'lucide-react';
import { format, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { useReports } from '../contexts/MealReportContext';

const VALOR_UNITARIO = 18.5;

const typeLabels = {
  employee: 'Funcionário',
  doctor: 'Médico',
  student: 'Estudante',
};

const statusBadgeClass = (status) => {
  if (status === 'DELIVERED') return 'bg-emerald-600';
  if (status === 'PENDING') return 'border-amber-400 text-amber-700';
  return '';
};

const statusBadgeVariant = (status) => {
  if (status === 'DELIVERED') return 'default';
  if (status === 'CANCELLED') return 'destructive';
  return 'outline';
};


const formatCurrency = (value) => Number(value || 0).toFixed(2);

const getMonthOptions = () => {
  const now = new Date();

  return [0, 1, 2].map((offset) => {
    const date = subMonths(now, offset);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy', { locale: ptBR })
    };
  });
};

export default function Reports() {
  const {
    todayMeals,
    reversedDaily,
    monthlyReport,
    dietStats,
    sectorStats,
    summary,
    selectedMonth,
    setSelectedMonth,
    selectedCollaboratorType,
    setSelectedCollaboratorType,
    extractSearch,
    setExtractSearch,
    loadingMonthly,
    statusLabels,
    loading,
    error
  } = useReports();

  const [selectedDiet, setSelectedDiet] = useState('all');
  const [selectedSector, setSelectedSector] = useState("ALL");

  const filteredMeals = useMemo(() => {
    return todayMeals.filter((meal) => {
      if (selectedDiet !== 'all' && meal.dietType !== selectedDiet) return false;
      if (selectedSector !== 'all' && meal.sector !== selectedSector) return false;
      return true;
    });
  }, [todayMeals, selectedDiet, selectedSector]);

    const sectorOptions = useMemo(() => {
      const sectors = [...new Set(sectorStats.map((item) => item.sector).filter(Boolean))];

      return [
        { value: "ALL", label: "Todos os setores" },
        ...sectors
          .sort((a, b) => a.localeCompare(b))
          .map((sector) => ({
            value: sector,
            label: sector,
          })),
      ];
    }, [sectorStats]);

    const filteredSectorStats = useMemo(() => {
      if (selectedSector === "ALL") return sectorStats;
      return sectorStats.filter((item) => item.sector === selectedSector);
    }, [sectorStats, selectedSector]);

    const filteredSectorMeals = useMemo(() => {
      if (selectedSector === "ALL") return filteredMeals;
      return filteredMeals.filter((meal) => meal.sector === selectedSector);
    }, [filteredMeals, selectedSector]);


  const monthOptions = useMemo(() => getMonthOptions(), []);

  const availableDiets = useMemo(() => {
    const unique = new Set();

    todayMeals.forEach((meal) => {
      if (meal.dietType && meal.dietType !== '-') {
        unique.add(meal.dietType);
      }
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [todayMeals]);

  const availableSectors = useMemo(() => {
    const unique = new Set();

    todayMeals.forEach((meal) => {
      if (meal.sector && meal.sector !== '-') {
        unique.add(meal.sector);
      }
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [todayMeals]);



  const monthSummary = useMemo(() => {
    const totalLunches = reversedDaily.reduce((sum, day) => sum + Number(day.almoco || 0), 0);
    const totalDinners = reversedDaily.reduce((sum, day) => sum + Number(day.jantar || 0), 0);
    const totalMeals = reversedDaily.reduce((sum, day) => sum + Number(day.total || 0), 0);

    const avgDay = reversedDaily.length > 0
      ? Math.round(totalMeals / reversedDaily.length)
      : 0;

    const bestDay = reversedDaily.length > 0
      ? reversedDaily.reduce((best, current) =>
          Number(current.total || 0) > Number(best.total || 0) ? current : best
        )
      : null;

    const worstDay = reversedDaily.length > 0
      ? reversedDaily.reduce((worst, current) =>
          Number(current.total || 0) < Number(worst.total || 0) ? current : worst
        )
      : null;

    return {
      totalLunches,
      totalDinners,
      totalMeals,
      avgDay,
      bestDay,
      worstDay
    };
  }, [reversedDaily]);

  const collaboratorData = useMemo(() => {
    return monthlyReport.map((item) => {
      const totalMeals = Number(item.total || 0);
      const valorTotal = Number(item.amount || 0);
  
      return {
        id: `${item.identifier}-${item.sector_name}-${item.type}`,
        name: item.name || "-",
        type: item.type || "-",
        matricula: item.identifier || "-",
        sector: item.sector_name || "-",
        lunches: Number(item.lunches || 0),
        dinners: Number(item.dinners || 0),
        totalMeals,
        valorUnitario: totalMeals > 0 ? valorTotal / totalMeals : 0,
        valorTotal,
      };
    });
  }, [monthlyReport]);

  const handlePrint = () => window.print();

    const handleExportCollaboratorExcel = () => {
      if (!Array.isArray(monthlyReport) || monthlyReport.length === 0) return;
    
      const wb = XLSX.utils.book_new();
    
      const selectedMonthLabel =
        monthOptions.find((item) => item.value === selectedMonth)?.label || selectedMonth;
    
      const rows = [
        ["NutriGestão - Relatório por Colaborador"],
        [`Período: ${selectedMonthLabel}`],
        [`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`],
        [],
        ["#", "Nome", "Tipo", "Matrícula", "Setor", "Almoços", "Jantares", "Total Ref.", "Vlr. Médio (R$)", "Vlr. Total (R$)"],
      ];
    
      [...monthlyReport]
        .sort((a, b) => Number(b.total || 0) - Number(a.total || 0))
        .forEach((c, idx) => {
          const total = Number(c.total || 0);
          const amount = Number(c.amount || 0);
          const avgValue = total > 0 ? amount / total : 0;
    
          rows.push([
            idx + 1,
            c.name || "-",
            typeLabels[c.type] || c.type || "-",
            c.identifier || "-",
            c.sector_name || "-",
            Number(c.lunches || 0),
            Number(c.dinners || 0),
            total,
            Number(avgValue.toFixed(2)),
            Number(amount.toFixed(2)),
          ]);
        });
    
      const totalLunches = monthlyReport.reduce((s, c) => s + Number(c.lunches || 0), 0);
      const totalDinners = monthlyReport.reduce((s, c) => s + Number(c.dinners || 0), 0);
      const totalMeals = monthlyReport.reduce((s, c) => s + Number(c.total || 0), 0);
      const totalValor = monthlyReport.reduce((s, c) => s + Number(c.amount || 0), 0);
      const valorMedioGeral = totalMeals > 0 ? totalValor / totalMeals : 0;
    
      rows.push([]);
      rows.push([
        "",
        "TOTAIS",
        "",
        "",
        "",
        totalLunches,
        totalDinners,
        totalMeals,
        Number(valorMedioGeral.toFixed(2)),
        Number(totalValor.toFixed(2)),
      ]);
    
      const ws = XLSX.utils.aoa_to_sheet(rows);
    
      ws["!cols"] = [
        { wch: 5 },
        { wch: 30 },
        { wch: 14 },
        { wch: 16 },
        { wch: 18 },
        { wch: 10 },
        { wch: 10 },
        { wch: 12 },
        { wch: 16 },
        { wch: 16 },
      ];
    
      ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }];
    
      XLSX.utils.book_append_sheet(wb, ws, "Por Colaborador");
      XLSX.writeFile(wb, `relatorio-colaboradores-${selectedMonth}.xlsx`);
    };

  const handleExportExtractExcel = () => {
    const query = extractSearch.toLowerCase().trim();
    if (!query) return;
  
    if (!Array.isArray(monthlyReport) || monthlyReport.length === 0) return;
  
    const wb = XLSX.utils.book_new();
  
    const rows = [
      ["NutriGestão - Extrato de Pedidos por Colaborador"],
      [`Pesquisa: "${extractSearch}"`],
      [`Mês: ${selectedMonth}`],
      [`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`],
      [],
      ["#", "Colaborador", "Matrícula", "Setor", "Almoços", "Jantares", "Total", "Valor (R$)"],
    ];
  
    monthlyReport.forEach((item, idx) => {
      rows.push([
        idx + 1,
        item.name || "-",
        item.identifier || "-",
        item.sector_name || "-",
        Number(item.lunches || 0),
        Number(item.dinners || 0),
        Number(item.total || 0),
        Number(item.amount || 0),
      ]);
    });
  
    const totalMeals = monthlyReport.reduce(
      (acc, item) => acc + Number(item.total || 0),
      0
    );
  
    const totalAmount = monthlyReport.reduce(
      (acc, item) => acc + Number(item.amount || 0),
      0
    );
  
    rows.push([]);
    rows.push([
      "",
      "",
      "",
      "Totais",
      monthlyReport.reduce((acc, item) => acc + Number(item.lunches || 0), 0),
      monthlyReport.reduce((acc, item) => acc + Number(item.dinners || 0), 0),
      totalMeals,
      totalAmount,
    ]);
  
    const ws = XLSX.utils.aoa_to_sheet(rows);
  
    ws["!cols"] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 16 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 14 },
    ];
  
    XLSX.utils.book_append_sheet(wb, ws, "Extrato");
  
    XLSX.writeFile(
      wb,
      `extrato_colaborador_${extractSearch.trim().replace(/\s+/g, "_")}_${selectedMonth}.xlsx`
    );
  };

  return (
    <MainLayout title="Relatórios">
      <div className="space-y-6">

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5" />
              Resumo do Dia — {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="border rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-primary">{summary.todayTotal}</p>
                <p className="text-sm text-muted-foreground">Total de Refeições</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-emerald-600">{summary.todayDelivered}</p>
                <p className="text-sm text-muted-foreground">Entregues</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-amber-600">{summary.todayPending}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-destructive">{summary.todayCancelled}</p>
                <p className="text-sm text-muted-foreground">Canceladas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              Carregando relatórios...
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardContent className="py-6 text-sm text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="extract" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="extract">Extrato Colaborador</TabsTrigger>
            <TabsTrigger value="daily">Diário</TabsTrigger>
            <TabsTrigger value="diet">Por Dieta</TabsTrigger>
            <TabsTrigger value="collaborator">Por Colaborador</TabsTrigger>
            <TabsTrigger value="sector">Por Setor</TabsTrigger>
          </TabsList>

          <TabsContent value="extract" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Extrato de Pedidos por Colaborador
                    </CardTitle>
                    <CardDescription>
                      Pesquise pelo nome ou matrícula do colaborador
                    </CardDescription>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportExtractExcel}
                    disabled={!extractSearch.trim()}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Excel
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou matrícula..."
                    value={extractSearch}
                    onChange={(e) => setExtractSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {!extractSearch.trim() ? (
                  <div className="text-center text-muted-foreground py-12">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">Digite o nome ou matrícula</p>
                    <p className="text-sm">
                      para visualizar o extrato mensal do colaborador
                    </p>
                  </div>
                ) : loadingMonthly ? (
                  <div className="text-center text-muted-foreground py-8">
                    Carregando extrato...
                  </div>
                ) : monthlyReport.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhum registro encontrado para "{extractSearch}".
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Colaborador</TableHead>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Setor</TableHead>
                        <TableHead className="text-center">Almoços</TableHead>
                        <TableHead className="text-center">Jantares</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-right">Valor (R$)</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {monthlyReport.map((item) => (
                        <TableRow key={`${item.identifier}-${item.sector_name}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{item.name}</span>
                            </div>
                          </TableCell>

                          <TableCell>{item.identifier || "-"}</TableCell>
                          <TableCell>{item.sector_name || "-"}</TableCell>
                          <TableCell className="text-center">{item.lunches}</TableCell>
                          <TableCell className="text-center">{item.dinners}</TableCell>
                          <TableCell className="text-center font-medium">{item.total}</TableCell>
                          <TableCell className="text-right font-medium">
                            {Number(item.amount || 0).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Evolução Diária — {monthOptions.find((m) => m.value === selectedMonth)?.label || selectedMonth}
                </CardTitle>
                <CardDescription>Detalhamento dia a dia de refeições servidas</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Dia</TableHead>
                      <TableHead className="text-center">Almoço</TableHead>
                      <TableHead className="text-center">Jantar</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Variação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reversedDaily.map((day, idx, arr) => {
                      const prev = arr[idx + 1];
                      const diff = prev ? Number(day.total || 0) - Number(prev.total || 0) : 0;

                      return (
                        <TableRow key={String(day.fullDate)}>
                          <TableCell className="font-medium">{day.date}</TableCell>
                          <TableCell className="text-muted-foreground capitalize"> {format(new Date(day.fullDate), 'EEEE', { locale: ptBR })}</TableCell>
                          <TableCell className="text-center">{day.almoco}</TableCell>
                          <TableCell className="text-center">{day.jantar}</TableCell>
                          <TableCell className="text-center font-semibold">{day.total}</TableCell>
                          <TableCell className="text-center">
                            {diff > 0 ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 text-sm">
                                <TrendingUp className="w-3.5 h-3.5" /> +{diff}
                              </span>
                            ) : diff < 0 ? (
                              <span className="inline-flex items-center gap-1 text-destructive text-sm">
                                <TrendingDown className="w-3.5 h-3.5" /> {diff}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
                                <Minus className="w-3.5 h-3.5" /> 0
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={2} className="font-semibold">Total do Mês</TableCell>
                      <TableCell className="text-center font-semibold">{monthSummary.totalLunches}</TableCell>
                      <TableCell className="text-center font-semibold">{monthSummary.totalDinners}</TableCell>
                      <TableCell className="text-center font-bold">{monthSummary.totalMeals}</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diet" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5" />
                  Distribuição por Tipo de Dieta
                </CardTitle>
                <CardDescription>Quantidade de refeições por tipo de dieta hoje</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo de Dieta</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead className="text-center">Percentual</TableHead>
                      <TableHead>Barra</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dietStats.map((diet) => (
                      <TableRow key={diet.name}>
                        <TableCell className="font-medium">{diet.name}</TableCell>
                        <TableCell className="text-center font-semibold">{diet.value}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{diet.percentage}%</Badge>
                        </TableCell>
                        <TableCell className="w-[200px]">
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                              className="bg-primary rounded-full h-2.5 transition-all"
                              style={{ width: `${Math.min(Number(diet.percentage), 100)}%` }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-semibold">Total</TableCell>
                      <TableCell className="text-center font-bold">
                        {dietStats.reduce((sum, item) => sum + Number(item.value || 0), 0)}
                      </TableCell>
                      <TableCell className="text-center font-semibold">100%</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhamento por Dieta — Colaboradores</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dieta</TableHead>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Setor</TableHead>
                      <TableHead>Refeição</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMeals.map((meal) => (
                      <TableRow key={meal.id}>
                        <TableCell>
                          <Badge variant="secondary">{meal.dietType}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{meal.collaboratorName}</TableCell>
                        <TableCell>{meal.matricula || '-'}</TableCell>
                        <TableCell>{meal.sector}</TableCell>
                        <TableCell>{meal.mealTypeDisplay}</TableCell>
                        <TableCell>
                          <Badge
                            variant={statusBadgeVariant(meal.status)}
                            className={statusBadgeClass(meal.status)}
                          >
                            {meal.statusDisplay || statusLabels[meal.status] || meal.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaborator" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Relatório por Colaborador
                    </CardTitle>
                    <CardDescription>
                      Consumo individual de refeições filtrado por mês
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Selecione o mês" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedCollaboratorType}
                      onValueChange={setSelectedCollaboratorType}
                    >
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Colaborador" />
                      </SelectTrigger>

                      <SelectContent className="bg-popover text-popover-foreground border shadow-md z-50">
                        <SelectItem value="ALL">Todos os tipos</SelectItem>
                        <SelectItem value="employee">Funcionários</SelectItem>
                        <SelectItem value="doctor">Médicos</SelectItem>
                        <SelectItem value="student">Acadêmicos</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={handleExportCollaboratorExcel}>
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {loadingMonthly ? (
                  <div className="text-center text-muted-foreground py-8">
                    Carregando relatório...
                  </div>
                ) : collaboratorData.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhum registro encontrado para os filtros selecionados.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Setor</TableHead>
                        <TableHead className="text-center">Almoços</TableHead>
                        <TableHead className="text-center">Jantares</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-right">Vlr. Unit.</TableHead>
                        <TableHead className="text-right">Vlr. Total</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {[...collaboratorData]
                        .sort((a, b) => b.totalMeals - a.totalMeals)
                        .map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{typeLabels[c.type] || c.type}</Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{c.matricula}</TableCell>
                            <TableCell>{c.sector}</TableCell>
                            <TableCell className="text-center">{c.lunches}</TableCell>
                            <TableCell className="text-center">{c.dinners}</TableCell>
                            <TableCell className="text-center font-semibold">{c.totalMeals}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              R$ {formatCurrency(c.valorUnitario)}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              R$ {formatCurrency(c.valorTotal)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>

                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={4} className="font-semibold">Totais</TableCell>
                        <TableCell className="text-center font-semibold">
                          {collaboratorData.reduce((s, c) => s + c.lunches, 0)}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {collaboratorData.reduce((s, c) => s + c.dinners, 0)}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {collaboratorData.reduce((s, c) => s + c.totalMeals, 0)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">—</TableCell>
                        <TableCell className="text-right font-bold">
                          R$ {formatCurrency(collaboratorData.reduce((s, c) => s + c.valorTotal, 0))}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sector" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Relatório por Setor
                    </CardTitle>
                    <CardDescription>
                      Resumo de refeições agrupadas por setor
                    </CardDescription>
                  </div>
                  <Select
                    value={selectedSector}
                    onChange={setSelectedSector}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm md:w-[220px]"
                  > 
                    <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Selecione o setor" />
                    </SelectTrigger>
                    <SelectContent>
                    {sectorOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Setor</TableHead>
                      <TableHead className="text-center">Pendentes</TableHead>
                      <TableHead className="text-center">Entregues</TableHead>
                      <TableHead className="text-center">Canceladas</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">% do Total</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredSectorStats.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nenhum dado encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSectorStats.map((s) => (
                        <TableRow key={s.sector}>
                          <TableCell className="font-medium">{s.sector}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
                              {s.pending}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                              {s.delivered}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50">
                              {s.cancelled}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-semibold">{s.total}</TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {selectedSector === "ALL" ? `${s.percentage}%` : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>

                  {filteredSectorStats.length > 0 && (
                    <TableFooter>
                      <TableRow>
                        <TableCell className="font-semibold">Total Geral</TableCell>
                        <TableCell className="text-center font-semibold">
                          {filteredSectorStats.reduce((s, r) => s + Number(r.pending || 0), 0)}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {filteredSectorStats.reduce((s, r) => s + Number(r.delivered || 0), 0)}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {filteredSectorStats.reduce((s, r) => s + Number(r.cancelled || 0), 0)}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {filteredSectorStats.reduce((s, r) => s + Number(r.total || 0), 0)}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {selectedSector === "ALL" ? "100%" : "—"}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhamento — Refeições por Setor</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {filteredSectorStats.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhum detalhamento encontrado.
                  </div>
                ) : (
                  filteredSectorStats.map((s) => {
                    const meals = filteredSectorMeals.filter((m) => m.sector === s.sector);

                    return (
                      <div key={s.sector}>
                        <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                          {s.sector}
                          <Badge variant="secondary">{s.total} refeições</Badge>
                        </h3>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Colaborador</TableHead>
                              <TableHead>Matrícula</TableHead>
                              <TableHead>Refeição</TableHead>
                              <TableHead>Dieta</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {meals.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                                  Nenhuma refeição encontrada para este setor.
                                </TableCell>
                              </TableRow>
                            ) : (
                              meals.map((meal) => (
                                <TableRow key={meal.id}>
                                  <TableCell className="font-medium">{meal.collaboratorName}</TableCell>
                                  <TableCell className="font-mono text-sm">
                                    {meal.matricula || "-"}
                                  </TableCell>
                                  <TableCell>{meal.mealTypeDisplay}</TableCell>
                                  <TableCell>{meal.dietType}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={statusBadgeVariant(meal.status)}
                                      className={statusBadgeClass(meal.status)}
                                    >
                                      {meal.statusDisplay || statusLabels[meal.status] || meal.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}