import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { IMint as FormValues, GuardFormType, IMint } from "@/utils/types";
import Button from "@/components/buttons/Button";
import Typography from "@/components/typography";
import ModalContainer from "@/components/modalContainer";
import { useMetaplex } from "@/components/providers/MetaplexProvider";
import CandyMachineForm from "@/components/forms/CandyMachineForm";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import { getLowestSolpaymentFromGuard } from "@/utils/helpers";

export default function UpdateSettings() {
  const {
    candyMachineV3: { candyMachine, guardsAndEligibility, items },
    updateCandyMachine,
  } = useMetaplex();
  const wallet = useWallet();
  const treasuryAddress = "guardsAndEligibility[0].";
  const publicStartDate =
    guardsAndEligibility && guardsAndEligibility[0]?.startDate;
  const publicEndDate =
    guardsAndEligibility && guardsAndEligibility[0]?.endDate;
  const {
    register,
    setValue,
    getValues,
    formState,
    handleSubmit,
    watch,
    control,
  } = useForm<FormValues>();

  const walletSplits = watch("walletSplits");
  const royalties = watch("sellerFeeBasisPoints");
  const guards = watch("guards");
  const symbol = watch("symbol");
  const itemsAvailable = watch("itemsAvailable");
  const [valuesSet, setValuesSet] = useState(false);

  const originalWarning = {
    treasuryAddress: false,
    startDateTime: false,
    endDateTime: false,
    walletSplits: false,
    royalties: false,
    price: false,
  };

  const [hasWarnings, setHasWarnings] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [warnings, setWarnings] = useState(originalWarning);
  const [openEdit, setOpenEdit] = useState(false);

  const handleValues = () => {
    if (candyMachine) {
      // const solPayment = true // prices?.public?.payment.find((p) => p.kind === 'sol');
      setValue("itemsAvailable", candyMachine.itemsAvailable.toNumber());
      setValue("symbol", candyMachine?.symbol || "");
      // setValue('price', 0.1); //solPayment?.price ||
      setValue("sellerFeeBasisPoints", candyMachine.sellerFeeBasisPoints / 100);
      setValue(
        "walletSplits",
        candyMachine.creators.map((c) => ({
          walletAddress: c.address?.toBase58(),
          percentage: c.share,
        }))
      );
      setValue("treasuryAddress", treasuryAddress || "");
      publicStartDate && setValue("startDateTime", publicStartDate);
      publicEndDate && setValue("endDateTime", publicEndDate);

      let guards: GuardFormType[] = [];
      if (guardsAndEligibility) {
        guards = guardsAndEligibility.map((g) => ({
          label: g.label as string,
          startDate: g.startDate,
          endDate: g.endDate,
          mintLimit: g.mintLimit,
          redeemAmount: g.redeemLimit,
          solPayment: g.payment?.sol?.amount
            ? {
                amount: g.payment?.sol?.amount,
                destination: g.payment?.sol?.destination
                  ? g.payment?.sol?.destination.toBase58()
                  : "",
              }
            : undefined,
        }));
      }

      setValue("guards", guards);
      setValuesSet(true);
    }
  };
  const warningMessages: {
    [key: string]: string;
  } = {
    guards:
      "You have made changes to the launches, this will have an impact on the sale eligibility.",
    itemsAvailable: "You have made changes to the Items Available.",
    symbol: "You have made changes to the Symbol.",
    treasuryAddress:
      "You have made changes to the Treasury Address, this will have an impact on where primary sales are sent.",
    startDateTime:
      "You have made changes to the Start Date, this will have an impact on when the sale goes live.",
    endDateTime:
      "You have made changes to the End Date, this will have an impact on when the sale ends.",
    price:
      "You have made changes to the Price, this will have an impact on the price of the NFT.",
    walletSplits:
      "You have made changes to the Wallet Splits, this will have an impact on the royalties of the NFT.",
    sellerFeeBasisPoints:
      "You have made changes to the Royalties, this will have an impact on the royalties of the NFT.",
  };

  const handleCheckWarning = () => {
    setHasWarnings(false);
    const splits = candyMachine?.creators.map((c) => ({
      walletAddress: c.address?.toBase58(),
      percentage: c.share,
    }));

    // const solPayment = prices?.public?.payment.find((p) => p.kind === 'sol');
    const originalGuards: GuardFormType[] | undefined =
      guardsAndEligibility?.map((g) => ({
        label: g.label as string,
        startDate: g.startDate,
        endDate: g.endDate,
        mintLimit: g.mintLimit,
        redeemAmount: g.redeemLimit,
        solPayment: {
          amount: g.payment?.sol?.amount as number,
          destination: g.payment?.sol?.destination?.toBase58() as string,
        },
      }));
    // console.log({ guards, originalGuards, guardsAndEligibility });
    const w: {
      [key: string]: boolean;
    } = {
      walletSplits: JSON.stringify(splits) !== JSON.stringify(walletSplits),
      sellerFeeBasisPoints:
        Number(royalties) !== (candyMachine?.sellerFeeBasisPoints || 0) / 100,
      symbol: symbol !== candyMachine?.symbol,
      itemsAvailable: itemsAvailable !== items.available,
      // guards: JSON.stringify(guards.map((g) => ({}))) !== JSON.stringify(originalGuards),
    };
    const obj = Object.values(w).filter((v) => v.valueOf() === true);
    // console.log({
    //   w,
    //   obj,
    //   hasWarnings,
    // });
    setWarnings({
      ...warnings,
      ...w,
    });
    if (obj.length > 0) {
      setHasWarnings(true);
    }

    // Object.keys(w).forEach((key) => {
    //   console.log({ key });
    //   if (w[key]) {
    //     setError(key as any, {
    //       type: 'custom',
    //       message: warningMessages[key],
    //     });
    //   }
    // });
  };

  useMemo(() => {
    handleCheckWarning();
  }, [walletSplits, royalties, guards, symbol, itemsAvailable]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // console.log({ data });
    let startDate = data.guards[0]?.startDate;
    let endDate = data.guards[0]?.endDate;

    if (data.guards?.length > 1) {
      // console.log(' FILTER');
      const filteredStart = data.guards.filter((g) => g.startDate);
      console.log({ filteredStart });
      const sortedStart = filteredStart.sort(
        (a, b) =>
          new Date(a?.startDate as Date)?.getTime() -
          new Date(b?.startDate as Date).getTime()
      );
      // console.log({ sortedStart });
      startDate = sortedStart[0]?.startDate;

      const filteredEnd = data.guards.filter((g) => g.endDate);
      const sortedEnd = filteredEnd.sort(
        (a, b) =>
          new Date(a?.endDate as Date)?.getTime() -
          new Date(b?.endDate as Date).getTime()
      );
      // console.log({ sortedEnd });
      endDate = sortedEnd[filteredEnd.length - 1]?.endDate;
      // const lowestNumber = data.guards.reduce((acc, curr) => {
      //   if (!curr.solPayment?.amount) {
      //     return acc || curr;
      //   }
      //   if (!acc.solPayment?.amount) {
      //     return curr || null;
      //   }
      //   if (acc.solPayment?.amount < curr.solPayment?.amount) {
      //     return acc;
      //   }
      //   return curr;
      // });
      // price = lowestNumber?.solPayment?.amount;
    }
    // if (!price) {
    //   price = data.guards[0]?.solPayment?.amount;
    // }
    const price = getLowestSolpaymentFromGuard(data.guards);

    setIsUpdating(true);
    try {
      const updatedData: IMint = {
        ...data,
        startDateTime: startDate,
        endDateTime: endDate,
        lowestPrice: price as number,
      };
      console.log({ updatedData });
      await updateCandyMachine(updatedData);
      console.log({ startDate, endDate });
    } catch (error) {
      toast.error("Couldn't update your drop. ");
    }

    // update db
    setIsUpdating(false);
    setOpenEdit(false);
  };

  useEffect(() => {
    console.log("OPEN EDIT CHANGE");
    handleValues();
  }, [openEdit]);

  // console.log({ settingsCM: candyMachine, settingsGE: guardsAndEligibility });

  return (
    <>
      <Button onClick={() => setOpenEdit(true)} variant="link" size="small">
        Update drop settings
      </Button>
      <ModalContainer
        title="Update Drop Settings"
        open={openEdit}
        handleCancel={() => setOpenEdit(false)}
        fullWidth
      >
        <form className="flex w-full flex-col gap-10 ">
          <CandyMachineForm
            control={control}
            register={register}
            formState={formState}
            getValues={getValues}
            setValue={setValue}
            handleSubmit={handleSubmit}
            watch={watch}
          />

          {hasWarnings && (
            <div>
              <Typography variant="body1"> Change Warnings</Typography>
              {/* <ul>
                {Object.keys(warnings).map((key) => (
                  <>
                    {warnings[key] && (
                      <li className="list-disc ">
                        <FormFieldErrorHint className="text-warning">
                          {warningMessages[key]}
                        </FormFieldErrorHint>
                      </li>
                    )}
                  </>
                ))}
              </ul> */}
            </div>
          )}

          <div>
            <Button
              loading={isUpdating}
              type="submit"
              rounded="lg"
              className="mb-4 w-full"
              onClick={handleSubmit(onSubmit)}
            >
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </ModalContainer>
    </>
  );
}
