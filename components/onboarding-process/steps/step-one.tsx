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

interface StepOneProps {
  nextStep: () => void;
}

export function StepOne({ nextStep }: StepOneProps) {
  const { handleSetOnboardingData, onboardingData } = useOnboardingProcess();
  const formData = useForm<{
    firstName: string;
    lastName: string;
  }>({
    resolver: zodResolver(
      z.object({
        firstName: z
          .string("El nom és un camp obligatori")
          .trim()
          .min(1, "El nom no pot estar buit"),
        lastName: z
          .string("Els cognoms són un camp obligatori")
          .trim()
          .min(1, "Els cognoms no poden estar buits"),
      })
    ),
    defaultValues: {
      firstName: onboardingData.firstName || "",
      lastName: onboardingData.lastName || "",
    },
  });

  const onSubmit = (data: { firstName: string; lastName: string }) => {
    console.log(data);
    handleSetOnboardingData("firstName", data.firstName);
    handleSetOnboardingData("lastName", data.lastName);
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
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="text" placeholder="Nom" {...field} autoFocus />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={formData.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="text" placeholder="Cognoms" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <footer className="flex gap-4 w-full mt-auto md:mt-8">
          <Button size="lg" className="ml-auto" type="submit">
            Continuar
          </Button>
        </footer>
      </form>
    </Form>
  );
}
