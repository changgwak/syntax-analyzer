import {
  Popover,
  PopoverAnchor,
  PopoverBody,
  PopoverContent,
  Portal,
  Text,
} from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { invalidRangeIndexAtom } from '@/store/analysisStore';
import React from 'react';

interface TokenProps {
  token: string;
  padding: number[];
  index: number;
}

export default function Token({ token, padding, index }: TokenProps) {
  const invalidIndex = useAtomValue(invalidRangeIndexAtom);
  return (
    <Popover isOpen={invalidIndex === index} isLazy>
      <PopoverAnchor>
        <Text
          position="relative"
          as="span"
          p={padding}
          zIndex={1}
          data-token-index={index}
        >
          {token}
        </Text>
      </PopoverAnchor>
      <Portal>
        <PopoverContent w="fit-content">
          <PopoverBody>구/절은 서로 교차할 수 없습니다</PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}
