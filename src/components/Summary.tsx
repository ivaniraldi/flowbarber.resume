"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, CreditCard, Wallet } from "lucide-react";

interface SummaryProps {
  summary: {
    total: number;
    efectivo: number;
    online: number;
  };
}

export function Summary({ summary }: SummaryProps) {
  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3">
      <Card className="print-card print-bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.total)}</div>
        </CardContent>
      </Card>
      <Card className="print-card print-bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Efectivo</CardTitle>
          <Banknote className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-400">
            {formatCurrency(summary.efectivo)}
          </div>
        </CardContent>
      </Card>
      <Card className="print-card print-bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pagamento Online</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-400">
            {formatCurrency(summary.online)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
