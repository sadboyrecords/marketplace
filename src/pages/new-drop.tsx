import React from "react";
// import MintingContainer from '@/components/MintingContainer';
import { addresses } from "@/utils/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import Typography from "@/components/typography";
import TextLoader from "@/components/loaders/TextLoader";
import { useSession } from "next-auth/react";

function CreateToken() {
  const { publicKey } = useWallet();
  const { data: session } = useSession();

  return (
    <div>
      {session?.user?.isAdmin ? (
        // <MintingContainer />
        ""
      ) : (
        <>
          <Typography size="body" color="neutral-content">
            You are not authorized to create a new drop.
          </Typography>
          <div className="mt-4 max-w-2xl">
            <div className="flex flex-col gap-8">
              <div className="w-full">
                <TextLoader className="!h-44" />
              </div>
              <TextLoader className="!h-10" />
              <TextLoader className="!h-10" />
              <TextLoader className="!h-10" />
              <TextLoader className="!h-10" />
            </div>
          </div>
        </>
      )}
      {/* <MintingContainer /> */}
    </div>
  );
}

// export const getServerSideProps: GetServerSideProps = async ({ res }) => {
//   return {
//     // returns the default 404 page with a status code of 404 in production
//     // notFound: process.env.NEXT_ENV === 'prod',
//     props: {},
//   };
// };

export default CreateToken;
