import { LambdaRuntime, ModelLayer, StateLayer } from "@/models/layer";
import { generateCurrentDatetime } from "@/utils";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  ScanCommandOutput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { fetchAuthSession } from "aws-amplify/auth";

async function createClient(): Promise<DynamoDBClient> {
  const credential = await fetchAuthSession({
    forceRefresh: true,
  });
  return new DynamoDBClient({
    region: import.meta.env.VITE_REGION,
    credentials: credential.credentials,
  });
}

async function createDocumentClient(): Promise<DynamoDBDocumentClient> {
  const baseClient = await createClient();
  return DynamoDBDocumentClient.from(baseClient);
}

export async function getAllLayers(): Promise<ModelLayer[]> {
  const client = await createDocumentClient();
  let token = undefined;
  const result: ModelLayer[] = [];
  do {
    const command = new ScanCommand({
      TableName: import.meta.env.VITE_NAME_DYNAMODB_TABLE,
      ExclusiveStartKey: token,
    });
    const resp: ScanCommandOutput = await client.send(command);
    result.push(...(resp.Items as ModelLayer[]));
    token = resp.LastEvaluatedKey;
  } while (token != null);
  return result;
}

export async function getLayer(
  identifier: string,
): Promise<ModelLayer | undefined> {
  const client = await createDocumentClient();
  const command = new GetCommand({
    TableName: import.meta.env.VITE_NAME_DYNAMODB_TABLE,
    Key: { identifier },
  });
  const resp = await client.send(command);
  return resp.Item as ModelLayer | undefined;
}

export type PropsUpdateLayer = {
  identifier: string;
  isArchitectureSplit: boolean;
  packages: string[];
  note: string | null;
  ignoreVersions: LambdaRuntime[] | null;
};

export async function updateLayer(
  props: PropsUpdateLayer,
): Promise<ModelLayer> {
  const client = await createDocumentClient();
  console.log(props);

  const nextState: StateLayer = "QUEUED";

  const command = new UpdateCommand({
    TableName: import.meta.env.VITE_NAME_DYNAMODB_TABLE,
    Key: { identifier: props.identifier },
    UpdateExpression:
      "set " +
      [
        "#stateLayer = :stateLayer",
        "#stateGenerate = :stateGenerate",
        "#packages = :packages",
        "#isArchitectureSplit = :isArchitectureSplit",
        "#note = :note",
        "#updatedAt = :updatedAt",
        "#ignoreVersions = :ignoreVersions",
        "#actionsPublishUrl = :actionsPublishUrl",
        "#actionsGenerateUrl = :actionsGenerateUrl",
      ].join(", "),
    ExpressionAttributeNames: {
      "#stateLayer": "stateLayer",
      "#stateGenerate": "stateGenerate",
      "#packages": "packages",
      "#isArchitectureSplit": "isArchitectureSplit",
      "#note": "note",
      "#updatedAt": "updatedAt",
      "#ignoreVersions": "ignoreVersions",
      "#actionsPublishUrl": "actionsPublishUrl",
      "#actionsGenerateUrl": "actionsGenerateUrl",
    },
    ExpressionAttributeValues: {
      ":stateLayer": nextState,
      ":stateGenerate": nextState,
      ":packages": props.packages,
      ":isArchitectureSplit": props.isArchitectureSplit,
      ":note": props.note,
      ":updatedAt": generateCurrentDatetime(),
      ":ignoreVersions": props.ignoreVersions,
      ":actionsPublishUrl": null,
      ":actionsGenerateUrl": null,
    },
    ReturnValues: "ALL_NEW",
  });
  const resp = await client.send(command);
  return resp.Attributes as ModelLayer;
}

export type PropsDeleteLayer = {
  identifier: string;
};

export async function deleteLayer({ identifier }: PropsDeleteLayer) {
  const client = await createDocumentClient();
  const command = new DeleteCommand({
    TableName: import.meta.env.VITE_NAME_DYNAMODB_TABLE,
    Key: { identifier },
  });
  await client.send(command);
}

export type PropsInsertLayer = {
  layer: ModelLayer;
};

export async function insertLayer({ layer }: PropsInsertLayer) {
  const client = await createDocumentClient();
  const command = new PutCommand({
    TableName: import.meta.env.VITE_NAME_DYNAMODB_TABLE,
    Item: layer,
  });
  await client.send(command);
}
