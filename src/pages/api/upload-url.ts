/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type NextApiRequest, type NextApiResponse } from "next";
// import S3 from "aws-sdk/clients/s3";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// export const s3 = new S3({
//   apiVersion: "2006-03-01",
//   accessKeyId: process.env.NEXT_FILEBASE_KEY,
//   secretAccessKey: process.env.NEXT_FILEBASE_SECRET,
//   region: "us-east-1",
//   endpoint: "https://s3.filebase.com",
//   signatureVersion: "v4",
//   s3ForcePathStyle: true,
// });

export const client = new S3Client({
  apiVersion: "2006-03-01",
  credentials: {
    accessKeyId: process.env.NEXT_FILEBASE_KEY as string,
    secretAccessKey: process.env.NEXT_FILEBASE_SECRET as string,
  },
  region: "us-east-1",
  endpoint: "https://s3.filebase.com",
  forcePathStyle: true,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const parsedBody = JSON?.parse(req?.body);

    const params = {
      Bucket: process.env.NEXT_FILEBASE_BUCKET_NAME,
      Key: parsedBody?.Key,
      // ContentType: parsedBody?.ContentType,
      // Expires: 60,
    };
    console.log({
      accessKeyId: process.env.NEXT_FILEBASE_KEY,
      secretAccessKey: process.env.NEXT_FILEBASE_SECRET,
      params,
    });
    // s3.putBucketCors(
    //   {
    //     Bucket: process.env.NEXT_FILEBASE_BUCKET_NAME as string,
    //     CORSConfiguration: {
    //       CORSRules: [
    //         {
    //           AllowedHeaders: ['*'],
    //           AllowedMethods: ['PUT'],
    //           AllowedOrigins: ['*'],
    //           ExposeHeaders: [
    //             'ETag',
    //             'x-amz-server-side-encryption',
    //             'x-amz-request-id',
    //             'x-amz-id-2',
    //             "x-amz-meta-cid"
    //           ],
    //           MaxAgeSeconds: 3000,
    //         },
    //       ],
    //     },
    //   },
    //   (err, data) => {
    //     if (err) {
    //       console.log({err});
    //     } else {
    //       console.log({data});
    //     }
    //   }
    // );
    // s3.listBuckets((err, data) => {
    //   if (err) {
    //     console.log({bucketErr: err});
    //   } else {
    //     console.log({bucketData: data});
    //   }
    // });
    // const url = s3.getSignedUrl("putObject", params);
    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    console.log({ url });
    res.status(200).json(url);
  } catch (error) {
    // throw new Error(error as any);
    res.status(500).json({ error });
  }
};

export default handler;
export { handler };
