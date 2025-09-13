import { useTheme } from '@mui/material';
import { ResponsiveSankey } from '@nivo/sankey';
import { useFormatNumberAsCurrency } from '../utils/textHooks.ts';

export type SankeyNode = {
  id: string;
  color: string;
};

export type SankeyLink = {
  source: string;
  target: string;
  value: number;
};

export type SankeyDiagramData = {
  nodes: SankeyNode[];
  links: SankeyLink[];
};

type Props = {
  chartData: SankeyDiagramData;
};

const MyFinSankeyDiagram = (props: Props) => {
  const theme = useTheme();
  const formatNumberAsCurrency = useFormatNumberAsCurrency();

  return (
    <ResponsiveSankey
      data={props.chartData}
      align="justify"
      colors={{ scheme: 'category10' }}
      nodeOpacity={1}
      nodeHoverOthersOpacity={0.35}
      nodeThickness={18}
      nodeSpacing={24}
      nodeBorderWidth={0}
      nodeBorderRadius={3}
      linkOpacity={0.5}
      linkHoverOthersOpacity={0.1}
      linkContract={3}
      enableLinkGradient={true}
      labelPosition="inside"
      labelOrientation="horizontal"
      labelPadding={16}
      valueFormat={(value) => formatNumberAsCurrency.invoke(value)}
      linkBlendMode={theme.palette.mode === 'dark' ? 'lighten' : 'multiply'}
      labelTextColor={{
        from: 'color',
        modifiers: [
          theme.palette.mode === 'dark' ? ['brighter', 1] : ['darker', 1.5],
        ],
      }}
      theme={theme.nivo}
    />
  );
};

export default MyFinSankeyDiagram;
