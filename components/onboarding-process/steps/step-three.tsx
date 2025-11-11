import { Input } from "@/components/ui/input";
import { useOnboardingProcess } from "../context";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface StepThreeProps {
  nextStep: () => void;
  previousStep: () => void;
}

export function StepThree({ nextStep, previousStep }: StepThreeProps) {
  const { handleSetOnboardingData, onboardingData } = useOnboardingProcess();
  const formData = useForm<{
    postalCode: string;
  }>({
    resolver: zodResolver(
      z.object({
        postalCode: z
          .string("El codi postal és un camp obligatori")
          .trim()
          .min(1, "El codi postal no pot estar buit")
          .regex(/^[0-9]{5}$/, "El codi postal ha de tenir 5 dígits"),
      })
    ),
    defaultValues: {
      postalCode: onboardingData.postalCode || "",
    },
  });

  const onSubmit = (data: { postalCode: string }) => {
    console.log(data);
    handleSetOnboardingData("postalCode", data.postalCode);
    nextStep();
  };

  return (
    <Form {...formData}>
      <form
        onSubmit={formData.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={formData.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Codi postal"
                  {...field}
                  autoFocus
                  className=""
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <footer className="flex gap-4 w-full mt-auto md:mt-8">
          <Button
            size="lg"
            variant="outline"
            type="button"
            onClick={previousStep}
          >
            Enrere
          </Button>
          <Button size="lg" className="ml-auto" type="submit">
            Continuar
          </Button>
        </footer>
      </form>
    </Form>
  );
}
