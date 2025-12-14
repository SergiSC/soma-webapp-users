"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ProductTypeEnum, useProducts } from "@/hooks/api/products";
import { Label } from "@radix-ui/react-label";

interface ChangeSubscriptionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  originalProductId: string;
  selectedProductId: string | undefined;
  onSelectProduct: (productId: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function ChangeSubscriptionModal({
  isOpen,
  onOpenChange,
  originalProductId,
  selectedProductId,
  onSelectProduct,
  onClose,
  onConfirm,
}: ChangeSubscriptionModalProps) {
  const { data: products } = useProducts({
    type: [ProductTypeEnum.SUBSCRIPTION, ProductTypeEnum.SUBSCRIPTION_COMBO],
  });

  const existingProducts = Object.values(products?.items || {}).flat();

  const originalProduct = existingProducts.find(
    (product) => product.id === originalProductId
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="text-start">
          <DialogTitle>Canvi de subscripció</DialogTitle>
        </DialogHeader>
        <div className="border border-gray-200 rounded-md p-2">
          <p className="font-medium">Subscripció actual:</p>
          <p className="text-gray-500">
            {originalProduct?.name} - {originalProduct?.stringifiedPrice}/mes
          </p>
        </div>
        <DialogDescription className="text-start">
          Selecciona la nova subscripció que vols adquirir. S&apos;aplicarà el
          canvi en el moment de la pròxima facturació:
        </DialogDescription>
        <div className="flex flex-col gap-2 text-sm">
          <RadioGroup value={selectedProductId} onValueChange={onSelectProduct}>
            {existingProducts
              .filter((product) => product.id !== originalProductId)
              .map((product) => (
                <div key={product.id} className="flex items-center gap-2 ">
                  <RadioGroupItem
                    value={product.id}
                    id={product.id}
                    className="cursor-pointer"
                  />
                  <Label htmlFor={product.id} className="cursor-pointer">
                    {product.name} - {product.stringifiedPrice}/mes
                  </Label>
                </div>
              ))}
          </RadioGroup>
        </div>
        <DialogFooter className="flex flex-row justify-between">
          <Button onClick={onClose} variant="outline">
            Cancel·lar
          </Button>
          <Button
            onClick={onConfirm}
            variant="default"
            disabled={selectedProductId === undefined}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
