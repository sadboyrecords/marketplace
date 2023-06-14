import { useRouter } from "next/router";
import { api } from "@/utils/api";
import Typography from "@/components/typography";

function DropDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { data, isLoading } = api.battle.getBattleById.useQuery(
    { battleId: id as string },
    {
      enabled: !!id,
    }
  );

  console.log({ data });

  if (isLoading) {
    return (
      <div>
        <div className="h-4 w-1/4 animate-pulse bg-border-gray" />
      </div>
    );
  }
  return (
    <div className="flex flex-col space-y-8">
      <Typography className="font-bold" size="display-sm">
        {data?.battleName}
      </Typography>
      <Typography className="font-bold" size="display-sm">
        {data?.battleName}
      </Typography>
    </div>
  );
}

export default DropDetails;
