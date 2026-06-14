import { ExpandMore, HelpOutline, Print } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyView from '../../../components/EmptyView.tsx';
import { useLoading } from '../../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../../providers/SnackbarProvider.tsx';
import { useGetAnnualInvestmentReport } from '../../../services/invest/investHooks.ts';
import {
  AnnualInvestmentReport,
  AnnualReportAsset,
  AnnualReportBaseTransaction,
  AnnualReportSell,
  AnnualReportWarning,
  AssetType,
} from '../../../services/invest/investServices.ts';
import {
  convertUnixTimestampToDateString,
  getCurrentYear,
} from '../../../utils/dateUtils.ts';
import {
  formatNumberAsCurrency,
  formatNumberAsPercentage,
} from '../../../utils/textUtils.ts';
import { useGetLocalizedAssetType } from '../InvestUtilHooks.ts';

const MIN_REPORT_YEAR = 1900;

const formatUnits = (value: number) =>
  Intl.NumberFormat('en', {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0,
  }).format(value);

const formatDate = (timestamp: number) =>
  convertUnixTimestampToDateString(timestamp, 'DD/MM/YYYY');

const formatGeneratedAt = (generatedAt: string) => {
  const date = new Date(generatedAt);
  if (Number.isNaN(date.getTime())) return generatedAt;
  return date.toLocaleString();
};

const getValueColor = (value: number) => {
  if (value > 0) return 'success.main';
  if (value < 0) return 'warning.main';
  return 'text.primary';
};

const SummaryCard = (props: {
  helpText: string;
  secondaryValue?: string;
  title: string;
  value: string;
  valueColor?: string;
}) => {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack alignItems="center" direction="row" spacing={0.5}>
          <Typography color="text.secondary" variant="body2">
            {props.title}
          </Typography>
          <Tooltip title={props.helpText}>
            <IconButton
              aria-label={props.helpText}
              className="invest-report-help-icon"
              size="small"
              sx={{ color: 'text.secondary', p: 0.25 }}
            >
              <HelpOutline sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Stack>
        <Typography
          color={props.valueColor ?? 'text.primary'}
          mt={1}
          variant="h6"
        >
          {props.value}
        </Typography>
        {props.secondaryValue && (
          <Typography color="text.secondary" variant="body2">
            {props.secondaryValue}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const ColumnHeader = (props: {
  align?: 'left' | 'right';
  helpText: string;
  label: string;
}) => (
  <Stack
    alignItems="center"
    direction="row"
    justifyContent={props.align === 'right' ? 'flex-end' : 'flex-start'}
    spacing={0.5}
  >
    <Typography fontWeight={700} variant="caption">
      {props.label}
    </Typography>
    <Tooltip title={props.helpText}>
      <IconButton
        aria-label={props.helpText}
        className="invest-report-help-icon"
        size="small"
        sx={{ color: 'text.secondary', p: 0.25 }}
      >
        <HelpOutline sx={{ fontSize: 15 }} />
      </IconButton>
    </Tooltip>
  </Stack>
);

const StyledTableContainer = (props: { children: ReactNode }) => (
  <TableContainer
    component={Paper}
    elevation={0}
    sx={{
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      overflowX: 'auto',
      '& .MuiTableCell-head': {
        bgcolor: 'action.hover',
        whiteSpace: 'nowrap',
      },
      '& .MuiTableCell-body': {
        borderColor: 'divider',
      },
      '& .MuiTableRow-root:nth-of-type(even) .MuiTableCell-body': {
        bgcolor: 'action.hover',
      },
      '& .MuiTableRow-root:hover .MuiTableCell-body': {
        bgcolor: 'action.selected',
      },
    }}
  >
    {props.children}
  </TableContainer>
);

const WarningList = (props: { warnings: AnnualReportWarning[] }) => {
  const { t } = useTranslation();

  if (props.warnings.length === 0) return null;

  const getWarningText = (warning: AnnualReportWarning) => {
    switch (warning.code) {
      case 'INTERNAL_UNIT_FEES':
        return '';
      case 'UNMATCHED_SELL_UNITS':
        return t('investments.annualReport.warningUnmatchedSellUnits', {
          transactionId: warning.transaction_id ?? '-',
          units: formatUnits(warning.units ?? 0),
        });
      default:
        return warning.message;
    }
  };

  const internalUnitFeeWarnings = props.warnings.filter(
    (warning) => warning.code === 'INTERNAL_UNIT_FEES',
  );
  const groupedWarnings = props.warnings.filter(
    (warning) => warning.code !== 'INTERNAL_UNIT_FEES',
  );
  const internalFeeUnits = internalUnitFeeWarnings.reduce(
    (total, warning) => total + (warning.units ?? 0),
    0,
  );

  return (
    <Alert severity="warning" variant="outlined">
      <AlertTitle>{t('investments.annualReport.warnings')}</AlertTitle>
      <Stack component="ul" mb={0} mt={0.5} pl={2}>
        {internalUnitFeeWarnings.length > 0 && (
          <Typography component="li" variant="body2">
            {t('investments.annualReport.warningInternalUnitFeesGeneric', {
              count: internalUnitFeeWarnings.length,
              units: formatUnits(internalFeeUnits),
            })}
          </Typography>
        )}
        {groupedWarnings.map((warning) => (
          <Typography
            component="li"
            key={`${warning.code}-${warning.transaction_id}-${warning.units}`}
            variant="body2"
          >
            {getWarningText(warning)}
          </Typography>
        ))}
      </Stack>
    </Alert>
  );
};

const BuyTable = (props: { buys: AnnualReportBaseTransaction[] }) => {
  const { t } = useTranslation();

  if (props.buys.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        {t('investments.annualReport.noBuys')}
      </Typography>
    );
  }

  return (
    <StyledTableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <ColumnHeader
                helpText={t('investments.annualReport.columnHelp.buyDate')}
                label={t('common.date')}
              />
            </TableCell>
            <TableCell align="right">
              <ColumnHeader
                align="right"
                helpText={t('investments.annualReport.columnHelp.buyUnits')}
                label={t('investments.units')}
              />
            </TableCell>
            <TableCell align="right">
              <ColumnHeader
                align="right"
                helpText={t('investments.annualReport.columnHelp.buyAmount')}
                label={t('common.amount')}
              />
            </TableCell>
            <TableCell align="right">
              <ColumnHeader
                align="right"
                helpText={t('investments.annualReport.columnHelp.buyFees')}
                label={t('investments.feesAndTaxes')}
              />
            </TableCell>
            <TableCell>
              <ColumnHeader
                helpText={t('investments.annualReport.columnHelp.notes')}
                label={t('investments.observations')}
              />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.buys.map((buy) => (
            <TableRow key={buy.transaction_id}>
              <TableCell>{formatDate(buy.date_timestamp)}</TableCell>
              <TableCell align="right">{formatUnits(buy.units)}</TableCell>
              <TableCell align="right">
                {formatNumberAsCurrency(buy.total_price)}
              </TableCell>
              <TableCell align="right">
                {formatNumberAsCurrency(buy.fees_amount)}
              </TableCell>
              <TableCell>{buy.note}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

const SellFifoTable = (props: { sells: AnnualReportSell[] }) => {
  const { t } = useTranslation();

  if (props.sells.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        {t('investments.annualReport.noSells')}
      </Typography>
    );
  }

  return (
    <StyledTableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <ColumnHeader
                helpText={t('investments.annualReport.columnHelp.sellDate')}
                label={t('investments.annualReport.sellDate')}
              />
            </TableCell>
            <TableCell align="right">
              <ColumnHeader
                align="right"
                helpText={t('investments.annualReport.columnHelp.sellUnits')}
                label={t('investments.annualReport.sellUnits')}
              />
            </TableCell>
            <TableCell align="right">
              <ColumnHeader
                align="right"
                helpText={t('investments.annualReport.columnHelp.proceeds')}
                label={t('investments.annualReport.proceeds')}
              />
            </TableCell>
            <TableCell>
              <ColumnHeader
                helpText={t(
                  'investments.annualReport.columnHelp.matchedBuyDate',
                )}
                label={t('investments.annualReport.buyDate')}
              />
            </TableCell>
            <TableCell align="right">
              <ColumnHeader
                align="right"
                helpText={t('investments.annualReport.columnHelp.matchedUnits')}
                label={t('investments.annualReport.matchedUnits')}
              />
            </TableCell>
            <TableCell align="right">
              <ColumnHeader
                align="right"
                helpText={t(
                  'investments.annualReport.columnHelp.acquisitionCost',
                )}
                label={t('investments.annualReport.acquisitionCost')}
              />
            </TableCell>
            <TableCell align="right">
              <ColumnHeader
                align="right"
                helpText={t(
                  'investments.annualReport.columnHelp.allocatedFees',
                )}
                label={t('investments.annualReport.allocatedFees')}
              />
            </TableCell>
            <TableCell align="right">
              <ColumnHeader
                align="right"
                helpText={t('investments.annualReport.columnHelp.gainLoss')}
                label={t('investments.annualReport.gainLoss')}
              />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.sells.map((sell) => {
            if (sell.fifo_matches.length === 0) {
              return (
                <TableRow key={sell.transaction_id}>
                  <TableCell>{formatDate(sell.date_timestamp)}</TableCell>
                  <TableCell align="right">{formatUnits(sell.units)}</TableCell>
                  <TableCell align="right">
                    {formatNumberAsCurrency(sell.total_price)}
                  </TableCell>
                  <TableCell colSpan={5}>
                    {t('investments.annualReport.noFifoMatches')}
                  </TableCell>
                </TableRow>
              );
            }

            return sell.fifo_matches.map((match) => (
              <TableRow
                key={`${sell.transaction_id}-${match.buy_transaction.transaction_id}-${match.matched_units}`}
              >
                <TableCell>{formatDate(sell.date_timestamp)}</TableCell>
                <TableCell align="right">{formatUnits(sell.units)}</TableCell>
                <TableCell align="right">
                  {formatNumberAsCurrency(match.proceeds)}
                </TableCell>
                <TableCell>
                  {formatDate(match.buy_transaction.date_timestamp)}
                </TableCell>
                <TableCell align="right">
                  {formatUnits(match.matched_units)}
                </TableCell>
                <TableCell align="right">
                  {formatNumberAsCurrency(match.acquisition_cost)}
                </TableCell>
                <TableCell align="right">
                  {formatNumberAsCurrency(match.allocated_fees)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: getValueColor(match.gain_loss),
                    fontWeight: 700,
                  }}
                >
                  {formatNumberAsCurrency(match.gain_loss)}
                </TableCell>
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

const AssetReportSection = (props: { asset: AnnualReportAsset }) => {
  const { t } = useTranslation();
  const getLocalizedAssetType = useGetLocalizedAssetType();

  return (
    <Accordion
      className="invest-report-section"
      disableGutters
      sx={{
        border: 1,
        borderColor: 'divider',
        '&:before': { display: 'none' },
      }}
      variant="outlined"
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Stack
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ width: '100%' }}
        >
          <Box>
            <Typography variant="h6">
              {props.asset.name}
              {props.asset.ticker ? ` (${props.asset.ticker})` : ''}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {getLocalizedAssetType.invoke(props.asset.type as AssetType)}
              {props.asset.broker ? ` · ${props.asset.broker}` : ''}
            </Typography>
          </Box>
          <Chip
            color={
              props.asset.summary.realized_gain_loss < 0 ? 'warning' : 'success'
            }
            label={formatNumberAsCurrency(
              props.asset.summary.realized_gain_loss,
            )}
            variant="outlined"
          />
        </Stack>
      </AccordionSummary>

      <AccordionDetails>
        <Grid container mt={2} spacing={1}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryCard
              helpText={t(
                'investments.annualReport.summaryHelp.assetTotalInvested',
              )}
              title={t('investments.totalInvested')}
              value={formatNumberAsCurrency(props.asset.summary.total_invested)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryCard
              helpText={t(
                'investments.annualReport.summaryHelp.assetWithdrawn',
              )}
              title={t('investments.annualReport.withdrawn')}
              value={formatNumberAsCurrency(
                props.asset.summary.total_withdrawn,
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryCard
              helpText={t(
                'investments.annualReport.summaryHelp.assetRealizedGainLoss',
              )}
              title={t('investments.annualReport.realizedGainLoss')}
              value={formatNumberAsCurrency(
                props.asset.summary.realized_gain_loss,
              )}
              valueColor={getValueColor(props.asset.summary.realized_gain_loss)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryCard
              helpText={t('investments.annualReport.summaryHelp.assetFees')}
              secondaryValue={
                props.asset.summary.internal_fee_units > 0
                  ? t('investments.annualReport.internalUnits', {
                      units: formatUnits(
                        props.asset.summary.internal_fee_units,
                      ),
                    })
                  : undefined
              }
              title={t('investments.feesAndTaxes')}
              value={formatNumberAsCurrency(props.asset.summary.fees)}
            />
          </Grid>
        </Grid>

        <Stack mt={2} spacing={2}>
          <WarningList warnings={props.asset.warnings} />
          <Box>
            <Typography mb={1} variant="subtitle1">
              {t('investments.annualReport.buys')}
            </Typography>
            <BuyTable buys={props.asset.buys} />
          </Box>
          <Box>
            <Typography mb={1} variant="subtitle1">
              {t('investments.annualReport.sellsFifo')}
            </Typography>
            <SellFifoTable sells={props.asset.sells} />
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

const ReportContent = (props: { report: AnnualInvestmentReport }) => {
  const { t } = useTranslation();

  const summaryItems = useMemo(
    () => [
      {
        helpText: t('investments.annualReport.summaryHelp.totalInvested'),
        title: t('investments.totalInvested'),
        value: formatNumberAsCurrency(props.report.summary.total_invested),
      },
      {
        helpText: t('investments.annualReport.summaryHelp.withdrawn'),
        title: t('investments.annualReport.withdrawn'),
        value: formatNumberAsCurrency(props.report.summary.total_withdrawn),
      },
      {
        helpText: t('investments.annualReport.summaryHelp.annualRoi'),
        title: t('investments.annualReport.annualRoi'),
        value: formatNumberAsCurrency(props.report.summary.annual_roi_value),
        secondaryValue: formatNumberAsPercentage(
          props.report.summary.annual_roi_percentage,
          true,
        ),
        valueColor: getValueColor(props.report.summary.annual_roi_value),
      },
      {
        helpText: t('investments.annualReport.summaryHelp.realizedGainLoss'),
        title: t('investments.annualReport.realizedGainLoss'),
        value: formatNumberAsCurrency(props.report.summary.realized_gain_loss),
        valueColor: getValueColor(props.report.summary.realized_gain_loss),
      },
      {
        helpText: t('investments.annualReport.summaryHelp.fees'),
        title: t('investments.feesAndTaxes'),
        value: formatNumberAsCurrency(props.report.summary.fees),
      },
      {
        helpText: t(
          'investments.annualReport.summaryHelp.beginningEndingValue',
        ),
        title: t('investments.annualReport.beginningEndingValue'),
        value: t('investments.annualReport.beginningValue', {
          value: formatNumberAsCurrency(props.report.summary.beginning_value),
        }),
        secondaryValue: t('investments.annualReport.endingValue', {
          value: formatNumberAsCurrency(props.report.summary.ending_value),
        }),
      },
    ],
    [props.report.summary, t],
  );

  return (
    <Box className="invest-report-print-area">
      <Stack
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        spacing={1}
      >
        <Box>
          <Typography variant="h5">
            {t('investments.annualReport.title', {
              year: props.report.year,
            })}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {t('investments.annualReport.generatedAt', {
              date: formatGeneratedAt(props.report.generated_at),
            })}
          </Typography>
        </Box>
      </Stack>

      <Alert severity="info" sx={{ mt: 2 }} variant="outlined">
        <AlertTitle>{t('investments.annualReport.disclaimerTitle')}</AlertTitle>
        {t('investments.annualReport.disclaimer')}
      </Alert>

      <Box mt={2}>
        <WarningList warnings={props.report.warnings} />
      </Box>

      <Grid container mt={2} spacing={2}>
        {summaryItems.map((item) => (
          <Grid key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
            <SummaryCard {...item} />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {props.report.assets.length === 0 ? (
        <EmptyView />
      ) : (
        <Stack spacing={2}>
          {props.report.assets.map((asset) => (
            <AssetReportSection asset={asset} key={asset.asset_id} />
          ))}
        </Stack>
      )}
    </Box>
  );
};

const InvestReports = () => {
  const loader = useLoading();
  const snackbar = useSnackbar();
  const { t } = useTranslation();
  const currentYear = getCurrentYear();
  const defaultYear = currentYear - 1;
  const [yearInput, setYearInput] = useState(String(defaultYear));
  const parsedYear = Number(yearInput);
  const isYearValid =
    Number.isInteger(parsedYear) &&
    parsedYear >= MIN_REPORT_YEAR &&
    parsedYear <= currentYear;
  const [reportYear, setReportYear] = useState(defaultYear);
  const annualReportRequest = useGetAnnualInvestmentReport(
    reportYear,
    reportYear >= MIN_REPORT_YEAR && reportYear <= currentYear,
  );

  useEffect(() => {
    if (annualReportRequest.isFetching) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [annualReportRequest.isFetching]);

  useEffect(() => {
    if (annualReportRequest.isError) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [annualReportRequest.isError]);

  const handleGenerate = () => {
    if (!isYearValid) return;
    if (parsedYear === reportYear) {
      void annualReportRequest.refetch();
      return;
    }
    setReportYear(parsedYear);
  };

  const handlePrint = () => {
    const clearPrintMode = () => {
      document.body.classList.remove('invest-report-printing');
    };
    document.body.classList.add('invest-report-printing');
    window.addEventListener('afterprint', clearPrintMode, { once: true });
    window.print();
    window.setTimeout(clearPrintMode, 1000);
  };

  return (
    <Stack spacing={2}>
      <Stack
        className="invest-report-controls"
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
      >
        <TextField
          error={yearInput.length > 0 && !isYearValid}
          helperText={
            yearInput.length > 0 && !isYearValid
              ? t('investments.annualReport.yearValidation', {
                  currentYear,
                })
              : undefined
          }
          inputProps={{
            max: currentYear,
            min: MIN_REPORT_YEAR,
          }}
          label={t('investments.year')}
          onChange={(event) => setYearInput(event.target.value)}
          size="small"
          type="number"
          value={yearInput}
        />
        <Button
          disabled={!isYearValid}
          onClick={handleGenerate}
          variant="contained"
        >
          {t('investments.annualReport.generate')}
        </Button>
        <Button
          disabled={!annualReportRequest.data}
          onClick={handlePrint}
          startIcon={<Print />}
          variant="outlined"
        >
          {t('investments.annualReport.print')}
        </Button>
      </Stack>

      {annualReportRequest.data && (
        <ReportContent report={annualReportRequest.data} />
      )}
    </Stack>
  );
};

export default InvestReports;
