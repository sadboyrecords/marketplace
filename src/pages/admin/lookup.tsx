/* eslint-disable @typescript-eslint/no-misused-promises */
import Button from "@/components/buttons/Button";
import { useMetaplex } from "@/components/providers/MetaplexProvider";
import Typography from "@/components/typography";
import { api } from "@/utils/api";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import TextArea from "@/components/formFields/TextArea";
import { PublicKey } from "@solana/web3.js";
import { coinflowFeePayer } from "@/utils/constants";
import { useRef, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";

function Lookup() {
  const { data: session, status } = useSession();
  const { createLookupTable, extendLookupTable } = useMetaplex();
  const {
    data: lookupTable,
    isLoading,
    refetch,
  } = api.admin.getLookup.useQuery();
  const createLookup = api.admin.createLookup.useMutation();

  // Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g
  // ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL
  // 11111111111111111111111111111111
  // TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
  // metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
  // CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR
  // SysvarS1otHashes111111111111111111111111111
  // EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
  // 5ppVfhB9weJe9oBWEY97DArrbXmzzZ2fSkz28F92uQ7U
  // Sysvar1nstructions1111111111111111111111111
  // SysvarRent111111111111111111111111111111111
  // 8WQHB9umX9wLUsa6Reia9E96EiSaGWbYEiHzAqgDN4dM
  // GigARaWnLsKrTUq8FNveo3rn18Dp4sV8ic6Y6i5yJ7Z5
  // 3br7VsdU37pANBsyQs1THULFkTAfZWsQvkqVfWyvA59H

  const keys = [
    "75N3e5H9o8VswtNcAnWr9gHN1HCE1yAWdiaEHEesXssd",
    "3h2MDz4z4zEb71UngawB7pcCrDWN19htAARA6gP123hh",
    // "xiYt83sR4FdjKaXQSqmKK79Mpx36Tk2cjVsDP7TJA2u",
    // "8QMfUK7ddi9rL35eD9hWwUhYG75Hasu5ivwLVgr4D7Jk",
    // "J6ixAz8rWkbfEgdRDRVkwVtqk7EU65fT26Uk8g3WWUjP",
    // "G2Zocm2qzDxjUUPNrDDG7fDHrk65pzdy42qgfMFjXd3W",
    // "BT2NjP37JaRFztcnLpSYruwyi96DJRby2qugLGuGwGHz",
    // "Ht73hWt7HfAvyYz8Lrs8yoP6X7XPrsG7keqT3ZbfpKzL",
    // "DPAGjw9K59tuo3JmxAntfnWzh6BizKmsc3V3doQGr4yh",
    // "GJoXJ7hrGnKcjxSvbxXYzCHCKBnCowFBQH12i7DQYSQM",
    "11111111111111111111111111111111",
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
    "Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g",
    // "42GcyvZVmcs6hACKKw4SCJBHHm5qUQuzeBVUXrSsFgyo",
    // "8TaM76EfrY1rF7LUMAc2FrdYbpnzcjraz4VR6Q1P2Qi4",
    // "GLWvnXmm2Tenq3RoN9rsDsSVPqZFS2nC25HXCcQ6Ds39",
    // "GVhiAGXDitf8xGnK1fpCrxHmjPtoVWh8PVUHMxnGskYi"
  ];

  const knownAddresses = [
    new PublicKey(coinflowFeePayer),
    // new PublicKey("Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g"),
    // new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
    // new PublicKey("11111111111111111111111111111111"),
    // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    // new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
    // new PublicKey("CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR"),
    // new PublicKey("SysvarS1otHashes111111111111111111111111111")
    // new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU") - usdc -dev
    // EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v usdc prod,
    //  coinflows
    // new PublicKey("5ppVfhB9weJe9oBWEY97DArrbXmzzZ2fSkz28F92uQ7U"),
    // new PublicKey("Sysvar1nstructions1111111111111111111111111"),
    // new PublicKey("SysvarRent111111111111111111111111111111111"),
    // new PublicKey("8WQHB9umX9wLUsa6Reia9E96EiSaGWbYEiHzAqgDN4dM"),
    // GigARaWnLsKrTUq8FNveo3rn18Dp4sV8ic6Y6i5yJ7Z5 -prod

    // -------
    // ComputeBudget111111111111111111111111111111
    // 9edZCSuSRTS2eatJ1ZejmsXk9DqtXZRpNQvmy4K3KjRe - doesnt work dev
    // GmomYjNZ4LuiJM5sPu9FQfRHqu4CB6TNzAMwcxy43EP7 - doesnt work dev
    // new PublicKey("2Dd4tLC5NmacAZiUyFFgABz67dd3sXz1BYdsAgXq4nVb"),
    // new PublicKey("HxaWVXo7SuTxqWm75exXc5zC2vKwjCScgnC2AqmtXgPB"),
    // new PublicKey("CTyszyCDYuP16rG1iFBdmRAD4SPzB85UHyWgPZX5whJk"),
    // new PublicKey("3Z4qfZVwjbh5c2wer7tqkJyb9u97KCo57864Y7Pi2Dfx"),
    // new PublicKey("5dSW5mkSPpELUhzuk8YsCf9zNPzq3HxqdjgQjXPPy9Mg"),
    // new PublicKey("EyrHktmeBiDxcHq67cXUnQHj2BL8VXG4UBae1TeQy9sr"),
    // new PublicKey("E2grteDrihnAa3UgdmjP2h8jaY5niUi7kFbF35j3MXgj"),
    // new PublicKey("26rDHLqb21a5EqWiWYVm3enXbBuXiDUn1MJhTqVyA98h"),
    // new PublicKey("J3GuLGfJLbxHv5raBt53rNDi3P1mrxQk5CvG8LkLioR6"),
    // new PublicKey("2AcwbunbcHg3A6zAp56hQeuJjm7391Vgpod21kTvevUu"),
    // new PublicKey("4bybQid1XVE2eUJbs2wtkgTSAkX7k9e2iZNR66jS14Fs"),
    // new PublicKey("G4pBimXLA1ULCEoLB2BvHk4c9TzQnsQEMV9fWWCyfkeS"),
    // new PublicKey("GfHSggRTgyVA9QF1Gai1iaPvzvnkUWRnwyzgv8cCPn78"),
    // new PublicKey("5ZM6EDXDHqbESpBTBfecXb2o12wxg4nYBuX6dxz1YvwV"),
    // new PublicKey("2ZovPCyn4VFKiNZpfJJghiEjLTHfGqyh1H7Qiec9Q6ec"),
    // new PublicKey("3h2MDz4z4zEb71UngawB7pcCrDWN19htAARA6gP123hh"),

    // new PublicKey("5KMJJsx9RK2G7sCmtVTwUVzjAL1bx7yEzGDSHs6aQrKr"),
    // new PublicKey("BkXwtL4fgFc1BxaYwJ6iDYa3oNXBD6JcqTqz9dfpr7FU"),
    // new PublicKey("vevzhVDVsbnuunHzTZTXNNzfzc2Pf89TaDjtSSpbgPG"),
    // new PublicKey("2cVkpryQUN35Giwg1nHpGFbi3Gw4A7nYaR5c5pEeP6gx"),
    // new PublicKey("2V9b4tAG6VWqjLsciyjQWaWWvHgu7wGpNnjYzpSCV3EM"),
    // new PublicKey("H41nrjKg7PPbyhy3BjKr7px64Kwnd11oSMRWPxw87irg"),
    // new PublicKey("AX9Xk5UkN3k4ayKdsajec9esztuBpgj7qzQxSoHYkpEK"),
    // new PublicKey("3br7VsdU37pANBsyQs1THULFkTAfZWsQvkqVfWyvA59H"),
    // new PublicKey("A8MpM5XxtguzTFbC5VcwqtpHdtcDtfp1fpMqr6AvtrCf") - put in ,

    //
    //
    // ,

    // new PublicKey("HzdseyCGneNv4SzyBgteppi1N8GawjWLSkBSTx82UTtL"),
    // new PublicKey("SysvarC1ock11111111111111111111111111111111"),
    // new PublicKey("FD1amxhTsDpwzoVX41dxp2ygAESURV2zdUACzxM1Dfw9"),

    //
  ];

  const handleDefaultLookup = async () => {
    if (!lookupTable?.publicKey) {
      toast.error("No lookup table found");
      return;
    }
    const toastId = toast.loading("Extending...");
    try {
      await extendLookupTable(
        new PublicKey(lookupTable?.publicKey),
        knownAddresses
      );
      toast.update(toastId, {
        type: "success",
        isLoading: false,
        autoClose: 2000,
        render: "Success",
      });
    } catch (error) {
      toast.update(toastId, {
        type: "error",
        isLoading: false,
        autoClose: 2000,
        render: "Error",
      });
    }
  };

  const handleCreateLookup = async () => {
    if (!session?.user.walletAddress) {
      toast.error("Wallet not connected");
      return;
    }
    const toastId = toast.loading("Creating...");
    try {
      const address = await createLookupTable();
      if (address) {
        await createLookup.mutateAsync({
          publicKey: address,
          owner: session?.user.walletAddress,
        });
        await refetch();
        toast.update(toastId, {
          type: "success",
          isLoading: false,
          autoClose: 2000,
          render: "Success",
        });
      }
    } catch (error) {
      console.log(error);
      toast.update(toastId, {
        type: "error",
        isLoading: false,
        autoClose: 2000,
        render: "Error",
      });
    }
  };

  const [value, setValue] = useState<string>("");

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
  };

  const handleLookupInput = async () => {
    const toastId = toast.loading("Extending...");
    if (!lookupTable?.publicKey) {
      toast.update(toastId, {
        type: "error",
        isLoading: false,
        autoClose: 2000,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        render: "No lookup table found",
      });
      return;
    }
    try {
      const values: string[] = [];
      const valueMapped = value
        .split("\n")
        .filter((v) => v)
        .map((v) => new PublicKey(v.trim()))
        .filter((v) => {
          if (values.includes(v.toBase58())) {
            return false;
          }
          values.push(v.toBase58());
          return true;
        });
      console.log({ valueMapped });
      if (valueMapped.length === 0) {
        toast.update(toastId, {
          type: "error",
          isLoading: false,
          autoClose: 2000,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          render: "No addresses in input",
        });
        return;
      }

      await extendLookupTable(
        new PublicKey(lookupTable?.publicKey),
        valueMapped
      );
      toast.update(toastId, {
        type: "success",
        isLoading: false,
        autoClose: 2000,
        render: "Success",
      });
    } catch (error) {
      console.log({ error });
      toast.update(toastId, {
        type: "error",
        isLoading: false,
        autoClose: 2000,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        render: (error?.message as string) || "Error ",
      });
    }
  };

  if (isLoading || status === "loading") return <div>Loading...</div>;
  if (!session?.user?.isAdmin) return <div>Unauthorized</div>;
  return (
    <div className="flex flex-col space-y-4">
      <Typography>
        Lookup Table: {lookupTable?.publicKey || "Not Created"}{" "}
      </Typography>

      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <Button disabled={!!lookupTable?.publicKey} onClick={handleCreateLookup}>
        Create Lookup table{" "}
      </Button>
      {lookupTable?.publicKey && (
        <>
          <div className="space-y-4">
            <Button onClick={handleDefaultLookup}>Extend Default lookup</Button>
          </div>
          <div className="space-y-4">
            <Button onClick={handleLookupInput}>
              Extend Lookup with input
            </Button>
            <TextArea
              value={value}
              onChange={handleChange}
              name="addresses"
              label="Lookup Addresses"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Lookup;
