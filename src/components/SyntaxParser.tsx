import { sampleData } from '@/constants/dummy.ts';
import { Segments, TokenList } from '@/components';
import { SlideFade, Text, useColorModeValue } from '@chakra-ui/react';
import { useRef } from 'react';
import '@/styles/constituent.scss';
import { useCalculateNestingLevel, useSegmentMouseEvent } from '@/hooks';

export default function SyntaxParser() {
  const sentenceRef = useRef<HTMLParagraphElement>(null);
  const isNestingLevelCalculated = useCalculateNestingLevel(sentenceRef);
  const { onMouseOver, onMouseLeave, targetInfo } = useSegmentMouseEvent();
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const { rootSegment, sentence } = sampleData;

  return (
    <SlideFade in={isNestingLevelCalculated} offsetY={100}>
      <Text
        fontSize="3xl"
        fontWeight="bold"
        ref={sentenceRef}
        whiteSpace="nowrap"
        color={textColor}
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
      >
        <Segments
          key={rootSegment.id}
          segment={rootSegment}
          tokenElements={TokenList({ sentence })}
        />
      </Text>
    </SlideFade>
  );
}
