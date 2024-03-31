import { SxProps, Theme, useTheme } from '@mui/material';
import Stack from '@mui/material/Stack/Stack';
import { ResponsivePie } from '@nivo/pie';
import {
  generateDefsForGradients,
  generateFillArrayForGradients,
} from '../../utils/nivoUtils.ts';

import Paper from '@mui/material/Paper/Paper';

export interface ChartDataItem {
  id: string;
  color: string;
  value: number;
}

interface Props {
  data: ChartDataItem[];
  sx?: SxProps<Theme> | undefined;
}

const DashboardPieChart = ({ data, sx }: Props) => {
  const theme = useTheme();

  const truncateFromMiddle = (
    fullStr = '',
    strLen: number = 20,
    middleStr = '...',
  ) => {
    if (fullStr.length <= strLen) return fullStr;
    const midLen = middleStr.length;
    const charsToShow = strLen - midLen;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);
    return (
      fullStr.substring(0, frontChars) +
      middleStr +
      fullStr.substring(fullStr.length - backChars)
    );
  };
  return (
    <Stack
      sx={{
        height: {
          xs: 400,
          md: 300,
          lg: 400,
        },
        ...sx,
      }}
    >
      <ResponsivePie
        data={data}
        margin={{ top: 80, right: 80, bottom: 80, left: 80 }}
        animate={true}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={0}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsThickness={2}
        enableArcLinkLabels={true}
        enableArcLabels={false}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: 'color',
          modifiers: [['darker', 4]],
        }}
        defs={generateDefsForGradients()}
        fill={generateFillArrayForGradients()}
        arcLinkLabel={(e) => truncateFromMiddle(e.id + '')}
        tooltip={(item) => (
          <Paper
            sx={{
              fontSize: '12px',
              background: 'white',
              color: 'black',
              p: theme.spacing(1),
            }}
          >
            {item.datum.label}: <strong>{item.datum.formattedValue}</strong>
          </Paper>
        )}
        theme={theme.nivo}
      />
    </Stack>
  );
};

export default DashboardPieChart;
