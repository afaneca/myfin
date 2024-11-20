import { Step, StepButton, Stepper, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Box from '@mui/material/Box/Box';
import PageHeader from '../../../components/PageHeader.tsx';
import Paper from '@mui/material/Paper/Paper';
import ImportTrxStep0 from './ImportTrxStep0.tsx';
import ImportTrxStep1, { ImportTrxStep1Result } from './ImportTrxStep1.tsx';
import ImportTrxStep2, { ImportTrxStep2Result } from './ImportTrxStep2.tsx';
import ImportTrxStep3 from './ImportTrxStep3.tsx';

const ImportTransactions = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const steps = [
    t('importTransactions.step0Label'),
    t('importTransactions.step1Label'),
    t('importTransactions.step2Label'),
    t('importTransactions.step3Label'),
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [completed, _setCompleted] = useState<{
    [k: number]: boolean;
  }>({});
  const [clipboardText, setClipboardText] = useState('');
  const [step1Result, setStep1Result] = useState<ImportTrxStep1Result | null>(
    null,
  );
  const [step2Result, setStep2Result] = useState<ImportTrxStep2Result | null>(
    null,
  );
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <ImportTrxStep0
            onNext={(clipboardText: string) => {
              setClipboardText(clipboardText);
              setCurrentStep(1);
            }}
          />
        );
      case 1:
        return (
          <ImportTrxStep1
            clipboardText={clipboardText}
            onNext={(result) => {
              setStep1Result(result);
              setCurrentStep(2);
            }}
          />
        );
      case 2:
        if (step1Result) {
          return (
            <ImportTrxStep2
              data={step1Result}
              onNext={(result) => {
                setStep2Result({
                  nrOfTrxImported: result.nrOfTrxImported,
                  accountName: result.accountName,
                });
                setCurrentStep(3);
              }}
            />
          );
        }
        break;
      case 3:
        return (
          <ImportTrxStep3
            nrOfTrxImported={step2Result?.nrOfTrxImported || 0}
            accountName={step2Result?.accountName || ''}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Paper elevation={0} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
      <Box display="flex" justifyContent="space-between" flexDirection="column">
        <PageHeader
          title={t('importTransactions.importTransactions')}
          subtitle={t('importTransactions.strapLine')}
        />
      </Box>
      <Box sx={{ mt: theme.spacing(0), mb: theme.spacing(2) }}>
        <Stepper activeStep={currentStep}>
          {steps.map((label, index) => (
            <Step key={label} completed={completed[index]}>
              <StepButton color="inherit" onClick={() => {}}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Box sx={{ mt: theme.spacing(0), mb: theme.spacing(2) }}>
        {renderStepContent(currentStep)}
      </Box>
    </Paper>
  );
};

export default ImportTransactions;
