import NextAuth from "next-auth";
import { authOptions } from "@/server/auth";
import { type NextApiRequest, type NextApiResponse } from "next";

// import { getCsrfToken } from "next-auth/react";

// export const config = {
//     api: {
//       bodyParser: false,
//     },
//   }


// export default NextAuth(authOptions);
export default function auth(req: NextApiRequest, res: NextApiResponse) {
    console.log("---FIRING AUTH----")
    // const tokenCsrf = await getCsrfToken({ req }) 

    // console.log({ tokenCsrf })
    // const options = authOptions(req)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return NextAuth(req, res, authOptions(req))
}


