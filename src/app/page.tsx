"use client";

import { useState, useMemo, useCallback } from "react";
import type { Service } from "@/lib/types";
import { useServices } from "@/hooks/use-services";
import { AddServiceSheet } from "@/components/AddServiceSheet";
import { ServiceList } from "@/components/ServiceList";
import { Summary } from "@/components/Summary";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, RefreshCw, Scissors, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


export default function Home() {
  const {
    services,
    addService,
    updateService,
    deleteService,
    clearServices,
    isLoaded,
  } = useServices();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | undefined>(
    undefined
  );

  const summary = useMemo(() => {
    return services.reduce(
      (acc, service) => {
        acc.total += service.price;
        if (service.paymentMethod === "efectivo") {
          acc.efectivo += service.price;
        } else {
          acc.online += service.price;
        }
        return acc;
      },
      { total: 0, efectivo: 0, online: 0 }
    );
  }, [services]);

  const handleAddClick = () => {
    setServiceToEdit(undefined);
    setIsSheetOpen(true);
  };

  const handleEditClick = (service: Service) => {
    setServiceToEdit(service);
    setIsSheetOpen(true);
  };

  const handleSaveService = (service: Service) => {
    if (serviceToEdit) {
      updateService(service.id, service);
    } else {
      addService(service);
    }
    setIsSheetOpen(false);
  };

  const handleShare = useCallback(() => {
    const date = new Date().toLocaleDateString("pt-BR");
    const reportText = `
*Resumo do Dia - ${date}*

*Total Geral: R$${summary.total.toFixed(2).replace(".", ",")}*
-----------------------------------
*Detalhes:*
- Efetivo: R$${summary.efectivo.toFixed(2).replace(".", ",")}
- Pagamento Online: R$${summary.online.toFixed(2).replace(".", ",")}

*Serviços Realizados: ${services.length}*
${services
  .map(
    (s) => `- ${s.name}: R$${s.price.toFixed(2).replace(".", ",")} (${s.paymentMethod})`
  )
  .join("\n")}
    `.trim();

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      reportText
    )}`;
    window.open(whatsappUrl, "_blank");
  }, [services, summary]);

  const handleSharePdf = useCallback(async () => {
    const reportElement = document.getElementById('report-content');
    if (!reportElement) return;

    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    const pdfBlob = pdf.blob;
    
    const date = new Date().toISOString().split('T')[0];
    const fileName = `resumo-flowbarber-${date}.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Resumo FlowBarber ${date}`,
          text: 'Aqui está o resumo do dia.',
        });
        return;
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
    
    // Fallback to download
    pdf.save(fileName);

  }, [services]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <div id="print-area">
        <div className="print-only p-8 fixed -left-[9999px] top-0 bg-background" id="report-content">
            <h1 className="text-3xl font-headline text-center mb-2">FlowBarber</h1>
            <p className="text-center text-muted-foreground mb-6">{new Date().toLocaleString('pt-BR')}</p>
            <Summary summary={summary} />
            <div className="mt-6">
              <h2 className="text-xl font-headline mb-4">Serviços</h2>
              <div className="border rounded-lg print-bg-card">
              {services.map((service, index) => (
                <div key={service.id} className={`flex justify-between items-center p-4 ${index < services.length - 1 ? 'border-b' : ''}`}>
                  <div>
                    <p className="font-bold">{service.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{service.paymentMethod}</p>
                  </div>
                  <p className="font-bold">R$ {service.price.toFixed(2)}</p>
                </div>
              ))}
              </div>
            </div>
        </div>

        <div className="min-h-screen text-foreground">
          <Header title="FlowBarber">
            <div className="flex items-center gap-2 no-print">
              <Button variant="ghost" size="icon" onClick={handleShare} disabled={services.length === 0}>
                <WhatsAppIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSharePdf} disabled={services.length === 0}>
                <FileText className="h-5 w-5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon" disabled={services.length === 0}>
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso limpará permanentemente todos os serviços da sua lista.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={clearServices}>
                      Limpar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Header>
          <main className="p-4 md:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
            <p className="text-muted-foreground text-center capitalize">{today}</p>
            <Summary summary={summary} />

            {services.length > 0 ? (
              <ServiceList
                services={services}
                onEdit={handleEditClick}
                onDelete={deleteService}
              />
            ) : (
              <Alert className="border-dashed">
                 <Scissors className="h-4 w-4" />
                <AlertTitle>Nenhum serviço adicionado!</AlertTitle>
                <AlertDescription>
                  Clique no botão '+' para adicionar o primeiro serviço do dia.
                </AlertDescription>
              </Alert>
            )}
          </main>
          <div className="fixed bottom-6 right-6 no-print">
            <Button
              size="icon"
              className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
              onClick={handleAddClick}
            >
              <Plus className="h-8 w-8" />
            </Button>
          </div>

          <AddServiceSheet
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            onSave={handleSaveService}
            serviceToEdit={serviceToEdit}
          />
        </div>
      </div>
    </>
  );
}
