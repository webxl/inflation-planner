import { useCallback } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Text,
  VStack
} from '@chakra-ui/react';
import { appName } from './const.ts';

export const WelcomeModal = ({
  open,
  onClose,
  value,
  onChange
}: {
  open: boolean;
  onClose: () => void;
  value: number;
  onChange: (age: number) => void;
}) => {
  const handleOnChange = useCallback(
    (_: string, value: number) => {
      if (value > 100) {
        value = 100;
      }
      onChange(value);
    },
    [onChange]
  );

  return (
    <Modal isOpen={open} onClose={onClose} size={'2xl'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Welcome to {appName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4} alignItems={'flex-start'}>
            <Text>
              This app is designed to help you plan for retirement by visualizing how your savings
              (in today's dollars) will be affected by inflation and other factors. You can adjust
              the parameters on the left to see how they impact your savings over time. If your
              savings balance is projected to fall below zero before the end of the withdrawal
              period, the shortfall will be plotted in red, and you will receive a warning message.
            </Text>
            <Text>
              In order to prevent a shortfall, you can adjust your parameters or select a correction
              option from the dropdown menu in the Projections table. If a correction is selected,
              the calculator will adjust your parameters to prevent a shortfall as closely as
              possible while holding all other parameters constant. If you would like to keep the
              adjustment, click the "Keep" button. To return to the previous parameters, click the
              "Reset" button.
            </Text>
            <Text>
              If you have any questions or feedback, please feel free to reach out at{' '}
              <Link isExternal href="mailto:site@webxl.net">
                site@webxl.net
              </Link>
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <FormControl>
            <HStack>
              <FormLabel>How old are you?</FormLabel>
              <NumberInput
                value={value}
                w={'100px'}
                onFocus={e => e.target.select()}
                onChange={handleOnChange}
                max={100}
                min={5}
              >
                <NumberInputField />
              </NumberInput>
            </HStack>
          </FormControl>{' '}
          <Button onClick={onClose} colorScheme="blue">
            Get Started
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
