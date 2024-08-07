import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select
} from '@chakra-ui/react';
import CountryData, { yearMax, yearMin } from './charts/CountryData.tsx';
import React, { useCallback } from 'react';

import rawInflationData from './inflation.json';

// data from https://data-explorer.oecd.org/vis?lc=en&df[ds]=DisseminateArchiveDMZ&df[id]=DF_DP_LIVE&df[ag]=OECD&df[vs]=&av=true&pd=2009%2C2023&dq=CRI%2BCOL%2BCHL%2BHUN%2BGRC%2BDEU%2BFRA%2BFIN%2BEST%2BCZE%2BDNK%2BITA%2BISR%2BISL%2BIRL%2BJPN%2BKOR%2BLVA%2BLTU%2BLUX%2BMEX%2BNLD%2BNZL%2BNOR%2BPOL%2BPRT%2BSVK%2BSVN%2BESP%2BSWE%2BCHE%2BTUR%2BGBR%2BUSA%2BCAN%2BBEL%2BAUT%2BAUS%2BOAVG.CPI..AGRWTH.A&to[TIME_PERIOD]=false&vw=tb
// -> excel ->
// https://docs.google.com/spreadsheets/d/1ogFVKtk_PAKvkwqTOhmiBcXu3xqigTGV-jvRVdLXQIA/edit?gid=58786128#gid=58786128 -> csv
// cat inflation.csv | python3 -c 'import csv, json, sys; print(json.dumps([dict(r) for r in csv.DictReader(sys.stdin)]))' > tmp.json
// jq 'walk(if type == "string" and test("^-?[0-9]+(\\.[0-9]+)?$") then tonumber else . end)' tmp.json > src/inflation.json

// other possible data source: https://data.nasdaq.com/api/v3/datatables/MER/F1.json?&mapcode=-5370&compnumber=39102&reporttype=A&qopts.columns=reportdate,amount&api_key=UCe8Y9XMaifLhpTDM6Z_

const data: CountryData[] = rawInflationData;

export const InflationData = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [year, setYear] = React.useState('ALL');
  const [country, setCountry] = React.useState('United States');
  const selectYear = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry('ALL');
    setYear(e.target.value);
  }, []);

  const countries = React.useMemo(() => {
    return data.map(d => d.country);
  }, []);

  const onCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value);
    if (e.target.value === 'ALL') setYear('2021');
    else setYear('All');
  }, []);

  return (
    <Modal isOpen={open} onClose={onClose} size={'5xl'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Inflation Stats</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <HStack mb={4} borderRadius="md">
            <Select placeholder="Select country" onChange={onCountryChange} w={'250px'}>
              <option value="ALL">All</option>
              {countries.map(c => (
                <option key={c} value={c} selected={country === c}>
                  {c}
                </option>
              ))}
            </Select>
            {country === 'ALL' && (
              <Select placeholder="Select year" onChange={selectYear} value={year} w={'250px'}>
                {Array.from({ length: yearMax - yearMin + 1 }, (_, i) => (
                  <option key={i} value={yearMin + i}>
                    {yearMin + i}
                  </option>
                ))}
              </Select>
            )}
          </HStack>
          <CountryData country={country} year={parseInt(year)} data={data} />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} colorScheme="blue">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
