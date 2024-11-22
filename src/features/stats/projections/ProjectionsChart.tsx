import MyFinLineChart from '../../../components/MyFinLineChart.tsx';
import { ProjectionStatsItem } from '../../../services/stats/statHooks.ts';
import { useMemo, useState } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel/FormControlLabel';
import { Checkbox, FormGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Unstable_Grid2/Grid2';

type Props = {
  list: ProjectionStatsItem[];
};

const ProjectionsChart = (props: Props) => {
  const { t } = useTranslation();
  const [ignoreDebt, setIgnoreDebt] = useState(false);

  const chartData = useMemo(() => {
    return [
      {
        id: 'projected_balance',
        data: props.list.map((item) => ({
          x: `${item.month}/${item.year}`,
          y: ignoreDebt ? item.finalBalanceAssets : item.finalBalance,
        })),
      },
    ];
  }, [props.list, ignoreDebt]);
  /*return <MyFinLineChart chartData={chartData} />;*/
  return (
    <Grid container>
      <Grid xs={12} display="flex" justifyContent="flex-end">
        <FormGroup sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <FormControlLabel
            sx={{ width: 'auto' }}
            control={
              <Checkbox
                checked={ignoreDebt}
                onChange={(_, checked) => setIgnoreDebt(checked)}
              />
            }
            label={t('stats.ignoreDebt')}
          />
        </FormGroup>
      </Grid>

      <Grid xs={12} height={420}>
        <MyFinLineChart chartData={chartData} />
      </Grid>
    </Grid>
  );
};

export default ProjectionsChart;
