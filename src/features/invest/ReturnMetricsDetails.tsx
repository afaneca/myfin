import { HelpOutline } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PeriodReturnMetrics,
  ReturnMetricStatus,
} from '../../services/invest/investServices.ts';
import {
  formatNumberAsCurrency,
  formatNumberAsPercentage,
} from '../../utils/textUtils.ts';

const formatPercentage = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) return '-';
  return formatNumberAsPercentage(value, true);
};

const MetricLine = (props: {
  description: string;
  label: string;
  secondaryValue?: string;
  value: string;
}) => (
  <Box>
    <Stack
      direction="row"
      justifyContent="space-between"
      spacing={2}
      sx={{ alignItems: 'flex-start' }}
    >
      <Typography fontWeight={700} variant="body2">
        {props.label}
      </Typography>
      <Box sx={{ minWidth: 132, textAlign: 'right' }}>
        <Typography fontWeight={700} variant="body2">
          {props.value}
        </Typography>
        {props.secondaryValue && (
          <Typography color="text.secondary" variant="caption">
            {props.secondaryValue}
          </Typography>
        )}
      </Box>
    </Stack>
    <Typography color="text.secondary" display="block" variant="caption">
      {props.description}
    </Typography>
  </Box>
);

const DetailPanel = (props: {
  description: string;
  label: string;
  metadata?: Array<{ label: string; value: string }>;
  secondaryValue?: string;
  value: string;
}) => (
  <Box
    sx={{
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      p: 2,
    }}
  >
    <Stack spacing={1.25}>
      <Box>
        <Typography color="text.secondary" variant="caption">
          {props.label}
        </Typography>
        <Typography fontWeight={700} variant="h6">
          {props.value}
        </Typography>
        {props.secondaryValue && (
          <Typography color="text.secondary" variant="body2">
            {props.secondaryValue}
          </Typography>
        )}
      </Box>
      <Typography color="text.secondary" variant="body2">
        {props.description}
      </Typography>
      {props.metadata && props.metadata.length > 0 && (
        <Stack spacing={0.5}>
          {props.metadata.map((item) => (
            <Stack
              direction="row"
              justifyContent="space-between"
              key={item.label}
              spacing={2}
            >
              <Typography color="text.secondary" variant="caption">
                {item.label}
              </Typography>
              <Typography fontWeight={600} textAlign="right" variant="caption">
                {item.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  </Box>
);

const CashFlowLine = (props: { label: string; value: string }) => (
  <Stack direction="row" justifyContent="space-between" spacing={2}>
    <Typography color="text.secondary" variant="body2">
      {props.label}
    </Typography>
    <Typography fontWeight={600} textAlign="right" variant="body2">
      {props.value}
    </Typography>
  </Stack>
);

const formatStatus = (
  t: TFunction<'translation', undefined>,
  status: ReturnMetricStatus,
) => {
  switch (status) {
    case 'no_solution':
      return t('investments.returnMetrics.statusNoSolution');
    case 'insufficient_data':
      return t('investments.returnMetrics.statusInsufficientData');
    case 'ok':
      return '';
  }
};

const statusMetadata = (
  t: TFunction<'translation', undefined>,
  status: ReturnMetricStatus,
) =>
  status === 'ok'
    ? []
    : [
        {
          label: t('investments.returnMetrics.status'),
          value: formatStatus(t, status),
        },
      ];

const ReturnMetricsDetails = (props: {
  ariaLabel: string;
  performanceReturnHelp?: string;
  performanceReturnLabel?: string;
  metrics: PeriodReturnMetrics;
  title?: string;
}) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const performanceReturnLabel =
    props.performanceReturnLabel ??
    t('investments.returnMetrics.portfolioReturn');
  const performanceReturnHelp =
    props.performanceReturnHelp ??
    t('investments.returnMetrics.portfolioReturnHelp');
  const portfolioAnnualized =
    props.metrics.portfolio_return.annualized_percentage !== null
      ? t('investments.returnMetrics.annualizedValue', {
          value: formatPercentage(
            props.metrics.portfolio_return.annualized_percentage,
          ),
        })
      : undefined;

  return (
    <>
      <Tooltip
        arrow
        enterTouchDelay={0}
        leaveTouchDelay={8000}
        placement="top"
        slotProps={{ tooltip: { sx: { maxWidth: 520 } } }}
        title={
          <Stack spacing={1.2} sx={{ p: 0.5, width: 440 }}>
            <MetricLine
              description={t('investments.returnMetrics.absoluteReturnHelp')}
              label={t('investments.returnMetrics.absoluteReturn')}
              value={formatNumberAsCurrency(
                props.metrics.absolute_return_value,
              )}
            />
            <MetricLine
              description={performanceReturnHelp}
              label={performanceReturnLabel}
              secondaryValue={portfolioAnnualized}
              value={formatPercentage(
                props.metrics.portfolio_return.cumulative_percentage,
              )}
            />
            <MetricLine
              description={t('investments.returnMetrics.personalReturnHelp')}
              label={t('investments.returnMetrics.personalReturn')}
              value={formatPercentage(
                props.metrics.personal_return.annualized_percentage,
              )}
            />
            <MetricLine
              description={t('investments.returnMetrics.simpleRoiHelp')}
              label={t('investments.returnMetrics.simpleRoi')}
              value={formatPercentage(props.metrics.simple_roi.percentage)}
            />
            <Box>
              <Typography fontWeight={700} variant="body2">
                {t('investments.returnMetrics.cashFlows')}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                {t('investments.returnMetrics.cashFlowsHelp', {
                  contributions: formatNumberAsCurrency(
                    props.metrics.cash_flows.contributions,
                  ),
                  withdrawals: formatNumberAsCurrency(
                    props.metrics.cash_flows.withdrawals,
                  ),
                  net: formatNumberAsCurrency(props.metrics.cash_flows.net),
                })}
              </Typography>
            </Box>
          </Stack>
        }
      >
        <IconButton
          aria-label={props.ariaLabel}
          onClick={(event) => {
            event.stopPropagation();
            setIsDialogOpen(true);
          }}
          onMouseDown={(event) => event.stopPropagation()}
          size="small"
          sx={{ ml: 0.5, color: 'text.secondary', opacity: 0.75 }}
        >
          <HelpOutline sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setIsDialogOpen(false)}
        open={isDialogOpen}
      >
        <DialogTitle>
          {props.title ?? t('investments.returnMetrics.dialogTitle')}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, minmax(0, 1fr))',
                },
              }}
            >
              <DetailPanel
                description={t('investments.returnMetrics.absoluteReturnHelp')}
                label={t('investments.returnMetrics.absoluteReturn')}
                value={formatNumberAsCurrency(
                  props.metrics.absolute_return_value,
                )}
              />
              <DetailPanel
                description={performanceReturnHelp}
                label={performanceReturnLabel}
                metadata={[
                  {
                    label: t('investments.returnMetrics.method'),
                    value: t(
                      'investments.returnMetrics.linkedMonthlyModifiedDietz',
                    ),
                  },
                  ...statusMetadata(t, props.metrics.portfolio_return.status),
                ]}
                secondaryValue={portfolioAnnualized}
                value={formatPercentage(
                  props.metrics.portfolio_return.cumulative_percentage,
                )}
              />
              <DetailPanel
                description={t('investments.returnMetrics.personalReturnHelp')}
                label={t('investments.returnMetrics.personalReturn')}
                metadata={[
                  {
                    label: t('investments.returnMetrics.method'),
                    value: t('investments.returnMetrics.xirr'),
                  },
                  ...statusMetadata(t, props.metrics.personal_return.status),
                ]}
                value={formatPercentage(
                  props.metrics.personal_return.annualized_percentage,
                )}
              />
              <DetailPanel
                description={t('investments.returnMetrics.simpleRoiHelp')}
                label={t('investments.returnMetrics.simpleRoi')}
                metadata={[
                  {
                    label: t('investments.returnMetrics.denominator'),
                    value:
                      props.metrics.simple_roi.denominator === null
                        ? '-'
                        : formatNumberAsCurrency(
                            props.metrics.simple_roi.denominator,
                          ),
                  },
                  ...statusMetadata(t, props.metrics.simple_roi.status),
                ]}
                value={formatPercentage(props.metrics.simple_roi.percentage)}
              />
            </Box>
            <Box>
              <Typography fontWeight={700} gutterBottom variant="subtitle1">
                {t('investments.returnMetrics.cashFlows')}
              </Typography>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {t('investments.returnMetrics.cashFlowsDescription')}
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Stack spacing={1}>
                <CashFlowLine
                  label={t('investments.contributions')}
                  value={formatNumberAsCurrency(
                    props.metrics.cash_flows.contributions,
                  )}
                />
                <CashFlowLine
                  label={t('investments.withdrawals')}
                  value={formatNumberAsCurrency(
                    props.metrics.cash_flows.withdrawals,
                  )}
                />
                <CashFlowLine
                  label={t('investments.returnMetrics.netFlow')}
                  value={formatNumberAsCurrency(props.metrics.cash_flows.net)}
                />
                <CashFlowLine
                  label={t('investments.returnMetrics.externalIncome')}
                  value={formatNumberAsCurrency(
                    props.metrics.cash_flows.external_income,
                  )}
                />
                <CashFlowLine
                  label={t('investments.returnMetrics.feesAndCosts')}
                  value={formatNumberAsCurrency(
                    props.metrics.cash_flows.fees_and_costs,
                  )}
                />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReturnMetricsDetails;
