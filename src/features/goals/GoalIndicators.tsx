import { Flag, LowPriority, MoneyOff } from '@mui/icons-material';
import { Box, Chip, Tooltip } from '@mui/material';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export const PriorityTooltip = ({ children }: { children: ReactElement }) => {
  const { t } = useTranslation();

  return <Tooltip title={t('goals.priorityHelp')}>{children}</Tooltip>;
};

export const GoalPriorityChip = ({ priority }: { priority: number }) => {
  const { t } = useTranslation();

  return (
    <PriorityTooltip>
      <Chip
        icon={<Flag fontSize="small" />}
        label={priority}
        size="small"
        variant="outlined"
        tabIndex={0}
        aria-label={`${t('goals.priority')} ${priority}. ${t('goals.priorityHelp')}`}
      />
    </PriorityTooltip>
  );
};

export const UnderfundedIndicator = ({
  isUnderfundedByPriority,
}: {
  isUnderfundedByPriority: boolean;
}) => {
  const { t } = useTranslation();
  const tooltip = t(
    isUnderfundedByPriority
      ? 'goals.underfundedByPriorityTooltip'
      : 'goals.underfundedTooltip',
  );
  const Icon = isUnderfundedByPriority ? LowPriority : MoneyOff;

  return (
    <Tooltip title={tooltip}>
      <Box
        component="span"
        tabIndex={0}
        role="img"
        aria-label={tooltip}
        sx={{ display: 'inline-flex', color: 'warning.main' }}
      >
        <Icon fontSize="small" />
      </Box>
    </Tooltip>
  );
};
