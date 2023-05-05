import axios from 'axios';
// import { Metaplex } from '@metaplex-foundation/js';


const pinataAPIURL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const pinataJSONAPIURL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
import FormData from 'form-data';

const pinataOptions = {
  pinata_api_key: process.env.NEXT_PUBLIC_PINATA_KEY,
  pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET,
};

const cloudURL = process.env.NEXT_PUBLIC_PINATA_URL  // 'https://reamp.mypinata.cloud';


export const pinFileToIPFS = async (file: any) => {

  const data = new FormData();
  data.append('file', file);
  try {
    console.log("FIRING BACKEND REQUEST");
    const backend = await fetch("/api/upload-file-ipfs", {
      method: "POST",
      body: data,
    });
   if (backend.status === 200) {
      console.log("BACKEND REQUEST SUCCESS");
      const response = await backend.json();
      return response.ipfsHash;
   } else {
      console.log("BACKEND REQUEST FAILED");
      throw new Error("Backend request failed");
   }

  } catch (error) {
    console.log({ error })
    throw new Error("Backend request failed");
  }
};

export const pinJSONToIPFS = async (json: any) => {
  console.log({ json })

  
  try {
    console.log("FIRING BACKEND REQUEST");
    const backend = await fetch("/api/upload-json-ipfs", {
      method: "POST",
      body: JSON.stringify(json),
    });
   if (backend.status === 200) {
      console.log("BACKEND REQUEST SUCCESS");
      const response = await backend.json();
      return response.ipfsHash;
   } else {
      console.log("BACKEND REQUEST FAILED");
      throw new Error("Backend request failed");
   }

  } catch (error) {
    console.log({ error })
    throw new Error("Backend request failed");
  }
};

export const upload = async (
  metaJson: any,
  renderFile: File,
  sourceFile = null
) => {
  try {
    const data = new FormData();
    data.append('file', renderFile);
    debugger;
    const image = await axios({
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      headers: {
        Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_PINATA_JWT,
      },
      data: data,
    });

    let sourceImage = null;

    if (sourceFile) {
      const sourceFormData = new FormData();
      sourceFormData.append('file', sourceFile);

      sourceImage = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        sourceFormData,
        {
          headers: {
            Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_PINATA_JWT,
          },
        }
      );
    }

    const result = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataMetadata: {
          name: 'metadata.json',
        },
        pinataContent: {
          ...metaJson,
          image_url: `${cloudURL}/ipfs/${image.data.IpfsHash}`,
          '3D_File':
            sourceFile && sourceImage
              ? `${cloudURL}/ipfs/${sourceImage.data.IpfsHash}`
              : null,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          ...pinataOptions,
        },
      }
    );

    return result.data.IpfsHash;
  } catch (error) {
    console.log('error --> ', error);
    throw error;
    return null;
  }
};

const UploadFileToPinata = async (file: File) => {
  const data = new FormData();
  data.append('file', file);
  data.append('pinataOptions', '{"cidVersion": 1}');
  data.append(
    'pinataMetadata',
    `{"name": ${file.name}, "keyvalues": {"company": "NiftyTunes"}}`
  );
  const pinataJson = await fetch(pinataAPIURL, {
    method: 'POST',
    headers: {
      Authorization: `BEARER ${process.env.NEXT_PUBLIC_PINATA_JWT}` || '',
      contentType: 'multipart/form-data',
    },
    body: data,
  });
  const pinataResponse = await pinataJson.json();
  return pinataResponse.IpfsHash;
};

const UploadJsonToPinata = async (json: any) => {
  const pinataJson = await fetch(pinataJSONAPIURL, {
    method: 'POST',
    headers: {
      'Content-Type': `application/json`,
      ...pinataOptions,
    } as any,
    body: JSON.stringify(json),
  });
  const pinataResponse = await pinataJson.json();
  return pinataResponse.IpfsHash;
};

export { UploadFileToPinata, UploadJsonToPinata };
