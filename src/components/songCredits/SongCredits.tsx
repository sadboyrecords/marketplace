import Typography from "@/components/typography";
import type { IFullCredits } from "@/utils/types";
import { creditRolesConvert } from "@/utils/helpers";

export default function SongCredits({
  credits,
  cLine,
  pLine,
}: {
  credits?: IFullCredits[];
  pLine?: string;
  cLine?: string;
}) {
  return (
    <>
      {credits && (
        <div>
          <Typography>Song Credits</Typography>

          <div className="mt-1 flex flex-col gap-2">
            {credits?.map((credit) => (
              <div className="flex" key={credit.role}>
                <Typography
                  className="Capitalize font-semibold"
                  size="body-xs"
                  color="neutral-content"
                >
                  {creditRolesConvert(credit.role)}:
                </Typography>
                <div className="flex">
                  {credit.names.map((name, i) => (
                    <Typography
                      size="body-sm"
                      color="neutral-content"
                      className="ml-2"
                      key={name.name}
                    >
                      {name.name.trim()}
                      {i < credit.names.length - 1 && ", "}
                    </Typography>
                  ))}
                </div>
              </div>
            ))}
            {cLine && (
              <Typography color="neutral-content" size="body-xs">
                {" "}
                © {cLine}
              </Typography>
            )}
            {pLine && (
              <Typography color="neutral-content" size="body-xs">
                {" "}
                ℗ {pLine}
              </Typography>
            )}
          </div>
        </div>
      )}
    </>
  );
}
