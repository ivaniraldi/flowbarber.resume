"use client";

import type { Service } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Banknote, CreditCard, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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


interface ServiceListProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
}

export function ServiceList({ services, onEdit, onDelete }: ServiceListProps) {
  return (
    <div className="space-y-3 no-print">
      <h2 className="text-xl font-headline">Serviços do Dia</h2>
      {services.map((service) => (
        <Card
          key={service.id}
          className="flex items-center justify-between p-4 transition-all hover:bg-card/80"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-muted rounded-full">
              {service.paymentMethod === 'dinheiro' ? 
                <Banknote className="h-5 w-5 text-green-400" /> : 
                <CreditCard className="h-5 w-5 text-blue-400" />
              }
            </div>
            <div>
              <p className="font-semibold">{service.name}</p>
              <p className="text-sm text-muted-foreground capitalize">
                {service.paymentMethod}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-lg">
              R${" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-amber-300">
                {service.price.toFixed(2)}
              </span>
            </p>
            <AlertDialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onEdit(service)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Deletar
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deletar serviço?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você tem certeza que quer deletar o serviço "{service.name}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(service.id)}>Deletar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      ))}
    </div>
  );
}
