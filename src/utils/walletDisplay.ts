const shortenAddressCenter = (address: string, chars = 4) => {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

const shortenAddressEnd = (address: string, chars = 4) => {
  return `${address.slice(0, chars + 2)}...`;
};

export { shortenAddressCenter, shortenAddressEnd };
