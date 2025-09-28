
"use client";
import { useState, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useServices } from '@/hooks/use-services';
import type { Service } from '@/lib/types';
import { subDays, format, parseISO, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Header } from '@/components/Header';
import { Banknote, CreditCard, Wallet, Scissors } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type RangeKey = '7' | '15' | '30';

export default function AnalyticsPage() {
  const { services: allServices, isLoaded } = useServices();
  const [range, setRange] = useState<RangeKey>('7');

  const { services, startDate, endDate } = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (range) {
      case '15':
        start = subDays(now, 14);
        break;
      case '30':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case '7':
      default:
        start = startOfWeek(now, { locale: ptBR });
        end = endOfWeek(now, { locale: ptBR });
        break;
    }
    
    const filtered = allServices.filter((service) =>
      service.date && isWithinInterval(parseISO(service.date), { start, end })
    );

    return { services: filtered, startDate: start, endDate: end };
  }, [allServices, range]);

  const summary = useMemo(() => {
    return services.reduce(
      (acc, service) => {
        acc.total += service.price;
        if (service.paymentMethod === 'dinheiro') {
          acc.dinheiro += service.price;
        } else {
          acc.online += service.price;
        }
        acc.count += 1;
        return acc;
      },
      { total: 0, dinheiro: 0, online: 0, count: 0 }
    );
  }, [services]);

  const chartData = useMemo(() => {
    const dataByDay: { [key: string]: { total: number; count: number } } = {};

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const key = format(d, 'yyyy-MM-dd');
        dataByDay[key] = { total: 0, count: 0 };
    }

    services.forEach((service) => {
      const day = format(parseISO(service.date), 'yyyy-MM-dd');
      if (dataByDay[day]) {
        dataByDay[day].total += service.price;
        dataByDay[day].count += 1;
      }
    });

    return Object.entries(dataByDay).map(([date, values]) => ({
      date: format(parseISO(date), 'dd/MM'),
      total: values.total,
      serviços: values.count,
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [services, startDate, endDate]);

   if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <Header title="FlowBarber" showAnalyticsButton/>
        <main className="max-w-7xl mx-auto space-y-6 mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

  const dateRangeLabel = `${format(startDate, 'd MMM', { locale: ptBR })} - ${format(endDate, 'd MMM, yyyy', { locale: ptBR })}`;

  return (
    <div className="min-h-screen text-foreground">
      <Header title="FlowBarber" showAnalyticsButton />
      <main className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
           <div>
            <h2 className="text-2xl font-bold tracking-tight">Painel de Análises</h2>
            <p className="text-muted-foreground">{dateRangeLabel}</p>
          </div>
          <Select onValueChange={(value: RangeKey) => setRange(value)} defaultValue={range}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Esta Semana</SelectItem>
              <SelectItem value="15">Últimos 15 dias</SelectItem>
              <SelectItem value="30">Este Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.total)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dinheiro</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{formatCurrency(summary.dinheiro)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagamento Online</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{formatCurrency(summary.online)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serviços Realizados</CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.count}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>Receita e número de serviços realizados no período.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                  formatter={(value, name) => {
                    if (name === 'total') {
                        return [formatCurrency(value as number), 'Receita'];
                    }
                    return [value, 'Serviços'];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="total" name="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="serviços" name="Serviços" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
