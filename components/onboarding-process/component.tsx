import { useMemo } from "react";
import { useOnboardingProcess } from "./context";
import { OnboardingSkelleton, OnboardingSkelletonProps } from "./skelleton";
import { StepOne } from "./steps/step-one";
import { StepTwo } from "./steps/step-two";
import { StepThree } from "./steps/step-three";
import { StepFour } from "./steps/step-four";
import { StepFive } from "./steps/step-five";

export function OnboardingProcess() {
  const { currentStep, nextStep, previousStep } = useOnboardingProcess();

  const step = useMemo((): OnboardingSkelletonProps => {
    switch (currentStep) {
      case 1:
        return {
          title: "Benvingut/da! Ens coneixem?",
          description: "Pas 1 de 5",
          content: <StepOne nextStep={nextStep} />,
        };
      case 2:
        return {
          title: "Quan és el teu aniversari?",
          description: "Pas 2 de 5",
          content: <StepTwo nextStep={nextStep} previousStep={previousStep} />,
        };
      case 3:
        return {
          title: "Quin és el teu codi postal?",
          description: "Pas 3 de 5",
          content: (
            <StepThree nextStep={nextStep} previousStep={previousStep} />
          ),
        };
      case 4:
        return {
          title: "Com has trobat el nostre servei?",
          description: "Pas 4 de 5",
          content: <StepFour nextStep={nextStep} previousStep={previousStep} />,
        };
      default:
        return {
          title:
            "Acceptes les nostres condicions d'ús i la política de privacitat?",
          description: "Pas 5 de 5",
          content: <StepFive previousStep={previousStep} />,
        };
    }
  }, [currentStep, nextStep, previousStep]);

  return (
    <OnboardingSkelleton
      title={step.title}
      description={step.description}
      content={step.content}
    />
  );
}
