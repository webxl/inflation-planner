import { ResponsiveBar } from '@nivo/bar';
import { VStack } from '@chakra-ui/react';
import React from 'react';
import { ResponsiveLine, Serie } from '@nivo/line';
import { nivoThemes } from '../theme.ts';
import { useColorMode } from '@chakra-ui/system';

export const yearMin = 2009;
export const yearMax = 2022;

type CountryData = {
  country: string;
  [year: string]: string | number;
};

const CountryData = ({
  country,
  year,
  data
}: {
  country: string;
  year: number;
  data: CountryData[];
}) => {
  const yearKeys = React.useMemo(() => {
    return country === 'ALL'
      ? [year.toString()]
      : Array.from({ length: yearMax - yearMin + 1 }, (_, i) => (yearMin + i).toString());
  }, [country, year]);

  const nivoData = React.useMemo(() => {
    if (country === 'ALL') return data;
    return data
      .filter(d => d.country === country)
      .map(d => ({
        id: country,
        data: yearKeys
          .map(y => ({
            x: y,
            y: parseFloat(d[y.toString()]?.toString() ?? '')
          }))
          .filter(d => !!d.y)
      }));
  }, [country, data, yearKeys]);

  const colorMode = useColorMode().colorMode;
  return (
    <VStack w={'100%'}>
      <div style={{ height: 400, width: '100%' }}>
        {country === 'ALL' ? (
          <ResponsiveBar
            data={nivoData as CountryData[]}
            theme={nivoThemes[colorMode]}
            keys={yearKeys}
            indexBy="country"
            margin={{ top: 10, right: 20, bottom: 80, left: 20 }}
            padding={0.3}
            groupMode="grouped"
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={{ scheme: 'category10' }}
            colorBy={'indexValue'}
            borderColor={{
              from: 'color',
              modifiers: [['darker', 1.6]]
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: country === 'ALL' ? -45 : 0,
              legend: 'Country',
              legendPosition: 'middle',
              legendOffset: 70,
              truncateTickAt: 0
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'CPI % chg',
              legendPosition: 'middle',
              legendOffset: -40,
              truncateTickAt: 0
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            enableLabel={false}
            layout="vertical"
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20,
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemOpacity: 1
                    }
                  }
                ]
              }
            ]}
            role="application"
            ariaLabel="Inflation chart"
            barAriaLabel={e => e.id + ': ' + e.formattedValue + ' in country: ' + e.indexValue}
          />
        ) : (
          <ResponsiveLine
            data={nivoData as Serie[]}
            colors={{ scheme: 'category10' }}
            theme={nivoThemes[colorMode]}
            xScale={{
              type: 'linear',
              min: 'auto',
              max: 'auto'
            }}
            yScale={{
              type: 'linear',
              min: 'auto',
              max: Math.max(
                10,
                Math.max(...nivoData.flatMap(d => (d.data as { y: number }[]).map(p => p.y)))
              ),
              nice: true
            }}
            axisLeft={{
              legend: 'Inflation % change',
              legendOffset: 12,
              legendPosition: 'middle'
            }}
            axisBottom={{
              tickSize: 10,
              tickPadding: 5,
              tickRotation: -45,
              legendOffset: 0,
              legendPosition: 'middle'
            }}
            margin={{ top: 10, right: 10, bottom: 60, left: 25 }}
            enableSlices={'x'}
            xFormat={'time:%b %Y'}
            yFormat=" >-.2f"
          />
        )}
      </div>
    </VStack>
  );
};

export default CountryData;
