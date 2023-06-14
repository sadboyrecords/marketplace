import GenericModal from "@/components/modals/GenericModal";
import { useSelector, useDispatch } from "react-redux";
import {
  selectJoinBattleFansModal,
  closeJoinBattleFansModal,
  selectBattleDetailsAndSupporters,
} from "@/lib/slices/appSlice";
import TopFans from "./TopFans";
import Buy from "./Buy";

function JoinBattleFansModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectJoinBattleFansModal);
  const battleInfo = useSelector(selectBattleDetailsAndSupporters);

  return (
    <GenericModal
      title={
        battleInfo?.supporters && Object.keys(battleInfo?.supporters).length > 0
          ? `Join Other Fans and support ${battleInfo?.artistName as string}`
          : `Be the first to support ${battleInfo?.artistName as string}`
      }
      isOpen={isOpen}
      description="This collection/song is part of an active battle. Buy to support and join the listening party"
      closeModal={() => dispatch(closeJoinBattleFansModal())}
    >
      <div className="flex flex-col space-y-8">
        <Buy
          candyMachineId={battleInfo?.candymachineId || ""}
          competitorCandyId={battleInfo?.competitorCandyId || ""}
        />
        <TopFans supporters={battleInfo?.supporters || undefined} isModal />
      </div>
    </GenericModal>
  );
}

export default JoinBattleFansModal;
