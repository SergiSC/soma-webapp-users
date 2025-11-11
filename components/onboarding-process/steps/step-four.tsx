import { HowDidYouFindUs, useOnboardingProcess } from "../context";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface StepFourProps {
  nextStep: () => void;
  previousStep: () => void;
}

export function StepFour({ nextStep, previousStep }: StepFourProps) {
  const { handleSetOnboardingData, onboardingData } = useOnboardingProcess();
  const formData = useForm<{
    howDidYouFindUs: HowDidYouFindUs;
  }>({
    resolver: zodResolver(
      z.object({
        howDidYouFindUs: z.enum(Object.values(HowDidYouFindUs), {
          message: "La forma de trobar-nos és un camp obligatori",
        }),
      })
    ),
    defaultValues: {
      howDidYouFindUs:
        onboardingData.howDidYouFindUs || HowDidYouFindUs.FRIENDS,
    },
  });

  const onSubmit = (data: { howDidYouFindUs: HowDidYouFindUs }) => {
    console.log(data);
    handleSetOnboardingData("howDidYouFindUs", data.howDidYouFindUs);
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
          name="howDidYouFindUs"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  {Object.values(HowDidYouFindUs).map((option) => (
                    <div key={option} className="flex items-center gap-2 ">
                      <RadioGroupItem
                        value={option}
                        id={option}
                        className="cursor-pointer"
                      />
                      <Label htmlFor={option} className="cursor-pointer">
                        {howDidYouFindUsRecord[option]}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
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

const howDidYouFindUsRecord: Record<HowDidYouFindUs, string> = {
  [HowDidYouFindUs.FRIENDS]: "Amics o família",
  [HowDidYouFindUs.SOCIAL_MEDIA]: "Xarxes socials",
  [HowDidYouFindUs.ADVERTISEMENT]: "Publicitat en línia",
  [HowDidYouFindUs.OTHER]: "Altres",
};
