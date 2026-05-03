"use client";

import { useUser } from "@/context/user-context";
import { HowDidYouFindUs, useUpdateUser } from "@/hooks/api/users";
import { useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";

export const OnboardingProcessContext =
  createContext<OnboardingProcessContextType | null>(null);

export const OnboardingProcessContextProvider =
  OnboardingProcessContext.Provider;

interface OnboardingProcessProviderProps {
  children: React.ReactNode;
}

export function OnboardingProcessProvider({
  children,
}: OnboardingProcessProviderProps) {
  const { user } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [onboardingData, setOnboardingData] = useState<
    OnboardingProcessContextType["onboardingData"]
  >({});

  const handleSetOnboardingData = (
    key: keyof OnboardingProcessContextType["onboardingData"],
    value: string | Date | boolean,
  ) => {
    setOnboardingData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const { mutateAsync: submitOnboardingMutation, isPending } = useUpdateUser({
    userId: user?.id,
  });

  const submitOnboarding = async () => {
    let birthDateString: string | undefined;
    if (onboardingData.birthdayDate) {
      // from the date, get the day, month and year
      const day = onboardingData.birthdayDate.getDate();
      const month = onboardingData.birthdayDate.getMonth() + 1;
      const year = onboardingData.birthdayDate.getFullYear();
      birthDateString = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    }

    try {
      await submitOnboardingMutation({
        id: user!.id,
        birthDate: birthDateString,
        postalCode: onboardingData.postalCode,
        name: onboardingData.firstName,
        surname: onboardingData.lastName,
        howDidYouFindUs: onboardingData.howDidYouFindUs,
        onboardingCompletedAt: new Date().toISOString(),
      });
      toast.success("Onboarding completat correctament");
      router.push("/");
      return;
    } catch (error: unknown) {
      console.error(error);
      toast.error("Error al completar la creació del teu compte", {
        description: "Si el problema persisteix, contacta amb el suport.",
      });
    }
  };

  return (
    <OnboardingProcessContext.Provider
      value={{
        onboardingData,
        handleSetOnboardingData,
        currentStep,
        nextStep,
        previousStep,
        submitOnboarding,
        isSubmitting: isPending,
      }}
    >
      {children}
    </OnboardingProcessContext.Provider>
  );
}

export function useOnboardingProcess() {
  const context = useContext(OnboardingProcessContext);
  if (!context) {
    throw new Error(
      "useOnboardingProcess must be used within a OnboardingProcessProvider",
    );
  }
  return context;
}

export interface OnboardingProcessContextType {
  onboardingData: {
    firstName?: string;
    lastName?: string;
    birthdayDate?: Date;
    postalCode?: string; // ISO 3166-1 alpha-2 format
    howDidYouFindUs?: HowDidYouFindUs; // HowDidYouFindUs enum
    acceptTermsAndConditions?: boolean;
    acceptPrivacyPolicy?: boolean;
  };
  handleSetOnboardingData: (
    key: keyof OnboardingProcessContextType["onboardingData"],
    value: string | Date | boolean,
  ) => void;
  currentStep: number;
  nextStep: () => void;
  previousStep: () => void;
  submitOnboarding: () => void;
  isSubmitting: boolean;
}
