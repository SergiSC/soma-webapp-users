import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Product, ProductTypeEnum } from "@/hooks/api/products";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";

const labels: Record<ProductTypeEnum, string[]> = {
  [ProductTypeEnum.SUBSCRIPTION]: [
    "Subscripció Mensual. L'inici de la subscripció serà el dia de la compra.",
    "Totes les classes tenen una durada de 50 minuts.",
    "En cas que es vulgui cancel·lar la subscripció, caldrà fer-ho com a mínim de 10 dies abans del pròxim pagament.",
  ],
  [ProductTypeEnum.PACK]: [
    "Pack de Classe(s). Les classes incloses es podran utilitzar quan vulguis.",
    "Totes les classes tenen una durada de 50 minuts.",
    "Un cop abonat el pack, no es retornaran els diners.",
  ],
  [ProductTypeEnum.SUBSCRIPTION_COMBO]: [
    "Subscripció Premium. L'inici de la subscripció serà el dia de la compra.",
    "Totes les classes tenen una durada de 50 minuts.",
    "En cas que es vulgui cancel·lar la subscripció, caldrà fer-ho com a mínim de 10 dies abans del pròxim pagament.",
  ],
};

interface PurchaseOrRejectproductDialogProps {
  product: Product;
  url: string;
  onReject: () => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
}
// Accept or reject reservation dialog
export function PurchaseOrRejectproductDialog({
  product,
  url,
  onReject,
  isDialogOpen,
  setIsDialogOpen,
}: PurchaseOrRejectproductDialogProps) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Informació important</DialogTitle>
          <DialogDescription>
            Informació rellevant sobre la compra del producte
          </DialogDescription>
        </DialogHeader>
        <ul>
          {labels[product.recurring.type].map((label, index) => (
            <li className="text-sm text-muted-foreground" key={index}>
              {label}
            </li>
          ))}
        </ul>
        <div className="flex gap-2 w-full justify-between">
          <Button variant="outline" onClick={onReject}>
            Rebutar
          </Button>
          <Button
            onClick={() => {
              window.open(url + "?locale=es", "_blank");
              setIsDialogOpen(false);
            }}
          >
            Comprar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
