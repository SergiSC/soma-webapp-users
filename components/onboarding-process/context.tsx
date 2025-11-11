"use client";

import { useUser } from "@/context/user-context";
import { useUpdateUser } from "@/hooks/api/users";
import router from "next/router";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";

export enum HowDidYouFindUs {
  FRIENDS = "friends",
  SOCIAL_MEDIA = "socialMedia",
  ADVERTISEMENT = "advertisement",
  OTHER = "other",
}

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
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [onboardingData, setOnboardingData] = useState<
    OnboardingProcessContextType["onboardingData"]
  >({});

  const handleSetOnboardingData = (
    key: keyof OnboardingProcessContextType["onboardingData"],
    value: string | Date | boolean
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

  const { mutate: submitOnboardingMutation, isPending } = useUpdateUser();

  const submitOnboarding = () => {
    try {
      submitOnboardingMutation({
        id: user!.id,
        birthDate: onboardingData.birthdayDate?.toISOString(),
        postalCode: onboardingData.postalCode,
        name: onboardingData.firstName,
        surname: onboardingData.lastName,
        howDidYouFindUs: onboardingData.howDidYouFindUs,
        onboardingCompletedAt: new Date().toISOString(),
      });
      toast.success("Onboarding completat correctament");
      router.push("/home");
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
      "useOnboardingProcess must be used within a OnboardingProcessProvider"
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
    value: string | Date | boolean
  ) => void;
  currentStep: number;
  nextStep: () => void;
  previousStep: () => void;
  submitOnboarding: () => void;
  isSubmitting: boolean;
}
