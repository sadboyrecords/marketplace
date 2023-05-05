import { createRouter } from './context';
import { z } from 'zod';
import axios from 'axios';
import FormData from 'form-data';
import { pinata } from "utils/constants"

const pinataOptions = {
  pinata_api_key: process.env.NEXT_PINATA_KEY,
  pinata_secret_api_key: process.env.NEXT_PINATA_SECRET,
};

export const pinataRouter = createRouter()
  .mutation('pinFileToIPFS', {
    input: z.object({
      file: z.any(),
    }),
    async resolve({ input }) {
      console.log({ USERINPUT: input });
      const data = new FormData() as any;
      data.append('file', input);
       
    // const metadata = JSON.stringify({
    //   name: 'File name',
    // });
    // data.append('pinataMetadata', metadata);
      const response = await axios.post(pinata.pinFileToIPFSUrl, data, {
        maxContentLength: 'Infinity' as any,
        headers: {
          'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
          ...pinataOptions,
        } as any,
      });
      return {
        hash: response.data.IpfsHash,
      };
    },
  })
