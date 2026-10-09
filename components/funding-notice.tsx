import { cn } from "@/lib/utils";

const fundingLogos = [
  {
    src: "/funding/generalitat-empresa-treball.jpg",
    alt: "Generalitat de Catalunya – Departament d'Empresa i Treball",
  },
  { src: "/funding/ue-cofinancat.jpg", alt: "Cofinançat per la Unió Europea" },
  {
    src: "/funding/sepe.jpg",
    alt: "Ministerio de Trabajo y Economía Social – SEPE",
  },
  {
    src: "/funding/garantia-juvenil.jpg",
    alt: "Sistema Nacional de Garantía Juvenil",
  },
];

export function FundingNotice({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <p className="max-w-xl text-center text-xs leading-relaxed text-muted-foreground">
        Aquesta actuació està impulsada i subvencionada pel Departament
        d&apos;Empresa i Treball i cofinançada per la Unió Europea mitjançant
        el Fons Social Europeu Plus.
      </p>
      <div className="grid grid-cols-2 items-center justify-items-center gap-x-6 gap-y-4 md:flex md:flex-wrap md:justify-center md:gap-x-8">
        {fundingLogos.map((logo) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={logo.src}
            src={logo.src}
            alt={logo.alt}
            className="h-7 w-auto max-w-full mix-blend-multiply grayscale md:h-9"
          />
        ))}
      </div>
    </div>
  );
}
