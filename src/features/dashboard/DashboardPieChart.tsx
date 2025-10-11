import { SxProps, Theme, useMediaQuery, useTheme } from '@mui/material';
import Stack from '@mui/material/Stack';
import { PieSvgProps, ResponsivePie, DefaultRawDatum } from '@nivo/pie';
import {
  generateDefsForGradients,
  generateFillArrayForGradients,
} from '../../utils/nivoUtils.ts';

import Paper from '@mui/material/Paper';
import { formatNumberAsCurrency } from '../../utils/textUtils.ts';
import EmptyView from '../../components/EmptyView.tsx';

export interface ChartDataItem {
  id: string;
  color: string;
  value: number;
  altValue?: string;
}

interface Props {
  data: ChartDataItem[];
  sx?: SxProps<Theme> | undefined;
  customPieProps?: Partial<PieSvgProps<DefaultRawDatum>>;
  linkLabelTruncateLimit?: number;
}

const DashboardPieChart = ({
  data,
  sx,
  customPieProps,
  linkLabelTruncateLimit,
}: Props) => {
  const theme = useTheme();
  const matchesMdScreen = useMediaQuery(theme.breakpoints.down('md'));

  const truncateFromMiddle = (
    fullStr = '',
    strLen: number = linkLabelTruncateLimit ?? 20,
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

  interface CustomDatum extends DefaultRawDatum {
    altValue?: string; // add any other custom fields here
  }

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
      {data && data.length > 0 ? (
        <ResponsivePie<CustomDatum>
          data={data}
          margin={
            matchesMdScreen
              ? { top: 20, right: 20, bottom: 20, left: 20 }
              : { top: 60, right: 60, bottom: 60, left: 60 }
          }
          animate={true}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderWidth={0}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsThickness={2}
          enableArcLinkLabels={!matchesMdScreen}
          enableArcLabels={matchesMdScreen}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{
            from: 'color',
            modifiers: [['darker', 4]],
          }}
          valueFormat={(value) => formatNumberAsCurrency(value)}
          defs={generateDefsForGradients()}
          // @ts-expect-error could assume different structural identities
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
              {item.datum.label}: <strong>{item.datum.formattedValue}</strong>{' '}
              {item.datum.data.altValue && `(${item.datum.data.altValue})`}
            </Paper>
          )}
          theme={theme.nivo}
          {...customPieProps}
        />
      ) : (
        <EmptyView />
      )}
    </Stack>
  );
};

export default DashboardPieChart;
