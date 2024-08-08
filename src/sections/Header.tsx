import { useColorMode } from '@chakra-ui/system';
import { Button, Heading, HStack, IconButton, useBreakpointValue } from '@chakra-ui/react';
import { appName } from '../const.ts';
import { Icon, MoonIcon, QuestionIcon, SunIcon } from '@chakra-ui/icons';
import { BarChart } from 'react-feather';

export const Header = (props: { onClickStats: () => void; onClickHelp: () => void }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const statsButtonType = useBreakpointValue({
    base: 'icon',
    md: 'text'
  });

  return (
    <HStack
      w={'100%'}
      backgroundColor={colorMode === 'light' ? 'white' : 'gray.800'}
      borderBottom={`1px solid`}
      borderBottomColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
      justifyContent={'space-between'}
      height={'50px'}
      px={5}
      position={'fixed'}
      top={0}
      zIndex={2}
    >
      <Heading size={'lg'} as={'h1'} fontWeight={400}>
        {appName}
      </Heading>
      <HStack>
        {statsButtonType === 'text' ? (
          <Button variant={'ghost'} onClick={props.onClickStats}>
            Inflation Stats
          </Button>
        ) : (
          <IconButton
            aria-label={'stats'}
            icon={<Icon as={BarChart} />}
            variant={'ghost'}
            onClick={props.onClickStats}
          />
        )}
        <IconButton
          aria-label={'help'}
          icon={<QuestionIcon />}
          variant={'ghost'}
          onClick={props.onClickHelp}
        />
        <IconButton
          aria-label="Toggle Dark Mode"
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          variant={'ghost'}
        />
      </HStack>
    </HStack>
  );
};
