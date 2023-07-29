import { useSegmentMouseEvent } from '@/hooks/index';
import { useAtom, useAtomValue } from 'jotai';
import { deleteModeAtom, selectedTagAtom } from '@/store/controlPanelStore';
import { addConstituent, removeConstituent } from '@/utils/segment.ts';
import { updateSegmentHistoryAndIndexAtom } from '@/store/segmentHistoryStore';
import { getBeginEndIdxFromSelection } from '@/utils/selection.ts';
import { generateConstituent } from '@/utils/constituent.ts';

export default function useSentenceHandlers() {
  const { onMouseOver, onMouseLeave, targetInfo } = useSegmentMouseEvent();
  const isDeleteMode = useAtomValue(deleteModeAtom);
  const selectedTag = useAtomValue(selectedTagAtom);
  const [currentSegment, updateSegment] = useAtom(
    updateSegmentHistoryAndIndexAtom,
  );

  /** 추가 */
  const onMouseUp = () => {
    /** 태그 리스트에서 태그를 선택했을 때만 실행 */
    if (selectedTag && currentSegment) {
      const { begin, end } = getBeginEndIdxFromSelection();
      const updatedSegment = addConstituent(
        currentSegment,
        begin,
        end,
        generateConstituent(selectedTag, begin, end),
      );

      if (updatedSegment !== currentSegment) updateSegment(updatedSegment);
    }
  };

  /** 삭제 */
  const onClick = () => {
    /** 삭제 모드이고, 드래그해서 선택한 토큰 정보가 있을 때만 실행 */
    if (isDeleteMode && targetInfo && currentSegment) {
      const constituentId = Number(targetInfo.constituentId);
      const updatedSegment = removeConstituent(currentSegment, constituentId);
      updateSegment(updatedSegment);
    }
  };

  return { onClick, onMouseOver, onMouseLeave, onMouseUp };
}
