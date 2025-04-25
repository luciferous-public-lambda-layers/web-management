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
  stateGenerate: StateLayer;
  packages: string[];
  isArchitectureSplit: boolean;
  note: string | null;
  updatedAt: string;
  lastPublishedAt: string | null;
  lastGeneratedAt: string | null;
  ignoreVersions: LambdaRuntime[] | null;
  actionsPublishUrl: string | null;
  actionsGenerateUrl: string | null;
};

export type ModelHistoryLayer = {
  identifier: string;
  createdAt: string;
  eventName: string;
  newImage?: string;
  oldImage?: string;
};
