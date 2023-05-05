import Typography from "@/components/typography";

export default function CounterNumber({
  number,
  text,
  inProgress,
}: {
  number: number | string | null;
  text: string;
  inProgress?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <Typography
        size={`${inProgress ? "display-sm" : "body"}`}
        className="countdown font-mono "
        // marginBottom={false}
      >
        {number}
      </Typography>
      <Typography size={`${inProgress ? "body-sm" : "body-sm"}`} className="">
        {text}
      </Typography>
    </div>
  );
}
