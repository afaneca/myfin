import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Close,
  DeleteOutline,
  FormatListBulleted,
  MoreHoriz,
  InfoOutlined,
  UnfoldLess,
} from '@mui/icons-material';
import {
  Alert,
  Tooltip,
  alpha,
  Button,
  Box,
  Collapse,
  InputBase,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { memo, useCallback, useEffect, useState, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { BudgetBreakdownItem } from '../../services/budget/budgetServices.ts';
import { useFormatNumberAsCurrency } from '../../utils/textHooks.ts';

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  title: string;
  items: BudgetBreakdownItem[];
  total: number;
  readOnly: boolean;
  compact?: boolean;
  inline?: boolean;
  onChange?: (items: BudgetBreakdownItem[], total: number) => void;
  onValidityChange?: (valid: boolean) => void;
  onSave: (items: BudgetBreakdownItem[], total: number) => Promise<void>;
};

type DraftItem = { key: number; label: string; amount: string };
const cents = (value: string) => {
  const match = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(value);
  if (!match) return null;
  const result =
    BigInt(match[1]) * 100n + BigInt((match[2] ?? '').padEnd(2, '0'));
  if (result > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  const decimal = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(Number(result) / 100));
  if (
    !decimal ||
    BigInt(decimal[1]) * 100n + BigInt((decimal[2] ?? '').padEnd(2, '0')) !==
      result
  )
    return null;
  return result;
};

type ItemRowProps = {
  item: DraftItem;
  index: number;
  inline: boolean;
  readOnly: boolean;
  busy: boolean;
  touched: boolean;
  invalidAmount: boolean;
  currencySymbol: string;
  onEdit: (key: number, field: 'label' | 'amount', value: string) => void;
  onMenu: (anchor: HTMLElement, index: number) => void;
};

const BreakdownItemRow = memo(function BreakdownItemRow({
  item,
  index,
  inline,
  readOnly,
  busy,
  touched,
  invalidAmount,
  currencySymbol,
  onEdit,
  onMenu,
}: ItemRowProps) {
  const { t } = useTranslation();
  const format = useFormatNumberAsCurrency();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minHeight: inline ? 34 : 44,
        px: inline ? 1 : 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:hover .item-actions, &:focus-within .item-actions': {
          opacity: 1,
        },
      }}
    >
      {readOnly ? (
        <>
          <Typography variant="body2" sx={{ flex: 1 }}>
            {item.label}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {format.invoke(Number(item.amount))}
          </Typography>
        </>
      ) : (
        <>
          <InputBase
            placeholder={t('budgetBreakdown.label')}
            value={item.label}
            disabled={busy}
            inputProps={{
              'aria-label': t('budgetBreakdown.label'),
              maxLength: 255,
            }}
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: inline ? 13 : 14,
              color:
                touched && !item.label.trim() ? 'error.main' : 'text.primary',
            }}
            onChange={(event) => onEdit(item.key, 'label', event.target.value)}
          />
          <InputBase
            value={item.amount}
            disabled={busy}
            startAdornment={
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mr: 0.5 }}
              >
                {currencySymbol}
              </Typography>
            }
            inputProps={{
              'aria-label': t('budgetBreakdown.amount'),
              inputMode: 'decimal',
              style: { textAlign: 'right' },
            }}
            sx={{
              width: { xs: inline ? 64 : 76, sm: 96 },
              fontSize: inline ? 13 : 14,
              fontVariantNumeric: 'tabular-nums',
              color: invalidAmount ? 'error.main' : 'text.primary',
            }}
            onChange={(event) => onEdit(item.key, 'amount', event.target.value)}
          />
          <IconButton
            className="item-actions"
            aria-label={t('budgetBreakdown.options')}
            aria-haspopup="menu"
            size="small"
            disabled={busy}
            onClick={(event) => onMenu(event.currentTarget, index)}
            sx={{
              opacity: { xs: 1, sm: 0.35 },
              transition: 'opacity 150ms',
              width: inline ? 28 : 36,
              height: 36,
            }}
          >
            <MoreHoriz sx={{ fontSize: 20 }} />
          </IconButton>
        </>
      )}
    </Box>
  );
});

export default function BudgetBreakdownEditor({
  open,
  onOpen,
  onClose,
  title,
  items,
  total,
  readOnly,
  compact,
  inline = false,
  onChange,
  onValidityChange,
  onSave,
}: Props) {
  const { t } = useTranslation();
  const actionLabel = items.length
    ? t('budgetBreakdown.action', { count: items.length })
    : t('budgetBreakdown.add');
  const format = useFormatNumberAsCurrency();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const titleId = useId();
  const wasOpen = useRef(false);
  const [draft, setDraft] = useState<DraftItem[]>([]);
  const draftRef = useRef<DraftItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [itemMenu, setItemMenu] = useState<{
    anchor: HTMLElement;
    index: number;
  } | null>(null);
  useEffect(() => {
    if (!open) {
      if (!inline) wasOpen.current = false;
      return;
    }
    if (wasOpen.current) return;
    wasOpen.current = true;
    const initialDraft = items.length
      ? items.map((item, key) => ({
          key,
          label: item.label,
          amount: item.amount.toFixed(2),
        }))
      : readOnly
        ? []
        : [{ key: 0, label: '', amount: String(total) }];
    draftRef.current = initialDraft;
    setDraft(initialDraft);
    if (inline) onValidityChange?.(readOnly || items.length > 0);
    setError('');
    setTouched(false);
  }, [open, items, inline, readOnly, total, onValidityChange]);
  const amounts = draft.map((item) => cents(item.amount));
  const sum = amounts.reduce<bigint>(
    (value, amount) => value + (amount ?? 0n),
    0n,
  );
  const valid =
    draft.every(
      (item, index) =>
        item.label.trim().length > 0 &&
        item.label.trim().length <= 255 &&
        amounts[index] !== null,
    ) && cents(String(Number(sum) / 100)) === sum;
  const calculated = draft.length ? Number(sum) / 100 : total;
  const save = async (single: boolean) => {
    setBusy(true);
    setError('');
    try {
      await onSave(
        single
          ? []
          : draft.map((item, sort_order) => ({
              label: item.label.trim(),
              amount: Number(cents(item.amount)) / 100,
              sort_order,
            })),
        calculated,
      );
      onClose();
    } catch {
      setError(t('budgetBreakdown.saveFailed'));
    } finally {
      setBusy(false);
    }
  };
  const draftTotal = useCallback(
    (rows: DraftItem[]) => {
      const values = rows.map((item) => cents(item.amount));
      const sum = values.reduce<bigint>(
        (value, amount) => value + (amount ?? 0n),
        0n,
      );
      const valid =
        rows.every(
          (item, index) =>
            item.label.trim().length > 0 &&
            item.label.trim().length <= 255 &&
            values[index] !== null,
        ) && cents(String(Number(sum) / 100)) === sum;
      return { valid, total: rows.length ? Number(sum) / 100 : total };
    },
    [total],
  );
  const change = useCallback(
    (next: DraftItem[]) => {
      draftRef.current = next;
      setDraft(next);
      setTouched(true);
      if (!inline) return;
      const result = draftTotal(next);
      onValidityChange?.(result.valid);
      if (result.valid)
        onChange?.(
          next.map((item, sort_order) => ({
            label: item.label.trim(),
            amount: Number(cents(item.amount)) / 100,
            sort_order,
          })),
          result.total,
        );
    },
    [inline, draftTotal, onChange, onValidityChange],
  );
  const editItem = useCallback(
    (key: number, field: 'label' | 'amount', value: string) => {
      change(
        draftRef.current.map((item) =>
          item.key === key ? { ...item, [field]: value } : item,
        ),
      );
    },
    [change],
  );
  const openItemMenu = useCallback((anchor: HTMLElement, index: number) => {
    setItemMenu({ anchor, index });
  }, []);
  const currencySymbol = format.invoke(0).replace(/[\d.,\s]/g, '');
  const move = (index: number, offset: number) => {
    const next = [...draft];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    change(next);
  };
  const content = (
    <Box>
      {inline && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={1}
          sx={{ mb: 1.5, flexWrap: 'wrap' }}
        >
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography sx={{ fontSize: 13, fontWeight: 650 }}>
              {t('budgetBreakdown.title')}
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
              ({t('budgetBreakdown.plannedAmounts')})
            </Typography>
            <Tooltip title={t('budgetBreakdown.help')}>
              <InfoOutlined
                sx={{ fontSize: 14, color: 'text.secondary' }}
                tabIndex={0}
              />
            </Tooltip>
          </Stack>
          {!readOnly && (
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Add sx={{ fontSize: 15 }} />}
                sx={{
                  textTransform: 'none',
                  fontSize: 11,
                  borderRadius: 1.25,
                  color: theme.palette.mode === 'dark' ? '#f6bd42' : '#936600',
                  borderColor: alpha('#f6bd42', 0.6),
                  bgcolor: alpha('#f6bd42', 0.06),
                  px: 1,
                }}
                onClick={() =>
                  change([
                    ...draft,
                    {
                      key: Math.max(-1, ...draft.map((item) => item.key)) + 1,
                      label: '',
                      amount: '0',
                    },
                  ])
                }
              >
                {t('budgetBreakdown.addItem')}
              </Button>
              <Tooltip title={t('budgetBreakdown.singleHelp')} describeChild>
                <span>
                  <Button
                    size="small"
                    variant="outlined"
                    aria-label={t('budgetBreakdown.single')}
                    startIcon={<UnfoldLess sx={{ fontSize: 15 }} />}
                    disabled={!valid}
                    sx={{
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      fontSize: 11,
                      color: 'text.secondary',
                      borderColor: 'divider',
                      borderRadius: 1.25,
                      px: 1,
                    }}
                    onClick={() => {
                      onChange?.([], calculated);
                      draftRef.current = [];
                      setDraft([]);
                      wasOpen.current = false;
                      onValidityChange?.(true);
                      onClose();
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ display: { xs: 'none', sm: 'inline' } }}
                    >
                      {t('budgetBreakdown.single')}
                    </Box>
                    <Box
                      component="span"
                      sx={{ display: { xs: 'inline', sm: 'none' } }}
                    >
                      {t('budgetBreakdown.singleAmount')}
                    </Box>
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          )}
        </Stack>
      )}
      {inline && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: readOnly ? '1fr 100px' : '1fr 100px 36px',
            gap: 1,
            px: 1,
            pb: 0.75,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
            {t('budgetBreakdown.item')}
          </Typography>
          <Typography
            sx={{ fontSize: 11, color: 'text.secondary', textAlign: 'right' }}
          >
            {t('budgetBreakdown.amount')}
          </Typography>
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Stack spacing={inline ? 0 : 0.5}>
        {draft.map((item, index) => (
          <BreakdownItemRow
            key={item.key}
            item={item}
            index={index}
            inline={inline}
            readOnly={readOnly}
            busy={busy}
            touched={touched}
            invalidAmount={amounts[index] === null}
            currencySymbol={currencySymbol}
            onEdit={editItem}
            onMenu={openItemMenu}
          />
        ))}
      </Stack>
      <Menu
        anchorEl={itemMenu?.anchor}
        open={!!itemMenu}
        onClose={() => setItemMenu(null)}
      >
        <MenuItem
          disabled={!itemMenu || itemMenu.index === 0}
          onClick={() => {
            if (itemMenu) move(itemMenu.index, -1);
            setItemMenu(null);
          }}
        >
          <ListItemIcon>
            <ArrowUpward fontSize="small" />
          </ListItemIcon>
          {t('budgetBreakdown.up')}
        </MenuItem>
        <MenuItem
          disabled={!itemMenu || itemMenu.index === draft.length - 1}
          onClick={() => {
            if (itemMenu) move(itemMenu.index, 1);
            setItemMenu(null);
          }}
        >
          <ListItemIcon>
            <ArrowDownward fontSize="small" />
          </ListItemIcon>
          {t('budgetBreakdown.down')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (itemMenu)
              change(draft.filter((_, index) => index !== itemMenu.index));
            setItemMenu(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteOutline fontSize="small" color="error" />
          </ListItemIcon>
          {t('budgetBreakdown.remove')}
        </MenuItem>
      </Menu>
      {!inline && !readOnly && (
        <Button
          size="small"
          startIcon={<Add sx={{ fontSize: 16 }} />}
          disabled={busy}
          sx={{ mt: 1, px: 0.5, textTransform: 'none' }}
          onClick={() =>
            change([
              ...draft,
              {
                key: Math.max(-1, ...draft.map((item) => item.key)) + 1,
                label: '',
                amount: '0',
              },
            ])
          }
        >
          {t('budgetBreakdown.addItem')}
        </Button>
      )}
      {!valid && touched && !readOnly && (
        <Typography
          role="alert"
          variant="caption"
          color="error"
          sx={{ display: 'block', mt: 1 }}
        >
          {t('budgetBreakdown.invalid')}
        </Typography>
      )}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          mt: inline ? 0 : 2,
          pt: 1.5,
          px: inline ? 0.5 : 0,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {t('budgetBreakdown.total')}
        </Typography>
        <Typography
          aria-live="polite"
          sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
        >
          {format.invoke(calculated)}
        </Typography>
      </Stack>
      {!inline && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 0.75 }}
        >
          {t('budgetBreakdown.help')}
        </Typography>
      )}
    </Box>
  );
  if (inline)
    return (
      <Collapse in={open}>
        <Box
          role="region"
          aria-label={`${title}: ${t('budgetBreakdown.title')}`}
          sx={{
            border: '1px solid',
            borderColor: alpha(theme.palette.text.primary, 0.08),
            borderRadius: 1.5,
            background: alpha(theme.palette.text.primary, 0.035),
            p: { xs: 1.25, sm: 1.5 },
          }}
        >
          {content}
        </Box>
      </Collapse>
    );
  return (
    <>
      <Button
        size="small"
        onClick={onOpen}
        disabled={busy || (readOnly && !items.length)}
        aria-label={`${title}: ${actionLabel}`}
        title={actionLabel}
        sx={
          compact
            ? {
                minWidth: 0,
                px: 0.25,
                gap: 0.25,
                fontSize: 10,
                whiteSpace: 'nowrap',
              }
            : { textTransform: 'none' }
        }
      >
        {compact ? (
          <>
            <FormatListBulleted sx={{ fontSize: 14 }} />
            {items.length || '+'}
          </>
        ) : (
          actionLabel
        )}
      </Button>
      <Dialog
        open={open}
        onClose={busy ? undefined : onClose}
        fullWidth
        maxWidth="xs"
        fullScreen={mobile}
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        slotProps={{ paper: { sx: { borderRadius: mobile ? 0 : 3 } } }}
      >
        <DialogTitle id={titleId} sx={{ px: 3, pt: 3, pb: 2 }}>
          <Typography
            component="span"
            sx={{ display: 'block', fontSize: 20, fontWeight: 600 }}
          >
            {t('budgetBreakdown.title')}
          </Typography>
          <Typography component="span" variant="body2" color="text.secondary">
            {title}
          </Typography>
          <IconButton
            aria-label={t('budgetBreakdown.close')}
            onClick={onClose}
            disabled={busy}
            sx={{ position: 'absolute', top: 16, right: 16 }}
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2 }}>{content}</DialogContent>
        {!readOnly && (
          <DialogActions
            sx={{ px: 3, pb: 3, pt: 1, justifyContent: 'space-between' }}
          >
            <Tooltip title={t('budgetBreakdown.singleHelp')} describeChild>
              <span>
                <Button
                  disabled={busy || !valid}
                  onClick={() => void save(true)}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontSize: 12,
                  }}
                >
                  {t('budgetBreakdown.single')}
                </Button>
              </span>
            </Tooltip>
            <Button
              variant="contained"
              disableElevation
              disabled={busy || !valid}
              onClick={() => void save(false)}
              sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
            >
              {t(busy ? 'budgetBreakdown.saving' : 'budgetBreakdown.save')}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
}
