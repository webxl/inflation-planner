import { ResponsiveBar } from '@nivo/bar';
import { VStack } from '@chakra-ui/react';
import React from 'react';
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { ResponsiveLine } from '@nivo/line';

export const yearMin = 2009;
export const yearMax = 2022;

type CountryData = {
  [year: string]: string | number;
};

// @ts-expect-error library issue
const CustomizedAxisTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
        {payload.value}
      </text>
    </g>
  );
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

  const rechartData = React.useMemo(() => {
    if (country === 'ALL')
      return data.map(d => ({
        name: d.country,
        inflation: d[year.toString()] as number
      }));

    const singleCountry = data.find(d => d.country === country) ?? {};
    const singleCountryData = yearKeys.map(y => ({
      name: y,
      inflation: singleCountry[y.toString()] as number
    }));
    return singleCountryData;
  }, [country, data, year, yearKeys]);

  console.log('nivoData', nivoData);
  return (
    <VStack w={'100%'}>
      <div style={{ height: 400, width: '100%', background: 'white' }}>
        {country === 'ALL' ? (
          <ResponsiveBar
            data={nivoData}
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
            data={nivoData}
            colors={{ scheme: 'category10' }}
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
      <div style={{ height: 500, width: '100%', background: 'white' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={rechartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 50
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={'name'} tick={CustomizedAxisTick} />
            <YAxis />
            <Tooltip />
            {/*<Legend rotate={45} />*/}
            {/*{rechartKeys.map((key) => (*/}
            <Bar
              dataKey={'inflation'}
              key={'name'}
              fill="#8884d8"
              activeBar={<Rectangle fill="pink" stroke="blue" />}
            />
            {/*))}*/}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </VStack>
  );
};

export default CountryData;
