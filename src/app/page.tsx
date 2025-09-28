
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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


export default function Home() {
  const {
    services: allServices,
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

  const services = useMemo(() => {
    return allServices.filter(s => new Date(s.date).toDateString() === new Date().toDateString())
  }, [allServices]);

  const summary = useMemo(() => {
    return services.reduce(
      (acc, service) => {
        acc.total += service.price;
        if (service.paymentMethod === "dinheiro") {
          acc.dinheiro += service.price;
        } else {
          acc.online += service.price;
        }
        return acc;
      },
      { total: 0, dinheiro: 0, online: 0 }
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

  const handleSaveService = (serviceData: Omit<Service, 'id'>) => {
    if (serviceToEdit) {
      updateService(serviceToEdit.id, serviceData);
    } else {
      addService(serviceData);
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
- Dinheiro: R$${summary.dinheiro.toFixed(2).replace(".", ",")}
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
    const pdf = new jsPDF();
    const date = new Date();
    const formattedDate = date.toLocaleDateString('pt-BR');
    const formattedTime = date.toLocaleTimeString('pt-BR');

    // Header
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text("FlowBarber", 105, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Resumo do Dia - ${formattedDate} ${formattedTime}`, 105, 30, { align: 'center' });

    // Summary
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Resumo Financeiro", 14, 50);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Geral: R$ ${summary.total.toFixed(2).replace('.', ',')}`, 14, 60);
    pdf.text(`Dinheiro: R$ ${summary.dinheiro.toFixed(2).replace('.', ',')}`, 14, 70);
    pdf.text(`Pagamento Online: R$ ${summary.online.toFixed(2).replace('.', ',')}`, 14, 80);

    // Services List
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Serviços Realizados", 14, 100);
    
    let yPos = 110;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Serviço", 14, yPos);
    pdf.text("Método", 120, yPos);
    pdf.text("Preço", 180, yPos, {align: 'right'});
    pdf.line(14, yPos + 2, 196, yPos + 2); // horizontal line
    yPos += 8;

    pdf.setFont('helvetica', 'normal');
    services.forEach(service => {
        if (yPos > 280) { // Add new page if content overflows
            pdf.addPage();
            yPos = 20;
        }
        pdf.text(service.name, 14, yPos, { maxWidth: 100 });
        pdf.text(service.paymentMethod, 120, yPos);
        pdf.text(`R$ ${service.price.toFixed(2).replace('.', ',')}`, 196, yPos, { align: 'right' });
        yPos += 7;
    });

    const pdfBlob = pdf.blob;
    
    const fileName = `resumo-flowbarber-${date.toISOString().split('T')[0]}.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Resumo FlowBarber ${formattedDate}`,
          text: 'Aqui está o resumo do dia.',
        });
        return;
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
    
    // Fallback to download
    pdf.save(fileName);

  }, [services, summary]);

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
        <div className="min-h-screen text-foreground pb-24">
          <Header title="FlowBarber" showAnalyticsButton>
            <div className="flex items-center gap-2 no-print">
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
                      Esta ação não pode ser desfeita. Isso limpará permanentemente todos os serviços de hoje da sua lista.
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
            <div className="flex justify-center gap-2 no-print">
              <Button variant="outline" size="sm" onClick={handleShare} disabled={services.length === 0}>
                <WhatsAppIcon className="h-4 w-4" />
                <span className="ml-2">Enviar Resumo</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSharePdf} disabled={services.length === 0}>
                <FileText className="h-4 w-4" />
                <span className="ml-2">Baixar PDF</span>
              </Button>
            </div>
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
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 no-print">
            <Button
              size="icon"
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
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

    