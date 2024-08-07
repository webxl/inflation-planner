import { ResponsivePie } from '@nivo/pie';
import { BreakdownData, breakdownType } from '../savings.ts';
import { formatCurrency } from '../utils.ts';
import { BasicTooltip } from '@nivo/tooltip';
import { nivoThemes } from '../theme.ts';
import { useColorMode } from '@chakra-ui/system';
import { HStack } from '@chakra-ui/react';

const serieDefs: {
  [id in breakdownType]: {
    color: string;
    label: string;
  };
} = {
  initial: { color: 'hsl(54,84%,65%)', label: 'Initial Savings' },
  contributions: { color: 'hsl(9,87%,67%)', label: 'Total Contributions' },
  return: { color: 'hsl(170,52%,59%)', label: 'Total Return' },
  inflation: { color: 'rgb(232, 168, 56)', label: 'Total Inflation' },
  withdrawal: { color: 'rgb(151,204,227)', label: 'Total Withdrawal' }
};

function BreakdownPieChart(props: {
  data: {
    color: string | undefined;
    id: breakdownType;
    label: string | undefined;
    value: number;
  }[];
}) {
  const { colorMode } = useColorMode();

  return (
    <div style={{ height: 300, width: 480 }}>
      <ResponsivePie
        data={props.data}
        margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
        sortByValue={true}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 0.2]]
        }}
        arcLabel={e => formatCurrency(e.value)}
        theme={nivoThemes[colorMode]}
        arcLinkLabel={d => d.label.toString()}
        valueFormat={value => formatCurrency(value)}
        tooltip={e => {
          const { datum } = e;
          return (
            <BasicTooltip
              id={datum.label}
              value={datum.formattedValue}
              enableChip={true}
              color={datum.color}
            />
          );
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={colorMode === 'dark' ? '#AAA' : '#333'}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{
          from: 'color',
          modifiers: [['darker', 2]]
        }}
        arcLabelsSkipAngle={20}
        arcLabelsTextColor={{
          from: 'color',
          modifiers: [['darker', 2]]
        }}
        colors={{ datum: 'data.color' }}
        fill={[
          {
            match: {
              id: 'initial'
            },
            id: 'solid'
          },
          {
            match: {
              id: 'contributions'
            },
            id: 'dots'
          },
          {
            match: {
              id: 'return'
            },
            id: 'lines'
          }
        ]}
        /*legends={[
                              {
                                anchor: 'bottom',
                                direction: 'column',
                                justify: false,
                                translateX: 0,
                                translateY: 56,
                                itemsSpacing: 0,
                                itemWidth: 100,
                                itemHeight: 18,
                                itemTextColor: '#999',
                                itemDirection: 'left-to-right',
                                itemOpacity: 1,
                                symbolSize: 18,
                                symbolShape: 'circle',
                                effects: [
                                  {
                                    on: 'hover',
                                    style: {
                                      itemTextColor: '#000'
                                    }
                                  }
                                ]
                              }
                            ]}*/
      />
    </div>
  );
}

const BreakdownChart = ({ breakdownData }: { breakdownData: BreakdownData[] }) => {
  const gains = breakdownData
    .filter(
      d =>
        d.id === breakdownType.initial ||
        d.id === breakdownType.contributions ||
        d.id === breakdownType.return
    )
    .map(d => {
      return {
        id: d.id,
        value: d.value,
        label: serieDefs[d.id]?.label,
        color: serieDefs[d.id]?.color
      };
    });

  const losses = breakdownData
    .filter(d => d.id === breakdownType.inflation || d.id === breakdownType.withdrawal)
    .map(d => {
      return {
        id: d.id,
        value: d.value,
        label: serieDefs[d.id]?.label,
        color: serieDefs[d.id]?.color
      };
    });
  return (
    <HStack justifyContent={'space-evenly'}>
      <BreakdownPieChart data={gains} />
      <BreakdownPieChart data={losses} />
    </HStack>
  );
};
export default BreakdownChart;
