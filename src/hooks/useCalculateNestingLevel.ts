import { useBoolean } from '@chakra-ui/react';
import { RefObject, useEffect } from 'react';
import { calculateNestingLevel } from '@/utils/nestingLevels';
import { useAtomValue } from 'jotai';
import { segmentHistoryIndexAtom } from '@/store/segmentHistoryStore';

interface UseCalculateNestedLevelProps {
  targetRef: RefObject<HTMLElement>;
  trigger?: unknown;
}

export default function useCalculateNestingLevel({
  targetRef,
  trigger,
}: UseCalculateNestedLevelProps) {
  const [isNestingLevelCalculated, setNestingLevelCalculated] = useBoolean();
  const segmentHistoryIndex = useAtomValue(segmentHistoryIndexAtom);

  useEffect(() => {
    if (targetRef.current) {
      calculateNestingLevel(targetRef);
      setNestingLevelCalculated.on();
    }
  }, [targetRef, trigger, segmentHistoryIndex, setNestingLevelCalculated]);

  return isNestingLevelCalculated;
}
