import React, { useState, useEffect } from 'react';

import Modal from 'components/Modal';
import {
  InformationCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';
import Typography from 'components/Typography';
import { LoadingSpinner } from 'components/IconComponents';

const Step = ({
  title,
  description,
  loading,
  done,
  failed,
  SuccessUI,
  ErrorUI,
  successErrorParams,
  ...rest
}: {
  title: string;
  description: string;
  loading?: boolean;
  done?: boolean;
  failed?: boolean;
  SuccessUI?: any;
  ErrorUI?: any;
  successErrorParams?: any;
  status?: 'PENDING' | 'IN_PROGRESS' | 'ERROR' | 'COMPLETED' | 'LOADING';
}) => {
  return (
    <>
      <div
        // style={{
        //   display: 'flex',
        //   justifyContent: 'flex-start',
        //   alignItems: 'center',
        //   gap: 1,
        // }}
        className="flex flex-row items-center gap-2"
      >
        {!loading && !done && !failed && (
          <InformationCircleIcon width={20} height={20} />
        )}
        {loading && !done && (
          <>
            {/* loading spinner */}
            <LoadingSpinner width={20} height={20} />
          </>
        )}
        {!loading && done && <CheckCircleIcon width={20} height={20} />}
        {!loading && failed && (
          // <ErrorIcon />
          <ExclamationCircleIcon width={20} height={20} />
        )}
        <div>
          <Typography variant="body1" className="-mb-1">
            {title}
          </Typography>
          {!done && !failed && (
            <Typography variant="body2">{description}</Typography>
          )}
        </div>
      </div>
      {done && !failed && SuccessUI && (
        <div>
          <SuccessUI res={rest} />
        </div>
      )}
      {failed && ErrorUI && (
        <div>
          <ErrorUI
            res={{
              ...rest,
              successErrorParams,
            }}
          />
        </div>
      )}
    </>
  );
};

const useGenerateStep = ({
  stepTitle,
  stepDescription,
  callFunction,
  errorFunction,
  SuccessUI,
  ErrorUI,
}: {
  stepTitle: string;
  stepDescription: string;
  callFunction: (params: any) => Promise<any>;
  errorFunction?: (err: any) => void;
  SuccessUI?: React.ReactNode | React.FC<any>;
  ErrorUI?: React.ReactNode | React.FC<any>;
}) => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const [successErrorParams, setSuccessErrorParams] = useState(null);
  const start = async (
    callParams: any,
    steps: any,
    currentStep: any,
    onClose = () => {}
  ) => {
    setLoading(true);
    setFailed(false);
    setDone(false);
    try {
      const res = await callFunction(callParams);
      setLoading(false);
      setDone(true);
      setSuccessErrorParams({
        ...res,
        ...callParams,
        steps,
        currentStep,
        onClose,
      });
      return res;
    } catch (error) {
      setLoading(false);
      setFailed(true);
      setSuccessErrorParams({
        ...callParams,
        steps,
        currentStep,
        error,
        onClose,
      });
      errorFunction?.(error);
      return Promise.reject(error);
    }
  };
  return {
    start,
    stepTitle,
    Element: () => (
      <Step
        title={stepTitle}
        description={stepDescription}
        loading={loading}
        done={done}
        failed={failed}
        SuccessUI={SuccessUI}
        ErrorUI={ErrorUI}
        successErrorParams={successErrorParams as any}
      />
    ),
  };
};
let stepHistory = {} as any;
let lastResult = null as any;

const stringSteps = (steps: any[]) =>
  steps?.map((step: any) => step?.stepTitle).join('/');

async function iterate(steps: any[], restart?: boolean, onClose?: () => any) {
  if (restart || stepHistory.previousSteps !== stringSteps(steps)) {
    stepHistory = {
      previousSteps: stringSteps(steps),
    };
  }
  for (const step of steps) {
    if (stepHistory[step.stepTitle]) {
      continue;
    }
    lastResult = await step.start(lastResult, steps, step, onClose);
    stepHistory[step.stepTitle] = true;
  }
  if (Array.from(stepHistory).length === steps.length) {
    stepHistory = {};
  }
}

const StepModal = ({
  open,
  setOpen,
  title = 'Deploy',
  steps,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  steps: any[];
}) => {
  return (
    <Modal open={open} onClose={setOpen}>
      <div>
        <div style={{ width: '100%' }}>
          <Typography variant="body1">{title}</Typography>
        </div>
        {steps?.map((Step, index) => (
          <Step.Element key={index} />
        ))}
      </div>
    </Modal>
  );
};

export { Step, StepModal, useGenerateStep, iterate };
