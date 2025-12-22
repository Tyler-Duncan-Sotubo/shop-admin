/* eslint-disable @typescript-eslint/no-explicit-any */
export type StoreTransferHistoryRow = {
  id: string;
  timestamp: string;

  by: {
    firstName: string | null;
    lastName: string | null;
  };

  transferId: string;
  fromLocationName: string | null;
  toLocationName: string | null;

  changes: Record<string, any>;
};
