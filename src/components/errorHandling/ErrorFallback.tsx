import Typography from "@/components/typography";
import Button from "@/components/buttons/Button";
import { useRouter } from "next/router";

export default function ErrorFallback() {
  const router = useRouter();

  return (
    <div className="h-screen w-full items-center justify-center text-center">
      <div className="pt-40">
        {/* <h1 className="">Something went wrong:</h1> */}
        {/* className="text-4xl font-bold" */}
        <Typography className="text-primary">
          Something went wrong! Try again later.
        </Typography>
        <div className="mt-8">
          <Button title="refresh" onClick={() => router.reload()}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
