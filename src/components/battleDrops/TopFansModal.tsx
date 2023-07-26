import GenericModal from "@/components/modals/GenericModal";
import { useSelector, useDispatch } from "react-redux";
import {
  selectTopFansModal,
  closeTopFansModal,
  selectBattleDetailsAndSupporters,
} from "@/lib/slices/appSlice";
import TopFans from "./TopFans";

function JoinBattleFansModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectTopFansModal);
  const battleInfo = useSelector(selectBattleDetailsAndSupporters);

  return (
    <GenericModal
      // title={"View Top Fans"}
      isOpen={isOpen}
      // description="This collection/song is part of an active battle. Buy to support and join the listening party"
      closeModal={() => dispatch(closeTopFansModal())}
    >
      <div className="flex flex-col space-y-8">
        <TopFans
          isEnded={battleInfo?.isEnded}
          supporters={battleInfo?.supporters || undefined}
          isModal
        />
      </div>
    </GenericModal>
  );
}

export default JoinBattleFansModal;
