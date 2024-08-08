import { Datum, ResponsiveLine, Serie } from '@nivo/line';
import { linearGradientDef } from '@nivo/core';
import { nivoThemes } from '../theme.ts';
import { useColorMode } from '@chakra-ui/system';
import { useEffect, useState } from 'react';
import round from 'lodash/round';
import { SavingsFormData } from '../savings.ts';
import dayjs from 'dayjs';
import { Box } from '@chakra-ui/react';

export type SavingsBalanceData = {
  x: Date;
  y: number;
};

// helpers to convert SavingsBalanceData to nivo Datum
const convertNegativeDP = (dp: SavingsBalanceData | undefined) => ({
  x: dp ? dp.x.toISOString().split('T')[0] : '',
  y: dp && dp.y < 0 ? dp.y : null
});
const convertPositiveDP = (dp: SavingsBalanceData | undefined) => ({
  x: dp ? dp.x.toISOString().split('T')[0] : '',
  y: dp && dp.y >= 0 ? dp.y : null
});

const SavingsChart = ({
  savingsBalanceData,
  parameters
}: {
  savingsBalanceData: SavingsBalanceData[];
  parameters: SavingsFormData;
}) => {
  const { colorMode } = useColorMode();
  const [chartData, setChartData] = useState<Serie[]>([]);
  const [yScaleMin, setYScaleMin] = useState<number>(0);
  const [yScaleMax, setYScaleMax] = useState<number>(0);
  const [gridYValues, setGridYValues] = useState<number[] | undefined>();

  useEffect(() => {
    if (savingsBalanceData.length === 0) return;

    // start with user specified contribution start date
    const positiveSery: Datum[] = [convertPositiveDP(savingsBalanceData[0])];
    const negativeSery: Datum[] = [convertNegativeDP(savingsBalanceData[0])];
    let exhaustedPoint: SavingsBalanceData | null =
      savingsBalanceData.slice(1).find(b => b.y <= 0) ?? null;
    let maxY = 0;

    const dpEach = (dp: SavingsBalanceData, i: number) => {
      // fix gap between positive and negative series:
      const previousWasPositive =
        i > 0 && dp.y <= 0 && ((positiveSery[i - 1]?.y as number) ?? 0) > 0;

      if (previousWasPositive && exhaustedPoint) {
        positiveSery.push(convertNegativeDP(dp));
        exhaustedPoint = null;
      }

      negativeSery.push(convertNegativeDP(dp));
      positiveSery.push(convertPositiveDP(dp));

      if (dp.y > maxY) maxY = dp.y;
    };

    /*
     reduce dataset by taking each january 1st, the datapoint that's closest to the wd start date (1st of the same
     month & year, and the point at which the balance is exhausted so that we can generate a continuous series composed
     of the positive & negative points with their own colors
    */
    savingsBalanceData
      .filter(
        dp =>
          (dp.x.getDate() === 1 &&
            (dp.x.getMonth() === 0 ||
              (dp.x.getFullYear() === dayjs(parameters.withdrawalStart).get('year') &&
                dp.x.getMonth() === dayjs(parameters.withdrawalStart).get('month')))) ||
          (dp.x.getDate() === dayjs(exhaustedPoint?.x).get('date') &&
            dp.x.getFullYear() === dayjs(exhaustedPoint?.x).get('year') &&
            dp.x.getMonth() === dayjs(exhaustedPoint?.x).get('month'))
      )
      .forEach(dpEach);

    // end with user specified withdrawal end date
    positiveSery.push(convertPositiveDP(savingsBalanceData[savingsBalanceData.length - 1]));
    negativeSery.push(convertNegativeDP(savingsBalanceData[savingsBalanceData.length - 1]));

    setChartData([
      {
        id: 'SavingsBalance',
        data: positiveSery
      },
      {
        id: 'SavingsBalanceNegative',
        data: negativeSery
      }
    ]);

    const minY = Math.min(
      savingsBalanceData[savingsBalanceData.length - 1]?.y,
      savingsBalanceData[0]?.y,
      0
    );
    setYScaleMin(minY);
    setYScaleMax(Math.max(round(maxY, -5), maxY + 10000));
    setGridYValues([negativeSery.length ? minY : 0, Math.max(round(maxY, -5), maxY + 10000)]);
  }, [parameters, savingsBalanceData]);

  const withdrawalStart = dayjs(parameters.withdrawalStart).toDate();
  return chartData.length ? (
    <Box height={350} style={{ touchAction: 'none' }} minW={0} width={'auto'}>
      <ResponsiveLine
        data={chartData}
        colors={['rgb(97, 205, 187)', 'rgb(244, 117, 96)']}
        margin={{ top: 10, right: 1, bottom: 40, left: 40 }}
        theme={nivoThemes[colorMode]}
        crosshairType="x"
        enableArea
        areaOpacity={0.7}
        xFormat={'time:%b %Y'}
        yFormat=" >-$,.0f"
        xScale={{
          type: 'time',
          format: '%Y-%m-%d',
          useUTC: false,
          precision: 'month'
        }}
        gridXValues={[
          savingsBalanceData[0]?.x,
          savingsBalanceData[savingsBalanceData.length - 1]?.x
        ]}
        yScale={{
          type: 'linear',
          min: yScaleMin,
          max: yScaleMax
          // nice: 50,
          // clamp: true
        }}
        gridYValues={gridYValues}
        motionConfig={'wobbly'}
        axisBottom={{
          format: '%Y',
          tickPadding: 5,
          tickRotation: -35,
          tickValues: 'every 5 years',
          legendOffset: 0,
          legendPosition: 'middle'
        }}
        axisLeft={{
          format: '>-$,.2s',
          tickPadding: 5,
          tickValues: 5,
          legendOffset: 0,
          legendPosition: 'middle'
        }}
        pointSize={0}
        pointBorderWidth={1}
        pointLabel="data.yFormatted"
        pointBorderColor={{
          from: 'color',
          modifiers: [['darker', 0.3]]
        }}
        pointLabelYOffset={-20}
        enableTouchCrosshair={true}
        enableSlices="x"
        sliceTooltip={({ slice }) => {
          const point = slice.points[0];
          return (
            <div
              style={{
                background: colorMode === 'dark' ? '#333' : '#fff',
                padding: '9px 12px',
                border: '1px solid #ccc'
              }}
            >
              <div
                key={point.id}
                style={{
                  color: colorMode === 'dark' ? '#ccc' : '#333',
                  padding: '3px 0'
                }}
              >
                {point.data.xFormatted}:{' '}
                <span
                  style={{
                    color: point.serieColor
                  }}
                >
                  {' '}
                  {point.data.yFormatted}{' '}
                </span>
              </div>
            </div>
          );
        }}
        defs={[
          linearGradientDef('SavingsBalance', [
            { offset: 0, color: 'rgb(97, 205, 187)' },
            { offset: 100, color: 'rgb(97, 205, 187)', opacity: 0 }
          ]),
          linearGradientDef('SavingsBalanceNegative', [
            { offset: 0, color: 'rgb(244, 117, 96)', opacity: 0 },
            { offset: 100, color: 'rgb(244, 117, 96)' }
          ])
        ]}
        legends={[]}
        fill={[
          { match: { id: 'SavingsBalance' }, id: 'SavingsBalance' },
          { match: { id: 'SavingsBalanceNegative' }, id: 'SavingsBalanceNegative' }
        ]}
        markers={[
          {
            axis: 'x',
            legend: 'Withdrawal Start',
            legendOrientation: 'vertical',
            legendPosition: 'bottom-left',
            lineStyle: {
              stroke: '#b0413e',
              strokeWidth: 1,
              zIndex: 10
            },
            textStyle: {
              fill: colorMode === 'dark' ? '#AAA' : '#333',
              fontFamily: 'Nunito Variable',
              fontSize: '14px'
            },
            value:
              withdrawalStart > savingsBalanceData[0]?.x
                ? withdrawalStart
                : savingsBalanceData[0]?.x
          }
        ]}
        layers={[
          'grid',
          'areas',
          'axes',
          'crosshair',
          'lines',
          'points',
          'markers',
          'legends',
          'slices',
          'mesh'
        ]}
      />
    </Box>
  ) : null;
};

export default SavingsChart;
