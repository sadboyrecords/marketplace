import React from 'react';

function useImageUpload() {
  // cloudinary upload preset
  const upload = async (file: File) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'nftify');

    const res = await fetch('/api/imageUpload', {
      method: 'POST',
      body: data,
    });

    const fileData = await res.json();

    return fileData;
  };

  return {
    upload,
  };
}

export default useImageUpload;
