import { ShortfallAdjustmentType } from '../savings.ts';
import { useColorMode } from '@chakra-ui/system';
import { useEffect, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  CloseButton,
  HStack,
  Text
} from '@chakra-ui/react';

export const AlertBox = ({
  alertDescription,
  alertTitle,
  onKeepAdjustment,
  onResetAdjustment,
  shortfallAdjustmentType,
  status
}: {
  status: 'error' | 'warning' | 'info' | 'success' | 'loading';
  alertTitle: string;
  alertDescription: React.ReactNode;
  shortfallAdjustmentType?: ShortfallAdjustmentType;
  onKeepAdjustment: () => void;
  onResetAdjustment: () => void;
}) => {
  const { colorMode } = useColorMode();
  const [alertOpen, setAlertOpen] = useState(() => {
    const lsAlertOpen = localStorage.getItem('alertOpen');
    return lsAlertOpen ? lsAlertOpen === 'true' : true;
  });
  let colorScheme: string;
  let iconColor: string | undefined;
  switch (status) {
    case 'error':
      colorScheme = 'red';
      break;
    case 'warning':
      colorScheme = 'yellow';
      iconColor = 'orange.300';
      break;
    case 'info':
      colorScheme = 'cyan';
      break;
    case 'success':
    default:
      colorScheme = 'teal';
      break;
  }
  const onCloseAlert = () => setAlertOpen(false);
  const onOpenAlert = () => setAlertOpen(true);

  useEffect(() => {
    localStorage.setItem('alertOpen', alertOpen.toString());
  }, [alertOpen]);

  return (
    <>
      {alertOpen ? (
        <Box>
          <Alert status={status} colorScheme={colorScheme} variant="subtle" w={'auto'} py={2}>
            <AlertIcon color={iconColor} />
            <AlertTitle whiteSpace={'nowrap'}>{alertTitle}</AlertTitle>
            <AlertDescription w={'100%'} px={2}>
              <HStack justifyContent={'space-between'}>
                <Text maxW={700}>{alertDescription}</Text>
                {shortfallAdjustmentType && (
                  <Box pr={5}>
                    <Button
                      size={'xs'}
                      variant={'link'}
                      color={colorMode === 'light' ? '#333' : 'inherit'}
                      onClick={onKeepAdjustment}
                      mr={5}
                    >
                      Keep
                    </Button>
                    <Button
                      size={'xs'}
                      variant={'link'}
                      color={'#b0413e'}
                      onClick={onResetAdjustment}
                    >
                      Reset
                    </Button>
                  </Box>
                )}
              </HStack>
            </AlertDescription>
            <CloseButton alignSelf="flex-end" onClick={onCloseAlert} />
          </Alert>
        </Box>
      ) : (
        <Alert
          status={status}
          colorScheme={colorScheme}
          variant="transparent"
          w={'auto'}
          position={'absolute'}
          zIndex={1}
          top={'6px'}
          alignSelf="flex-end"
        >
          <AlertIcon onClick={onOpenAlert} color={iconColor} />
        </Alert>
      )}
    </>
  );
};
