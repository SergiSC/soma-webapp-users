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
import { DatePicker } from "@/components/date-picker";

interface StepTwoProps {
  nextStep: () => void;
  previousStep: () => void;
}

export function StepTwo({ nextStep, previousStep }: StepTwoProps) {
  const { handleSetOnboardingData } = useOnboardingProcess();
  const min16YearsAgo = new Date(
    new Date().setFullYear(new Date().getFullYear() - 16)
  );
  const formData = useForm<{
    birthdayDate: Date;
  }>({
    resolver: zodResolver(
      z.object({
        birthdayDate: z
          .date("La data de naixement és un camp obligatori")
          .max(min16YearsAgo, "Has de tenir almenys 16 anys"),
      })
    ),
  });

  const onSubmit = (data: { birthdayDate: Date }) => {
    console.log(data);
    handleSetOnboardingData("birthdayDate", data.birthdayDate);
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
          name="birthdayDate"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker
                  date={field.value}
                  setDate={field.onChange}
                  placeholder="Data de naixement"
                  maxDate={min16YearsAgo}
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
