import { ResponsivePie } from '@nivo/pie';
import { BreakdownData, breakdownType } from '../savings.ts';
import { formatCurrency } from '../utils.ts';
import { BasicTooltip } from '@nivo/tooltip';
import { nivoThemes } from '../theme.ts';
import { useColorMode } from '@chakra-ui/system';
import { Box, HStack, Table, Th, Thead, VStack } from '@chakra-ui/react';

const serieDefs: {
  [id in breakdownType]: {
    color: string;
    label: string;
  };
} = {
  initial: { color: 'hsl(54,84%,65%)', label: 'Initial' },
  contributions: { color: 'hsl(9,87%,67%)', label: 'Contributions' },
  return: { color: 'hsl(170,52%,59%)', label: 'Returns' },
  inflation: { color: 'rgb(232, 168, 56)', label: 'Inflation' },
  withdrawal: { color: 'rgb(151,204,227)', label: 'Withdrawal' }
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
    <Box height={{ base: 200, xl: 300, lg: 200 }} width={{ base: 400, xl: 450, lg: 350 }}>
      <ResponsivePie
        data={props.data}
        margin={{ top: 30, right: 80, bottom: 30, left: 80 }}
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
        arcLinkLabelsThickness={1}
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
      />
    </Box>
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
    <HStack flexWrap={'wrap'} w={'100%'} gap={0} justifyContent={'space-between'}>
      <VStack w={{ base: '100%', lg: '50%' }} minW={400} p={0}>
        <Table width={'100%'} as={'div'}>
          <Thead as={'div'}>
            <Th as={'div'} borderBottom={0}>
              Total Savings
            </Th>
          </Thead>
        </Table>
        <BreakdownPieChart data={gains} />
      </VStack>
      <VStack w={{ base: '100%', lg: '50%' }} p={0} minW={{ xl: 460 }} minH={200}>
        <Table width={'100%'} as={'div'}>
          <Th as={'div'} borderBottom={0} paddingInline={6} py={3}>
            Total Consumption
          </Th>
        </Table>
        <BreakdownPieChart data={losses} />
      </VStack>
    </HStack>
  );
};
export default BreakdownChart;
