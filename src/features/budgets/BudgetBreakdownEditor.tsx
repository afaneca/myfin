import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Close,
  DeleteOutline,
  FormatListBulleted,
  MoreHoriz,
} from '@mui/icons-material';
import {
  Alert,
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
import { useEffect, useState, useId, useRef } from 'react';
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
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
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
    setDraft(
      items.length
        ? items.map((item, key) => ({
            key,
            label: item.label,
            amount: item.amount.toFixed(2),
          }))
        : readOnly
          ? []
          : [{ key: 0, label: '', amount: String(total) }],
    );
    if (inline && !readOnly && !items.length) onValidityChange?.(false);
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
  const draftTotal = (rows: DraftItem[]) => {
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
  };
  const change = (next: DraftItem[]) => {
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
  };
  const move = (index: number, offset: number) => {
    const next = [...draft];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    change(next);
  };
  const content = (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Stack spacing={0.5}>
        {draft.map((item, index) => (
          <Box
            key={item.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minHeight: 44,
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
                    fontSize: 14,
                    color:
                      touched && !item.label.trim()
                        ? 'error.main'
                        : 'text.primary',
                  }}
                  onChange={(event) =>
                    change(
                      draft.map((row) =>
                        row.key === item.key
                          ? { ...row, label: event.target.value }
                          : row,
                      ),
                    )
                  }
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
                      {format.invoke(0).replace(/[\d.,\s]/g, '')}
                    </Typography>
                  }
                  inputProps={{
                    'aria-label': t('budgetBreakdown.amount'),
                    inputMode: 'decimal',
                    style: { textAlign: 'right' },
                  }}
                  sx={{
                    width: { xs: 76, sm: 96 },
                    fontSize: 14,
                    fontVariantNumeric: 'tabular-nums',
                    color:
                      amounts[index] === null ? 'error.main' : 'text.primary',
                  }}
                  onChange={(event) =>
                    change(
                      draft.map((row) =>
                        row.key === item.key
                          ? { ...row, amount: event.target.value }
                          : row,
                      ),
                    )
                  }
                />
                <IconButton
                  className="item-actions"
                  aria-label={t('budgetBreakdown.options')}
                  aria-haspopup="menu"
                  size="small"
                  disabled={busy}
                  onClick={(event) =>
                    setItemMenu({ anchor: event.currentTarget, index })
                  }
                  sx={{
                    opacity: { xs: 1, sm: 0.35 },
                    transition: 'opacity 150ms',
                    width: 36,
                    height: 36,
                  }}
                >
                  <MoreHoriz sx={{ fontSize: 20 }} />
                </IconButton>
              </>
            )}
          </Box>
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
      {!readOnly && (
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
          mt: 2,
          pt: 1.5,
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
      {inline && !readOnly && (
        <Button
          size="small"
          disabled={!valid}
          sx={{ mt: 1, px: 0, color: 'text.secondary', textTransform: 'none' }}
          onClick={() => {
            onChange?.([], calculated);
            setDraft([]);
            wasOpen.current = false;
            onValidityChange?.(true);
            onClose();
          }}
        >
          {t('budgetBreakdown.single')}
        </Button>
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
            borderTop: '1px solid',
            borderColor: 'divider',
            pt: 2,
            px: { xs: 0, sm: 1 },
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
