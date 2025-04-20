export type StateLayer = "QUEUED" | "DEPLOYING" | "PUBLISHED" | "FAILED";

export type LambdaRuntime =
  | "python3.13"
  | "python3.12"
  | "python3.11"
  | "python3.10"
  | "python3.9";

export const allLambdaRuntimes: LambdaRuntime[] = [
  "python3.13",
  "python3.12",
  "python3.11",
  "python3.10",
  "python3.9",
];

export type ModelLayer = {
  identifier: string;
  stateLayer: StateLayer;
  packages: string[];
  isArchitectureSplit: boolean;
  note: string | null;
  updatedAt: string;
  ignoreVersions: LambdaRuntime[] | null;
};

export type ModelHistoryLayer = {
  identifier: string;
  createdAt: string;
  eventName: string;
  newImage?: string;
  oldImage?: string;
};
