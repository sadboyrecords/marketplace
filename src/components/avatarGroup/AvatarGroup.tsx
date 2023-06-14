import Link from "next/link";
import Avatar from "@/components/avatar/Avatar";

export type AvatarGroupProps = {
  img?: string;
  name: string;
  altText?: string;
  children?: React.ReactNode;
  hash?: string;
  route?: string;
  pinnedStatus?: string;
  path?: string;
};

export function AvatarGroup({ avProp }: { avProp: AvatarGroupProps[] }) {
  // const abv = avProp

  return (
    <>
      <div className="avatar-group cursor-pointer -space-x-6 ">
        {avProp?.map((prop) => (
          // <>
          <Link key={prop.name} href={prop.route || ""}>
            <Avatar
              alt="creators"
              username={prop.name}
              widthNumber={50}
              heightNumber={50}
              imageHash={prop.hash}
              pinnedStatus={prop.pinnedStatus}
              path={prop.path}
            />
            {/* {prop.img ? (
              <>
                <div className="avatar">
                  <div className="w-12">
                    <img src={prop.img} alt={prop.altText} />
                  </div>
                </div>
              </>
            ) : (
              <div className="placeholder avatar">
                <div className="w-12 rounded-full bg-base-300 text-neutral-content">
                  <Typography size="body-sm" className="text-neutral-content">
                    {prop.name.slice(0, 2)}
                  </Typography>
                </div>
              </div>
            )} */}
          </Link>
        ))}
      </div>
    </>
  );
}
