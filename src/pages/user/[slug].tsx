import UserInfo from "@/components/profiles/UserInfo";
import { useRouter } from "next/router";
import UserSongs from "@/components/profiles/Songs";
import Playlists from "@/components/profiles/Playlists";
import OwnedCollectables from "@/components/profiles/OwnedCollectables";

import type { NextPageWithLayout } from "@/utils/types";

const UserPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { slug } = router.query;
  return (
    <div className="mb-36">
      <UserInfo walletAddress={slug as string | undefined} />
      <UserSongs walletAddress={slug as string | undefined} />
      <Playlists walletAddress={slug as string | undefined} />
      <OwnedCollectables />
    </div>
  );
};

// function UserPage() {
//   return (
//     <div>
//       <UserInfo />
//     </div>
//   );
// }

UserPage.getLayout = (page) => <>{page}</>;

export default UserPage;
