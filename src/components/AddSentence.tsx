import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
} from '@chakra-ui/react';
import React, { Fragment, useRef, useState } from 'react';
import { ValidationError } from 'yup';
import { addSentenceSchema } from '@/constants/scheme';
import { addUserAnalysisActionAtom } from '@/store/analysisStore';
import { useSetAtom } from 'jotai';
import { ConfirmModal } from '@/components/common';
import { PiTextTBold } from 'react-icons/pi';

export default function AddSentence() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isError, setIsError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const errorMessage = useRef('');

  const addAnalysis = useSetAtom(addUserAnalysisActionAtom);

  const onSubmit = async () => {
    const input = inputRef.current;
    if (!input) return;

    try {
      await addSentenceSchema.validate(input.value.trim());
      onOpen();
    } catch (err) {
      if (err instanceof ValidationError) {
        errorMessage.current = err.errors[0];
        setIsError(true);
      }
    }
  };

  const onConfirm = () => {
    const input = inputRef.current;
    if (!input) return;
    addAnalysis(input.value.trim());
    input.value = '';
    onClose();
  };

  return (
    <Fragment>
      <FormControl isInvalid={isError}>
        <HStack align="start">
          <Box flexGrow={1}>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <PiTextTBold />
              </InputLeftElement>
              <Input
                ref={inputRef}
                placeholder="90자 미만의 영어 문장을 입력해주세요"
                maxLength={90}
                onFocus={() => setIsError(false)}
              />
            </InputGroup>
            {isError ? (
              <FormErrorMessage>{errorMessage.current}</FormErrorMessage>
            ) : (
              <FormHelperText>{`축약 표현은 자동으로 풀어집니다 e.g. I'll -> I will`}</FormHelperText>
            )}
          </Box>
          <Button size="lg" onClick={onSubmit}>
            추가
          </Button>
        </HStack>
      </FormControl>
      <ConfirmModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        headerContent="영어 문장 추가"
        bodyContent="입력한 영어 문장을 추가 하시겠습니까?"
      />
    </Fragment>
  );
}
