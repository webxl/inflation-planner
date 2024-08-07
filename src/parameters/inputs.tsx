import { useCallback, useEffect, useRef, useState } from 'react';
import { formatCurrency, formatPercentage } from '../utils.ts';
import {
  Box,
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  Tooltip
} from '@chakra-ui/react';
import { Icon } from '@chakra-ui/icons';
import round from 'lodash/round';
import dayjs from 'dayjs';
import { Info, X } from 'react-feather';
import { useColorMode } from '@chakra-ui/system';

export const DollarAmountInput = ({
  onChange,
  label,
  value,
  step = 1000,
  tooltip,
  isDisabled,
  highlight,
  useOverride
}: {
  onChange: (val: number) => void;
  label: string;
  value: number;
  step?: number;
  tooltip?: string;
  isDisabled?: boolean;
  highlight?: boolean;
  useOverride?: boolean;
}) => {
  const parse = (val: string) => parseFloat(val.replace(/[$,]/g, ''));
  const colorMode = useColorMode();
  const _onChange = useCallback(
    (val: string) => {
      setFormattedAmount(val);
      onChange(parse(val));
    },
    [onChange]
  );

  const [formattedAmount, setFormattedAmount] = useState(formatCurrency(value));
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onBlur = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setFormattedAmount(formatCurrency(value)), 200);
  }, [value]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  const onFocus = useCallback(() => {
    if (!highlight) setFormattedAmount(value.toString());
  }, [highlight, value]);

  const [restoreAmount, setRestoreAmount] = useState<number | undefined>();
  useEffect(() => {
    if (highlight && !restoreAmount) {
      setRestoreAmount(value);
    }
    if (highlight || useOverride) {
      setFormattedAmount(formatCurrency(value));
    }
    if (!highlight && restoreAmount) {
      setFormattedAmount(formatCurrency(restoreAmount));
      setRestoreAmount(undefined);
    }
  }, [highlight, restoreAmount, value, useOverride]);

  const handleClear = useCallback(() => {
    setFormattedAmount(formatCurrency(0));
    onChange(0);
  }, [onChange]);

  return (
    <FormControl>
      <Label label={label} tooltip={tooltip} isDisabled={isDisabled && !highlight} />
      <InputGroup size="sm">
        <NumberInput
          onChange={_onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          value={formattedAmount}
          // value={formatCurrency(value)}
          min={0}
          max={99999999999}
          step={step}
          isDisabled={isDisabled && !highlight}
          isReadOnly={highlight}
          borderColor={highlight ? 'green' : useOverride ? 'orange' : 'inherit'}
          backgroundColor={colorMode.colorMode === 'dark' ? 'gray.800' : 'white'}
          title={value.toString()}
          w={'100%'}
        >
          <NumberInputField fontWeight={highlight ? '700' : 'normal'} />
          <InputRightElement
            children={<Icon as={X} size={'xs'} color={'#888'} mr={12} />}
            data-test="input-clear-button"
            onClick={handleClear}
            zIndex={1}
            opacity={highlight ? 0.3 : 1}
            style={highlight ? { pointerEvents: 'none', cursor: 'not-allowed' } : {}}
          />
          <Box sx={highlight ? { div: { pointerEvents: 'none', cursor: 'not-allowed' } } : {}}>
            <NumberInputStepper>
              <NumberIncrementStepper opacity={highlight ? 0.3 : 1} />
              <NumberDecrementStepper opacity={highlight ? 0.3 : 1} />
            </NumberInputStepper>
          </Box>
        </NumberInput>
      </InputGroup>
    </FormControl>
  );
};

export const PercentageAmountInput = ({
  onChange,
  label,
  value,
  tooltip,
  isDisabled,
  highlight,
  useOverride
}: {
  onChange: (val: number) => void;
  label: string;
  value: number;
  tooltip?: string;
  isDisabled?: boolean;
  highlight?: boolean;
  useOverride?: boolean;
}) => {
  const parse = (val: string) => round(parseFloat(val.replace(/%/, '')) / 100, 4);
  const colorMode = useColorMode();

  const _onChange = useCallback(
    (val: string) => {
      setFormattedAmount(val);
      onChange(parse(val));
    },
    [onChange]
  );

  const [formattedAmount, setFormattedAmount] = useState(formatPercentage(value));

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onBlur = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setFormattedAmount(formatPercentage(value)), 500);
  }, [value]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  const onFocus = useCallback(() => {
    if (!highlight) setFormattedAmount(round(value * 100, 2).toString());
  }, [highlight, value]);

  const [restoreAmount, setRestoreAmount] = useState<number | undefined>();

  useEffect(() => {
    if (highlight && !restoreAmount) {
      setRestoreAmount(value);
    }
    if (highlight || useOverride) {
      setFormattedAmount(formatPercentage(value));
    }
    if (!highlight && restoreAmount) {
      setFormattedAmount(formatPercentage(restoreAmount));
      setRestoreAmount(undefined);
    }
  }, [highlight, useOverride, restoreAmount, value]);

  const handleClear = useCallback(() => {
    onChange(0);
    setFormattedAmount(formatPercentage(0));
  }, [onChange]);

  return (
    <FormControl>
      <Label label={label} tooltip={tooltip} isDisabled={isDisabled && !highlight} />
      <InputGroup size="sm">
        <NumberInput
          onChange={_onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          value={formattedAmount}
          min={0}
          max={100}
          step={0.1}
          isDisabled={isDisabled && !highlight}
          isReadOnly={highlight}
          borderColor={highlight ? 'green' : 'inherit'}
          backgroundColor={colorMode.colorMode === 'dark' ? 'gray.800' : 'white'}
          w={'100%'}
        >
          <NumberInputField fontWeight={highlight ? '700' : 'normal'} />
          <InputRightElement
            children={<Icon as={X} size={'xs'} color={'#888'} mr={12} />}
            data-test="input-clear-button"
            onClick={handleClear}
            zIndex={1}
          />
          <NumberInputStepper>
            <NumberIncrementStepper opacity={highlight ? 0.5 : 1} />
            <NumberDecrementStepper opacity={highlight ? 0.5 : 1} />
          </NumberInputStepper>
        </NumberInput>
      </InputGroup>
    </FormControl>
  );
};

export const DateInput = ({
  label,
  value,
  onChange,
  tooltip,
  isDisabled,
  highlight,
  useOverride
}: {
  onChange: (val: string) => void;
  label: string;
  value: string | undefined;
  tooltip?: string;
  isDisabled?: boolean;
  highlight?: boolean;
  useOverride?: boolean;
}) => {
  const [inputValue, setInputValue] = useState(dayjs(value).format('YYYY-MM-DD'));
  const colorMode = useColorMode();

  const [externallySetValue, setExternallySetValue] = useState(dayjs(value).format('YYYY-MM-DD'));

  useEffect(() => {
    if (highlight || useOverride) {
      setInputValue(dayjs(value).format('YYYY-MM-DD'));
      setExternallySetValue(dayjs(value).format('YYYY-MM-DD'));
    }
  }, [highlight, useOverride, value]);

  const handleBlur = () => {
    onChange(dayjs(inputValue).format('YYYY-MM-DD'));
  };
  const handleChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(dayjs(e.target.value).format('YYYY-MM-DD'));
    setExternallySetValue(e.target.value);
  };
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      setExternallySetValue(inputValue);
      handleBlur();
    }
  };

  return (
    <FormControl>
      <Label label={label} tooltip={tooltip} isDisabled={isDisabled && !highlight} />
      <Input
        size="sm"
        type="date"
        value={externallySetValue}
        onChange={handleChangeEvent}
        onBlur={handleBlur}
        onKeyUp={handleKeyUp}
        isDisabled={isDisabled && !highlight}
        isReadOnly={highlight}
        backgroundColor={colorMode.colorMode === 'dark' ? 'gray.800' : 'white'}
        borderColor={highlight ? 'green' : useOverride ? 'orange' : 'inherit'}
        transitionProperty={'border-color'}
        transitionDuration={'1s'}
        fontWeight={highlight ? '700' : 'normal'}
        sx={{
          '&::-webkit-calendar-picker-indicator': { marginRight: '-7px' },
          '&::-webkit-datetime-edit-month-field:focus, &::-webkit-datetime-edit-day-field:focus, &::-webkit-datetime-edit-year-field:focus':
            {
              color: 'light-dark(#fff, rgb(0, 0, 0))' // mac (14.5) chrome (127) / chakra bug: highlighttext should be white
            }
        }}
      />
    </FormControl>
  );
};

function Label(props: { label: string; tooltip?: string; isDisabled?: boolean }) {
  return (
    <FormLabel mr={0}>
      <HStack justifyContent={'space-between'}>
        <Text
          color={props.isDisabled ? '#888' : 'inherit'}
          fontSize={'.9em'}
          fontFamily={'heading'}
        >
          {props.label}
        </Text>
        {props.tooltip && (
          <Tooltip label={props.tooltip}>
            <Icon as={Info} ml={1} mr={'6px'} color={'#888'} />
          </Tooltip>
        )}
      </HStack>
    </FormLabel>
  );
}
