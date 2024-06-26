import { useTranslation, Trans } from 'react-i18next';
import Box from '@mui/material/Box/Box';
import PageHeader from '../../../components/PageHeader.tsx';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import {
  addLeadingZero,
  formatNumberAsCurrency,
} from '../../../utils/textUtils.ts';
import { debounce } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import CardActions from '@mui/material/CardActions';
import Paper from '@mui/material/Paper/Paper';
import {
  Card,
  Divider,
  linearProgressClasses,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Button from '@mui/material/Button/Button';
import {
  AddReaction,
  AddReactionOutlined,
  CloudUpload,
  Description,
  Euro,
  FileCopy,
  Lock,
  LockOpen,
} from '@mui/icons-material';
import TextField from '@mui/material/TextField/TextField';
import InputAdornment from '@mui/material/InputAdornment/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCreateBudgetStep0,
  useCreateBudgetStep1,
  useGetBudget,
  useUpdateBudget,
  useUpdateBudgetStatus,
} from '../../../services/budget/budgetHooks.ts';
import { useLoading } from '../../../providers/LoadingProvider.tsx';
import {
  AlertSeverity,
  useSnackbar,
} from '../../../providers/SnackbarProvider.tsx';
import { BudgetCategory } from '../../../services/budget/budgetServices.ts';
import Typography from '@mui/material/Typography/Typography';
import Stack from '@mui/material/Stack/Stack';
import styled from '@mui/material/styles/styled';
import LinearProgress from '@mui/material/LinearProgress/LinearProgress';
import Container from '@mui/material/Container/Container';
import { getMonthsFullName } from '../../../utils/dateUtils.ts';
import { cssGradients } from '../../../utils/gradientUtils.ts';
import { ColorGradient } from '../../../consts';
import Chip from '@mui/material/Chip/Chip';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import i18next from 'i18next';
import { ROUTE_BUDGET_DETAILS } from '../../../providers/RoutesProvider.tsx';

const BudgetDetails = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const loader = useLoading();
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const matchesSmScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const { id } = useParams();
  const getBudgetRequest = useGetBudget(BigInt(id ?? -1));
  const createBudgetStep0Request = useCreateBudgetStep0();
  const createBudgetStep1Request = useCreateBudgetStep1();
  const updateBudgetStatusRequest = useUpdateBudgetStatus();
  const updateBudgetRequest = useUpdateBudget();
  const [monthYear, setMonthYear] = useState({
    month: dayjs().month() + 1,
    year: dayjs().year(),
  });
  const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState('');
  const [isOpen, setOpen] = useState(false);
  const [isNew, setNew] = useState(true);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [initialBalance, setInitialBalance] = useState(0);
  // Debounced category state update
  const debouncedSetCategories = useCallback(debounce(setCategories, 300), []);

  const orderCategoriesByDebitAmount = (
    categories: BudgetCategory[],
    isOpen: boolean,
  ) => {
    return [...categories]
      .filter((cat) =>
        isOpen
          ? true
          : cat.current_amount_debit != 0 || cat.planned_amount_debit != 0,
      )
      .sort((a, b) => {
        if (isOpen)
          return (
            Number(b.planned_amount_debit + '') -
            Number(a.planned_amount_debit + '')
          );
        return (
          Number(b.current_amount_debit + '') -
          Number(a.current_amount_debit + '')
        );
      });
  };

  const orderCategoriesByCreditAmount = (
    categories: BudgetCategory[],
    isOpen: boolean,
  ) => {
    return [...categories]
      .filter((cat) =>
        isOpen
          ? true
          : cat.current_amount_credit != 0 || cat.planned_amount_credit != 0,
      )
      .sort((a, b) => {
        if (isOpen)
          return (
            Number(b.planned_amount_credit + '') -
            Number(a.planned_amount_credit + '')
          );
        return (
          Number(b.current_amount_credit + '') -
          Number(a.current_amount_credit + '')
        );
      });
  };

  const debitCategories = useMemo(() => {
    return orderCategoriesByDebitAmount(categories, isOpen);
  }, [categories, isOpen]);
  const creditCategories = useMemo(() => {
    return orderCategoriesByCreditAmount(categories, isOpen);
  }, [categories, isOpen]);

  const calculateBudgetBalances = (
    categories?: BudgetCategory[],
  ): {
    plannedBalance: number;
    currentBalance: number;
    plannedIncome: number;
    plannedExpenses: number;
    currentIncome: number;
    currentExpenses: number;
  } => {
    if (!categories)
      return {
        plannedBalance: 0,
        currentBalance: 0,
        plannedIncome: 0,
        plannedExpenses: 0,
        currentIncome: 0,
        currentExpenses: 0,
      };

    return categories.reduce(
      (acc, cur) => {
        return {
          plannedBalance:
            acc.plannedBalance +
            cur.planned_amount_credit -
            cur.planned_amount_debit,
          currentBalance:
            acc.currentBalance +
            cur.current_amount_credit -
            cur.current_amount_debit,
          plannedIncome: acc.plannedIncome + cur.planned_amount_credit,
          plannedExpenses: acc.plannedExpenses + cur.planned_amount_debit,
          currentIncome: acc.currentIncome + cur.current_amount_credit,
          currentExpenses: acc.currentExpenses + cur.current_amount_debit,
        };
      },
      {
        plannedBalance: 0,
        currentBalance: 0,
        plannedIncome: 0,
        plannedExpenses: 0,
        currentIncome: 0,
        currentExpenses: 0,
      },
    );
  };

  const calculatedBalances = useMemo(
    () => calculateBudgetBalances(categories),
    [categories],
  );

  const handleEmojiAdded = (emojiText: string) => {
    setDescriptionValue((prevValue) => `${prevValue} ${emojiText} `);
    descriptionRef?.current?.focus();
    setEmojiPickerOpen(false);
  };

  // Fetch
  useEffect(() => {
    setNew(!id);
    if (!id) {
      createBudgetStep0Request.refetch();
    } else {
      getBudgetRequest.refetch();
    }
  }, [id]);

  // Loading
  useEffect(() => {
    if (
      getBudgetRequest.isFetching ||
      createBudgetStep0Request.isFetching ||
      updateBudgetStatusRequest.isPending ||
      updateBudgetRequest.isPending ||
      createBudgetStep1Request.isPending
    ) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [
    getBudgetRequest.isFetching,
    createBudgetStep0Request.isFetching,
    updateBudgetStatusRequest.isPending,
    updateBudgetRequest.isPending,
    createBudgetStep1Request.isPending,
  ]);

  // Error
  useEffect(() => {
    if (
      getBudgetRequest.isError ||
      createBudgetStep0Request.isError ||
      updateBudgetStatusRequest.isError ||
      updateBudgetRequest.isError ||
      createBudgetStep1Request.isError
    ) {
      snackbar.showSnackbar(
        t('common.somethingWentWrongTryAgain'),
        AlertSeverity.ERROR,
      );
    }
  }, [
    getBudgetRequest.isError,
    createBudgetStep0Request.isError,
    updateBudgetStatusRequest.isError,
    updateBudgetRequest.isError,
    createBudgetStep1Request.isError,
  ]);

  // Data successfully loaded
  useEffect(() => {
    if (getBudgetRequest.data) {
      // datepicker
      setMonthYear({
        month: getBudgetRequest.data.month,
        year: getBudgetRequest.data.year,
      });
      // observations
      setDescriptionValue(getBudgetRequest.data.observations);

      // open
      setOpen(getBudgetRequest.data.is_open == 1);

      // initial balance
      setInitialBalance(getBudgetRequest.data.initial_balance);

      // categories
      debouncedSetCategories(getBudgetRequest.data.categories);
    } else if (createBudgetStep0Request.data) {
      // open
      setOpen(true);

      // initial balance
      setInitialBalance(
        parseFloat(createBudgetStep0Request.data.initial_balance) || 0,
      );

      // categories
      debouncedSetCategories(
        createBudgetStep0Request.data.categories.map((category) => ({
          ...category,
          current_amount_credit: 0,
          current_amount_debit: 0,
          planned_amount_credit: 0,
          planned_amount_debit: 0,
        })),
      );
    }
  }, [getBudgetRequest.data, createBudgetStep0Request.data]);

  useEffect(() => {
    if (createBudgetStep1Request.data) {
      navigate(
        ROUTE_BUDGET_DETAILS.replace(
          ':id',
          createBudgetStep1Request.data.budget_id + '',
        ),
      );
    }
  }, [createBudgetStep1Request.data]);

  if (
    (getBudgetRequest.isLoading || !getBudgetRequest.data) &&
    (createBudgetStep0Request.isFetching || !createBudgetStep0Request.data)
  ) {
    return null;
  }

  const createBudget = () => {
    const catValuesArr = categories.map((category) => {
      const plannedDebit = category.planned_amount_debit;
      const plannedCredit = category.planned_amount_credit;
      return {
        category_id: category.category_id + '',
        planned_value_debit: plannedDebit + '',
        planned_value_credit: plannedCredit + '',
      };
    });
    createBudgetStep1Request.mutate({
      month: monthYear.month,
      year: monthYear.year,
      observations: descriptionValue,
      cat_values_arr: catValuesArr,
    });
  };

  const updateBudget = () => {
    const catValuesArr = categories.map((category) => {
      const plannedDebit = category.planned_amount_debit;
      const plannedCredit = category.planned_amount_credit;
      return {
        category_id: category.category_id + '',
        planned_value_debit: plannedDebit + '',
        planned_value_credit: plannedCredit + '',
      };
    });
    updateBudgetRequest.mutate({
      budget_id: parseFloat(id || '-1'),
      month: monthYear.month,
      year: monthYear.year,
      observations: descriptionValue,
      cat_values_arr: catValuesArr,
    });
  };

  const handleMonthChange = (newDate: Dayjs | null) => {
    if (newDate == null) return;
    setMonthYear({ month: newDate.month() + 1, year: newDate.year() });
  };

  const DebitBorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor:
        theme.palette.grey[theme.palette.mode === 'light' ? 200 : 500],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      background: cssGradients[ColorGradient.Red],
    },
  }));

  const CreditBorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor:
        theme.palette.grey[theme.palette.mode === 'light' ? 200 : 500],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      background: cssGradients[ColorGradient.Green],
    },
  }));

  function getCurrentCategoryValuePercentage(
    category: BudgetCategory,
    isDebit: boolean,
  ): number {
    if (isDebit)
      return Math.min(
        Math.ceil(
          (category.current_amount_debit * 100) / category.planned_amount_debit,
        ),
        100,
      );
    return Math.min(
      Math.ceil(
        (category.current_amount_credit * 100) / category.planned_amount_credit,
      ),
      100,
    );
  }

  const buildTooltipBottomCard = (
    category: BudgetCategory,
    isDebit: boolean,
  ) => {
    let diff = 0;
    let textKey = '';
    if (isDebit) {
      diff =
        Number(category.current_amount_debit + '') -
        Number(category.planned_amount_debit + '');
      switch (true) {
        case diff > 0:
          textKey = 'budgetDetails.catRemainderDebitOver';
          break;
        case diff < 0:
          textKey = 'budgetDetails.catRemainderDebitUnder';
          break;
        default:
          textKey = t('budgetDetails.catRemainderDebitEqual', {
            amount: formatNumberAsCurrency(diff),
          });
          break;
      }
    } else {
      diff =
        Number(category.current_amount_credit + '') -
        Number(category.planned_amount_credit + '');
      switch (true) {
        case diff > 0:
          textKey = 'budgetDetails.catRemainderCreditOver';
          break;
        case diff < 0:
          textKey = 'budgetDetails.catRemainderCreditUnder';
          break;
        default:
          textKey = 'budgetDetails.catRemainderCreditEqual';
          break;
      }
    }

    let background = '';
    switch (true) {
      case isDebit && diff < 0:
      case !isDebit && diff > 0:
        background = cssGradients[ColorGradient.Green];
        break;
      case isDebit && diff > 0:
      case !isDebit && diff < 0:
        background = cssGradients[ColorGradient.Red];
        break;
      default:
        background = cssGradients[ColorGradient.Orange];
        break;
    }

    return (
      <Container sx={{ p: 2, background: background }}>
        <Typography variant="body2">
          <Trans
            i18nKey={textKey}
            values={{
              amount: formatNumberAsCurrency(Math.abs(diff)),
            }}
          />
        </Typography>
      </Container>
    );
  };

  const renderTopSummaryLabelValue = (label: string, value: string) => {
    return (
      <>
        <Typography color="white" variant="h6">
          {label}
        </Typography>
        <Chip
          label={value}
          variant="filled"
          size="medium"
          sx={{ color: 'white' }}
        />
        {/*<Typography variant="h5">{value}</Typography>*/}
      </>
    );
  };

  const renderCategoryTooltip = (
    category: BudgetCategory,
    isDebit: boolean,
  ) => {
    return (
      <React.Fragment>
        <Container>
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
            <strong>
              <em>{category.description || '-'}</em>
            </strong>
          </Typography>
          {category.exclude_from_budgets == true && (
            <Chip
              label={t('categories.excludedFromBudgets')}
              sx={{ mt: 1, display: 'flex' }}
            />
          )}
        </Container>
        <Divider sx={{ m: 2 }} />
        <Grid container xs={12} spacing={2}>
          <Grid xs={6}>
            <Typography variant="caption">
              {getMonthsFullName(monthYear.month)} {monthYear.year - 1}
            </Typography>
          </Grid>
          <Grid xs={6} sx={{ textAlign: 'right' }}>
            <Chip
              label={formatNumberAsCurrency(
                isDebit
                  ? category.avg_same_month_previous_year_debit
                  : category.avg_same_month_previous_year_credit,
              )}
            />
          </Grid>
        </Grid>
        <Grid container xs={12} spacing={2}>
          <Grid xs={6}>
            <Typography variant="caption">
              {t('budgetDetails.previousMonth')}
            </Typography>
          </Grid>
          <Grid xs={6} sx={{ textAlign: 'right' }}>
            <Chip
              label={formatNumberAsCurrency(
                isDebit
                  ? category.avg_previous_month_debit
                  : category.avg_previous_month_credit,
              )}
            />
          </Grid>
        </Grid>
        <Grid container xs={12} spacing={2}>
          <Grid xs={6}>
            <Typography variant="caption">
              {t('budgetDetails.12MonthAvg')}
            </Typography>
          </Grid>
          <Grid xs={6} sx={{ textAlign: 'right' }}>
            <Chip
              label={formatNumberAsCurrency(
                isDebit
                  ? category.avg_12_months_debit
                  : category.avg_12_months_credit,
              )}
            />
          </Grid>
        </Grid>
        <Grid container xs={12} spacing={2}>
          <Grid xs={6}>
            <Typography variant="caption">
              {t('budgetDetails.globalAverage')}
            </Typography>
          </Grid>
          <Grid xs={6} sx={{ textAlign: 'right' }}>
            <Chip
              label={formatNumberAsCurrency(
                isDebit
                  ? category.avg_lifetime_debit
                  : category.avg_lifetime_credit,
              )}
            />
          </Grid>
        </Grid>
        <Card variant="elevation" sx={{ width: '100%', mt: 2 }}>
          <center>{buildTooltipBottomCard(category, isDebit)}</center>
        </Card>
      </React.Fragment>
    );
  };

  function renderCategoryRow(category: BudgetCategory, isDebit: boolean) {
    return (
      <Card variant="elevation" sx={{ width: '100%', pt: 1, pb: 1 }}>
        <Grid container xs={12} spacing={2} p={2}>
          <Grid xs={12} md={4}>
            <Tooltip title={renderCategoryTooltip(category, isDebit)}>
              <ListItemText
                primary={category.name}
                sx={{ cursor: 'pointer' }}
              />
            </Tooltip>
          </Grid>
          <Grid xs={12} md={4}>
            <TextField
              required
              disabled={!isOpen}
              id={`estimated_${isDebit ? 'debit' : 'credit'}${category.category_id}`}
              name={`estimated_${isDebit ? 'debit' : 'credit'}${category.category_id}`}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                return debouncedSetCategories(
                  categories.map((c) =>
                    c.category_id == category.category_id
                      ? {
                          ...c,
                          planned_amount_debit: isDebit
                            ? value
                            : c.planned_amount_debit,
                          planned_amount_credit: isDebit
                            ? c.planned_amount_credit
                            : value,
                        }
                      : c,
                  ),
                );
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Euro />
                  </InputAdornment>
                ),
              }}
              margin="none"
              type="number"
              label={t('budgetDetails.estimated')}
              fullWidth
              variant="outlined"
              inputProps={{
                step: 0.01,
              }}
              value={
                isDebit
                  ? category.planned_amount_debit
                  : category.planned_amount_credit
              }
            />
          </Grid>
          <Grid xs={12} md={4}>
            <TextField
              required
              disabled
              id={`current_${isDebit ? 'debit' : 'credit'}${category.category_id}`}
              name={`current_${isDebit ? 'debit' : 'credit'}${category.category_id}`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Euro />
                  </InputAdornment>
                ),
              }}
              margin="none"
              type="number"
              label={t('budgetDetails.current')}
              fullWidth
              variant="outlined"
              inputProps={{
                step: 0.01,
              }}
              value={
                isDebit
                  ? category.current_amount_debit
                  : category.current_amount_credit
              }
            />
          </Grid>
        </Grid>
        <CardActions disableSpacing>
          <Stack spacing={2} sx={{ flexGrow: 1 }}>
            {isDebit ? (
              <DebitBorderLinearProgress
                variant="determinate"
                value={getCurrentCategoryValuePercentage(category, isDebit)}
              />
            ) : (
              <CreditBorderLinearProgress
                variant="determinate"
                value={getCurrentCategoryValuePercentage(category, isDebit)}
              />
            )}
          </Stack>
        </CardActions>
      </Card>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <PageHeader
          title={t('budgetDetails.budget')}
          subtitle={t('budgetDetails.strapLine')}
        />
        <Button
          size="small"
          variant="contained"
          startIcon={<FileCopy />}
          onClick={() => {}}
        >
          {t('budgetDetails.cloneAnotherBudget')}
        </Button>
      </Box>
      <Grid container spacing={2}>
        <Grid xs={12} md={6} lg={3}>
          <DatePicker
            label={t('stats.month')}
            views={['month', 'year']}
            onChange={(newDate) => handleMonthChange(newDate)}
            value={dayjs(
              `${monthYear.year}-${addLeadingZero(monthYear.month)}`,
            )}
          />
        </Grid>
        <Grid xs={12} md={6} lgOffset={3}>
          <Box sx={{ position: 'relative' }}>
            <TextField
              inputRef={descriptionRef}
              required
              fullWidth
              margin="none"
              id="description"
              name="description"
              label={t('common.description')}
              placeholder={t('common.description')}
              value={descriptionValue}
              onChange={(e) => setDescriptionValue(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Description />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={'Emojis'}>
                      <IconButton
                        aria-label={'Emojis'}
                        onClick={() => setEmojiPickerOpen(!isEmojiPickerOpen)}
                        edge="end"
                      >
                        {matchesSmScreen ? null : isEmojiPickerOpen ? (
                          <AddReaction color="primary" />
                        ) : (
                          <AddReactionOutlined color="primary" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            {isEmojiPickerOpen && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  right: 0,
                  transform: 'translateY(100%)',
                  zIndex: 2,
                  maxHeight: '300px',
                }}
              >
                <Picker
                  data={data}
                  onEmojiSelect={(emoji: { native: string }) =>
                    handleEmojiAdded(emoji.native)
                  }
                  theme={theme.palette.mode}
                  locale={i18next.resolvedLanguage == 'pt' ? 'pt' : 'en'}
                />
              </Box>
            )}
          </Box>
        </Grid>
        <Grid xs={12}>
          <Card
            variant="elevation"
            sx={{
              width: '100%',
              p: 5,
              background: cssGradients[ColorGradient.Blue],
            }}
          >
            <Grid
              container
              spacing={2}
              display="flex"
              justifyContent="space-between"
              textAlign="center"
            >
              <Grid>
                <Stack spacing={4}>
                  <Stack>
                    {renderTopSummaryLabelValue(
                      t(
                        isOpen
                          ? 'budgetDetails.estimatedExpenses'
                          : 'budgetDetails.actualExpenses',
                      ),
                      formatNumberAsCurrency(
                        isOpen == true
                          ? calculatedBalances.plannedExpenses
                          : calculatedBalances.currentExpenses,
                      ),
                    )}
                  </Stack>
                  <Stack>
                    {renderTopSummaryLabelValue(
                      t('budgetDetails.initialBalance'),
                      formatNumberAsCurrency(initialBalance),
                    )}
                  </Stack>
                </Stack>
              </Grid>
              <Grid>
                <Stack spacing={4}>
                  <Stack>
                    {renderTopSummaryLabelValue(
                      t(
                        isOpen
                          ? 'budgetDetails.estimatedBalance'
                          : 'budgetDetails.actualBalance',
                      ),
                      formatNumberAsCurrency(
                        isOpen
                          ? calculatedBalances.plannedBalance
                          : calculatedBalances.currentBalance,
                      ),
                    )}
                  </Stack>
                  <Stack>
                    {renderTopSummaryLabelValue(
                      t('budgetDetails.status'),
                      t(
                        isOpen
                          ? 'budgetDetails.opened'
                          : 'budgetDetails.closed',
                      ),
                    )}
                  </Stack>
                </Stack>
              </Grid>
              <Grid>
                <Stack spacing={4}>
                  <Stack>
                    {renderTopSummaryLabelValue(
                      t(
                        isOpen
                          ? 'budgetDetails.estimatedIncome'
                          : 'budgetDetails.actualIncome',
                      ),
                      formatNumberAsCurrency(
                        isOpen
                          ? calculatedBalances.plannedIncome
                          : calculatedBalances.currentIncome,
                      ),
                    )}
                  </Stack>
                  <Stack>
                    {renderTopSummaryLabelValue(
                      t('budgetDetails.finalBalance'),
                      formatNumberAsCurrency(
                        initialBalance +
                          (isOpen
                            ? calculatedBalances.plannedBalance
                            : calculatedBalances.currentBalance),
                      ),
                    )}
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        {/* Debit categories */}
        <Grid xs={12} md={6}>
          <Typography variant="h4">{t('common.debit')}</Typography>
          <List>
            {debitCategories.map((category) => (
              <React.Fragment key={category.category_id}>
                <ListItem alignItems="flex-start" sx={{ pl: 0, pr: 0 }}>
                  {renderCategoryRow(category, true)}
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Grid>
        {/* Credit categories */}
        <Grid xs={12} md={6}>
          <Typography variant="h4">{t('common.credit')}</Typography>
          <List>
            {creditCategories.map((category) => (
              <React.Fragment key={category.category_id}>
                <ListItem alignItems="flex-start">
                  {renderCategoryRow(category, false)}
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Grid>
        <Grid
          container
          xs={12}
          sx={{
            color: 'gray',
            position: 'sticky',
            bottom: 0,
            pt: 5,
            pb: 5,
            background: theme.palette.background.paper,
            zIndex: 9,
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<CloudUpload />}
              onClick={() => (isNew ? createBudget() : updateBudget())}
            >
              {t(
                isNew
                  ? 'budgetDetails.addBudgetCTA'
                  : 'budgetDetails.updateBudget',
              )}
            </Button>
            {!isNew && (
              <Button
                variant="contained"
                size="large"
                startIcon={isOpen ? <Lock /> : <LockOpen />}
                onClick={() =>
                  updateBudgetStatusRequest.mutate({
                    budgetId: BigInt(id ?? -1),
                    isOpen: isOpen,
                  })
                }
              >
                {t(
                  isOpen
                    ? 'budgetDetails.closeBudgetCTA'
                    : 'budgetDetails.reopenBudget',
                )}
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BudgetDetails;
