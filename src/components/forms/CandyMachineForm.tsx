import React from "react";
import Input from "@/components/formFields/Input";
import FormFieldLabel from "@/components/formFields/FormFieldLabel";
import {
  type UseFormRegister,
  type FormState,
  type UseFormSetValue,
  type UseFormGetValues,
  type UseFormHandleSubmit,
  type UseFormWatch,
  type Control,
  useFieldArray,
  Controller,
} from "react-hook-form";
import type { IMint as FormValues } from "@/utils/types";
import { SolIcon } from "@/components/iconComponents";
import { TrashIcon } from "@heroicons/react/24/solid";
import Button from "@/components/buttons/Button";
import { PublicKey } from "@metaplex-foundation/js";
import DateTimePicker from "@/components/formFields/DateTimePicker";
import Typography from "@/components/typography";
import FormFieldDescription from "@/components/formFields/FormFieldDescription";

type CandyMachineFormType = {
  register: UseFormRegister<FormValues>;
  formState: FormState<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  getValues: UseFormGetValues<FormValues>;
  handleSubmit: UseFormHandleSubmit<FormValues>;
  watch: UseFormWatch<FormValues>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<FormValues, any>;
};

function CandyMachineForm({
  register,
  formState,
  control,
  getValues,
  watch,
}: CandyMachineFormType) {
  const { errors } = formState;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "walletSplits",
  });

  const {
    fields: guardFields,
    append: appendGuards,
    remove: removeGuards,
  } = useFieldArray({
    control,
    name: "guards",
  });

  const walletSplits = watch("walletSplits");
  const guards = watch("guards");
  const itemsAvailable = watch("itemsAvailable");

  return (
    <>
      <Input
        label="Symbol"
        type="text"
        optional
        tooltipText="A symbol to represent this collection on chain. E.g. MYPROJECT (no more than 10 characters)"
        error={!!errors?.symbol}
        errorMessage={(errors?.symbol?.message as string) || ""}
        inputProps={{
          ...register("symbol", {
            maxLength: {
              value: 10,
              message: "Symbol must be less than 10 characters",
            },
          }),
        }}
      />
      <Input
        label="Royalties"
        tooltipText="The percentage of royalties you want to receive from secondary sales. We recommend no more than 10%."
        type="number"
        iconEnd={<div className="text-xs">%</div>}
        error={!!errors?.sellerFeeBasisPoints}
        errorMessage={(errors?.sellerFeeBasisPoints?.message as string) || ""}
        inputProps={{
          ...register("sellerFeeBasisPoints", {
            required: "You must provide a price",
            valueAsNumber: true,
          }),
        }}
      />
      <Input
        label="Editions (Total NFTs for sale)"
        tooltipText="The total amount that can be minted across all users"
        type="number"
        error={!!errors?.itemsAvailable}
        errorMessage={(errors?.itemsAvailable?.message as string) || ""}
        inputProps={{
          ...register(`itemsAvailable`, {
            valueAsNumber: true,
            required:
              "You must provide the number of NFTs you would like to mint",
          }),
        }}
      />
      <div className="flex-col space-y-4">
        <div>
          <Typography size="display-xs">Launches</Typography>
          <FormFieldDescription>
            You can have different phases of your drop. For example, you can
            have an &quot;Early Bird&quot; phase, give early bird users a
            discounted price. Then you can have a public sale that is available
            to anyone to pay a different price{" "}
          </FormFieldDescription>
        </div>
        {guardFields.length > 0 &&
          guardFields.map((g, index) => (
            <div
              key={g.label}
              className={`flex-col space-y-4 border-b-2 border-base-300 pb-8`}
            >
              <Typography className="font-semibold">
                Phase {index + 1}
              </Typography>
              <div>
                <Input
                  label={`Label`}
                  tooltipText="The name of this sale phase, if you have multiple phases, you must provide a different name for each phase"
                  placeholder={`${
                    index === 0 ? "E.g. Early Bird" : "E.g. Public Sale"
                  }`}
                  error={!!errors?.guards?.[index]?.label}
                  errorMessage={
                    (errors?.guards?.[index]?.label?.message as string) || ""
                  }
                  inputProps={{
                    ...register(`guards.${index}.label`, {
                      required: "You must provide a label",
                      maxLength: {
                        value: 6,
                        message: "Label must be less than 6 characters",
                      },
                    }),
                  }}
                />
              </div>
              <div>
                <Input
                  label="Price (minimum 0.1 SOL)"
                  tooltipText="The price of each NFT in SOL."
                  type="number"
                  icon={<SolIcon />}
                  iconEnd={<div className="text-xs">SOL</div>}
                  error={!!errors?.guards?.[index]?.solPayment?.amount}
                  errorMessage={
                    (errors?.guards?.[index]?.solPayment?.amount
                      ?.message as string) || ""
                  }
                  inputProps={{
                    ...register(`guards.${index}.solPayment.amount`, {
                      required: "You must provide a price",
                      min: 0.1,
                      valueAsNumber: true,
                    }),
                  }}
                />
              </div>
              <div>
                <Input
                  label="Treasury"
                  tooltipText="The wallet address that will receive primary sales revenue."
                  type="text"
                  error={!!errors?.guards?.[index]?.solPayment?.destination}
                  errorMessage={
                    (errors?.guards?.[index]?.solPayment?.destination
                      ?.message as string) || ""
                  }
                  inputProps={{
                    ...register(`guards.${index}.solPayment.destination`, {
                      required: "You must provide a wallet address",
                      validate: (value) => {
                        if (value) {
                          try {
                            const valid = new PublicKey(value);
                            if (!valid) {
                              return "Invalid wallet address";
                            }
                          } catch (error) {
                            return "Invalid wallet address";
                          }
                        }
                      },
                    }),
                  }}
                />
              </div>
              <div>
                <Controller
                  name={`guards.${index}.startDate`}
                  control={control}
                  rules={{ required: "You must provide a start date" }}
                  render={({ field }) => (
                    <DateTimePicker
                      onChange={(date) => field.onChange(date)}
                      value={field.value}
                      timePickerTitle="Start Time"
                      error={
                        errors?.guards && errors?.guards[index]?.startDate
                          ? true
                          : false
                      }
                      errorMessage={
                        (errors?.guards?.[index]?.startDate
                          ?.message as string) || ""
                      }
                      label="Start Date/Time"
                      //   startDateTime={guards[index]?.startDate}
                      //   startDateInterval={1}
                      //   optional
                      tooltipText="Add a date and time for your sale to end. If you don't set an end date, your sale will be open until you cancel it or it is purchased."
                    />
                  )}
                />
              </div>
              <div>
                <Controller
                  name={`guards.${index}.endDate`}
                  control={control}
                  rules={{ required: "You must provide an end date" }}
                  render={({ field }) => (
                    <DateTimePicker
                      onChange={(date) => field.onChange(date)}
                      value={field.value}
                      timePickerTitle="End Time"
                      error={
                        errors?.guards && errors?.guards[index]?.endDate
                          ? true
                          : false
                      }
                      errorMessage={
                        (errors?.guards?.[index]?.endDate?.message as string) ||
                        ""
                      }
                      label="End Date/Time"
                      startDateTime={guards[index]?.startDate}
                      startDateInterval={1}
                      tooltipText="Add a date and time for your sale to end. If you don't set an end date, your sale will be open until you cancel it or it is purchased."
                    />
                  )}
                />
              </div>
              <div>
                <Input
                  label="Mint Limit "
                  tooltipText="The total amount a single user can mint in the phase"
                  type="number"
                  error={!!errors?.guards?.[index]?.mintLimit}
                  errorMessage={
                    (errors?.guards?.[index]?.mintLimit?.message as string) ||
                    ""
                  }
                  inputProps={{
                    ...register(`guards.${index}.mintLimit`, {
                      min: 1,
                      validate: (value) => {
                        if (value) {
                          const isValid = /^[1-9]\d*$/.test(value.toString());
                          if (!isValid) {
                            return `'Must be whole numbers. You can't have decimals`;
                          }
                          if (value > itemsAvailable) {
                            return `Users can't mint more than you have available. You currenly have ${itemsAvailable} items available.`;
                          }
                          if (value === 0) {
                            return `Mint limit must be more than 0`;
                          }
                        }
                      },
                      valueAsNumber: true,
                    }),
                  }}
                />
              </div>
              <div>
                <Input
                  label="Redeem Limit"
                  tooltipText="The total amount that can be minted across all users"
                  type="number"
                  error={!!errors?.guards?.[index]?.redeemAmount}
                  errorMessage={
                    (errors?.guards?.[index]?.redeemAmount
                      ?.message as string) || ""
                  }
                  inputProps={{
                    ...register(`guards.${index}.redeemAmount`, {
                      validate: (value) => {
                        if (value) {
                          const isValid = /^[1-9]\d*$/.test(value.toString());
                          if (!isValid) {
                            return `'Must be whole numbers. You can't have decimals`;
                          }
                          if (value > itemsAvailable) {
                            return `The redeem amount cannot be more than the items you currenly have ${itemsAvailable} items available.`;
                          }
                          if (value === 0) {
                            return `Redeem amount must be more than 0`;
                          }
                        }
                      },
                      valueAsNumber: true,
                    }),
                  }}
                />
              </div>
              <div>
                <Button
                  title="delete"
                  type="button"
                  variant="ghost"
                  className="space-x-1 px-2 text-xs"
                  disabled={guardFields.length === 1}
                  onClick={() => removeGuards(index)}
                >
                  Delete this launch
                </Button>
              </div>
            </div>
          ))}
        <div>
          <Button
            type="button"
            variant="ghost"
            className="space-x-1 px-2 text-xs"
            onClick={() => {
              appendGuards({
                label: "",

                // solPayment: {
                //     amount: ,
                // }
              });
            }}
          >
            Add another Launch
          </Button>
        </div>
      </div>

      <div>
        <FormFieldLabel tooltipText="Add anyone that will you will split the token secondary sales with">
          Creators & Splits
        </FormFieldLabel>
        <div className="space-y-4">
          <div>
            {fields.map((item, index) => (
              <div key={item.walletAddress}>
                <div className="flex items-end space-x-2">
                  <div className="basis-5/6">
                    <Input
                      placeholder="Wallet Address"
                      error={!!errors?.walletSplits?.[index]?.walletAddress}
                      errorMessage={
                        (errors?.walletSplits?.[index]?.walletAddress
                          ?.message as string) || ""
                      }
                      inputProps={{
                        ...register(`walletSplits.${index}.walletAddress`, {
                          required: "You must provide a wallet address",
                          validate: (value) => {
                            if (value) {
                              try {
                                const isValid = new PublicKey(value);
                                if (!isValid) {
                                  return "You must provide a valid public key";
                                }
                              } catch (error) {
                                return "You must provide a valid public key";
                              }
                            }
                          },
                        }),
                      }}
                    />
                  </div>
                  <div>
                    <Input
                      error={!!errors?.walletSplits?.[index]?.percentage}
                      errorMessage={
                        errors?.walletSplits?.[index]?.percentage?.message
                      }
                      placeholder="Percentage"
                      type="number"
                      inputProps={{
                        ...register(`walletSplits.${index}.percentage`, {
                          required: "You must provide a percentage",

                          valueAsNumber: true,
                          validate: (value) => {
                            const formfields = getValues();
                            if (value === 0) return "Percentage can't be 0";
                            if (value && value > 100) {
                              return "Percentage cannot be greater than 100.";
                            }
                            const result = formfields.walletSplits.reduce(
                              (acc, obj) => acc + (obj.percentage || 0),
                              0
                            );
                            if (result > 100) {
                              return "Total splits cannot be more 100.";
                            }
                            // return 0;
                          },
                        }),
                      }}
                    />
                  </div>
                  <div>
                    <Button
                      disabled={walletSplits.length < 2}
                      onClick={() => remove(index)}
                    >
                      <TrashIcon className="h-4 w-4 " />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <Button
              type="button"
              variant="outlined"
              className="space-x-1 px-2 text-xs"
              onClick={() => {
                append({
                  walletAddress: "",
                  percentage: undefined,
                });
              }}
            >
              Add another Wallet
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CandyMachineForm;
