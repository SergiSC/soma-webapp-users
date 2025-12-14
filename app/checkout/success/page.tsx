import { CustomLink } from "@/components/link";
import { PageSkeleton } from "@/components/page-skeleton";

export default function CheckoutSuccessPage() {
  return (
    <PageSkeleton
      title="Compra realitzada correctament"
      sections={[
        {
          content: (
            <div>
              <p>
                Gràcies per la teva compra. Ara pots utilitzar el teu producte.
              </p>
              <CustomLink to="/">Tornar a la pàgina principal</CustomLink>
            </div>
          ),
        },
      ]}
    />
  );
}
