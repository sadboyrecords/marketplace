import ModalContainer from "@/components/modalContainer";
import { LoadingSpinner } from "@/components/iconComponents";
import Typography from "@/components/typography";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import Button from "@/components/buttons/Button";
import { routes } from "@/utils/constants";
import { useRouter } from "next/router";
// - Title
// - Error description
//     - Button - retry,
// - Success description
// - Pending description
// - In progress description
// - Status - pending, in-progress, completed, error

type DescriptionType = {
  PENDING: string;
  IN_PROGRESS: string;
  COMPLETED: string;
  ERROR: string;
  START: string;
};

export const stepperStatus = {
  pending: "PENDING",
  inProgress: "IN_PROGRESS",
  completed: "COMPLETED",
  error: "ERROR",
  start: "START",
};

export type Steps = {
  step: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ERROR" | "START";
  description: DescriptionType;
  retry?: () => void;
  start?: () => void;
};

export type StepperProps = {
  open: boolean;
  steps: Steps[];
  retry?: () => void;
  completed?: boolean;
  viewDrop?: () => void;
  slug?: string;
  handleCancel: () => void;
};

export function Stepper({
  open,
  steps,
  retry,
  slug,
  handleCancel,
}: StepperProps) {
  //   const stepperDataContent = ({
  //     index,
  //     status,
  //   }: {
  //     index: number;
  //     status: string;
  //   }) => {
  //     return {
  //       [stepperStatus.pending]: '',
  //     };
  //   };
  const stepperDataContent = {
    [stepperStatus.completed]: "✓",
    [stepperStatus.inProgress]: "●",
    [stepperStatus.error]: "●",
  };

  const stepperColor = {
    [stepperStatus.completed]: "step-primary",
    [stepperStatus.inProgress]: "step-primary",
    [stepperStatus.pending]: "",
    [stepperStatus.error]: "step-error",
  };

  const router = useRouter();
  return (
    <>
      <ModalContainer
        primaryButtonName={`${slug ? "View Drop" : ""}`}
        primaryAction={() => void router.push(routes.dropDetails(slug || ""))}
        open={open}
        hideCloseButton
        title="Creating your drop"
      >
        <ul className="steps steps-vertical">
          {steps.map((step, index) => (
            // <li data-content="✓" className="step step-primary">

            // </li>
            <li
              key={step.step}
              data-content={
                step.status === stepperStatus.pending
                  ? index + 1
                  : stepperDataContent[step.status]
              }
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              className={`step ${stepperColor[step.status]}`}
            >
              <div className="flex flex-col space-y-3 text-left">
                <div className="flex space-x-2 ">
                  <Typography size="body-sm">
                    {step.description[step.status]}
                  </Typography>
                  {step.status === stepperStatus.inProgress && (
                    <LoadingSpinner width={20} height={20} />
                  )}
                  {step.status === stepperStatus.error && (
                    <ExclamationCircleIcon className="text-error h-5 w-5" />
                  )}
                </div>
                {step.status === stepperStatus.error && (
                  <div className="flex">
                    <Button
                      onClick={retry || step.retry}
                      size="sm"
                      rounded="md"
                      variant="outlined"
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
          <Button
            onClick={() => handleCancel()}
            size="sm"
            rounded="md"
            variant="ghost"
          >
            Cancel
          </Button>
        </ul>

        {slug && (
          <div className="mt-4 flex space-x-3">
            <CheckCircleIcon className="text-success h-12 w-12" />
            <Typography>
              Congrats, your drop has been created. Select the button below to
              view details
            </Typography>
          </div>
        )}
      </ModalContainer>
    </>
  );
}
