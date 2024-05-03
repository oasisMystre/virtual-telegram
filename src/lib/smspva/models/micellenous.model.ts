import { CountryCode } from "../config";

type TotalKey<T extends string> = `Total_${T}`;

type AmountData<T extends string> = {
  [K in T as TotalKey<K>]: number;
};

export type CountryInfo = {
  data: {
    amount: {
      [K in CountryCode]: AmountData<K>;
    };
    conversations: Record<CountryCode, number>;
  };
};
