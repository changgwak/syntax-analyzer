import {
  Box,
  Center,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  HStack,
  Skeleton,
  SkeletonCircle,
  Stack,
  StackProps,
  Text,
} from '@chakra-ui/react';
import { MAX_ANALYSIS_COUNT } from '@/constants/config';
import { PropsWithChildren } from 'react';
import { useRemainingCountQuery } from '@/queries';

export default function AnalysisCounter({ ...stackProps }: StackProps) {
  const { data: count } = useRemainingCountQuery({
    suspense: true,
    select: ({ count }) => count,
  });

  const countTitle = `남은 분석 횟수 ${count}회`;
  const limitDesc = `하루 최대 ${MAX_ANALYSIS_COUNT}회까지 분석할 수 있어요 (Model 4는 요청당 3회씩 차감)`;

  return (
    <AnalysisCounterBox {...stackProps}>
      <CircularProgress
        size="50px"
        value={remainingCountInPercent(count)}
        color="green.400"
      >
        <CircularProgressLabel>
          {remainingCountInPercent(count) + '%'}
        </CircularProgressLabel>
      </CircularProgress>

      <Center height="40px" px={1}>
        <Divider orientation="vertical" />
      </Center>
      <Box>
        <Text fontWeight="bold">{countTitle}</Text>
        <Text>{limitDesc}</Text>
      </Box>
    </AnalysisCounterBox>
  );
}

const AnalysisCounterBox = ({
  children,
  ...stackProps
}: PropsWithChildren<StackProps>) => {
  return (
    <HStack borderWidth={1} borderRadius="2xl" p={4} w="full" {...stackProps}>
      {children}
    </HStack>
  );
};

const AnalysisCounterSkeleton = () => {
  return (
    <AnalysisCounterBox>
      <SkeletonCircle w="50px" h="50px" />
      <Stack>
        <Skeleton h={5} w={200} borderRadius="md" />
        <Skeleton h={5} w={400} borderRadius="md" />
      </Stack>
    </AnalysisCounterBox>
  );
};

const remainingCountInPercent = (count?: number) => {
  if (!count) return 0;
  return Math.round((100 / MAX_ANALYSIS_COUNT) * count);
};

AnalysisCounter.Skeleton = AnalysisCounterSkeleton;
