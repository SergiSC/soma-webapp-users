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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface StepFiveProps {
  previousStep: () => void;
}

export function StepFive({ previousStep }: StepFiveProps) {
  const {
    handleSetOnboardingData,
    onboardingData,
    submitOnboarding,
    isSubmitting,
  } = useOnboardingProcess();
  const formData = useForm<{
    acceptTermsAndConditions: boolean;
    acceptPrivacyPolicy: boolean;
  }>({
    resolver: zodResolver(
      z.object({
        acceptTermsAndConditions: z.boolean().refine((val) => val === true, {
          message: "Has d'acceptar les condicions d'ús",
        }),
        acceptPrivacyPolicy: z.boolean().refine((val) => val === true, {
          message: "Has d'acceptar la política de privacitat",
        }),
      })
    ),
    defaultValues: {
      acceptTermsAndConditions:
        onboardingData.acceptTermsAndConditions || false,
      acceptPrivacyPolicy: onboardingData.acceptPrivacyPolicy || false,
    },
  });

  const onSubmit = (data: {
    acceptTermsAndConditions: boolean;
    acceptPrivacyPolicy: boolean;
  }) => {
    console.log(data);
    handleSetOnboardingData(
      "acceptTermsAndConditions",
      data.acceptTermsAndConditions
    );
    handleSetOnboardingData("acceptPrivacyPolicy", data.acceptPrivacyPolicy);
    submitOnboarding();
  };

  return (
    <Form {...formData}>
      <form
        onSubmit={formData.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={formData.control}
          name="acceptTermsAndConditions"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                  <Checkbox
                    id="acceptTermsAndConditions"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className=" data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white dark:data-[state=checked]:border-primary dark:data-[state=checked]:bg-primary"
                  />
                  <div className="grid gap-1.5 font-normal">
                    <p className="text-sm leading-none font-medium">
                      Accepto les condicions d&apos;ús
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Vegeu les condicions d&apos;ús en aquest{" "}
                      <Link
                        href="https://www.projectsoma.com/terms-conditions"
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        enllaç
                      </Link>
                      .
                    </p>
                  </div>
                </Label>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={formData.control}
          name="acceptPrivacyPolicy"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                  <Checkbox
                    id="acceptPrivacyPolicy"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className=" data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white dark:data-[state=checked]:border-primary dark:data-[state=checked]:bg-primary"
                  />
                  <div className="grid gap-1.5 font-normal">
                    <p className="text-sm leading-none font-medium">
                      Accepto la política de privacitat
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Vegeu la política de privacitat en aquest{" "}
                      <Link
                        href="https://www.projectsoma.com/privacy-policy"
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        enllaç
                      </Link>
                      .
                    </p>
                  </div>
                </Label>
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
          <Button
            size="lg"
            className="ml-auto"
            type="submit"
            disabled={!formData.formState.isValid || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Ready per al reformer!"
            )}
          </Button>
        </footer>
      </form>
    </Form>
  );
}
