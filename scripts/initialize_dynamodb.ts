import { ModelLayer } from "../src/models/layer";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

async function main() {
  const raw_client = createClient();
  const client = DynamoDBDocumentClient.from(raw_client);
  const keys = await getAllKeys(client);
  await deleteAllItems(keys, client);
  await insertItems(client);
}

async function insertItems(client: DynamoDBDocumentClient) {
  const items: ModelLayer[] = [
    {
      identifier: "zstd",
      stateLayer: "QUEUED",
      stateGenerate: "QUEUED",
      packages: ["zstd"],
      isArchitectureSplit: true,
      updatedAt: "2025-03-23T12:53:44.133765+09:00",
      lastPublishedAt: null,
      lastGeneratedAt: null,
      ignoreVersions: null,
      note: null,
      actionsPublishUrl: null,
      actionsGenerateUrl: null,
    },
    {
      identifier: "scraper",
      stateLayer: "DEPLOYING",
      stateGenerate: "PUBLISHED",
      packages: ["feedparser", "beautifulsoup4"],
      isArchitectureSplit: false,
      updatedAt: "2025-03-23T12:55:56.572680+09:00",
      lastPublishedAt: "されたことあるよ",
      lastGeneratedAt: "されたことあるよ",
      note: "combine",
      ignoreVersions: null,
      actionsPublishUrl: null,
      actionsGenerateUrl: null,
    },
    {
      identifier: "openai",
      stateLayer: "PUBLISHED",
      stateGenerate: "PUBLISHED",
      packages: ["openai"],
      isArchitectureSplit: true,
      ignoreVersions: ["python3.9"],
      updatedAt: "2025-03-23T12:55:56.572680+09:00",
      lastPublishedAt: "されたことあるよ",
      lastGeneratedAt: "されたことあるよ",
      note: null,
      actionsPublishUrl: null,
      actionsGenerateUrl: null,
    },
    {
      identifier: "aws-cloudwatch-logs-url",
      stateLayer: "FAILED",
      stateGenerate: "FAILED",
      packages: ["aws-cloudwatch-logs-url"],
      isArchitectureSplit: false,
      updatedAt: "2025-03-23T12:55:56.572680+09:00",
      lastPublishedAt: "されたことあるよ",
      lastGeneratedAt: "されたことあるよ",
      note: null,
      ignoreVersions: null,
      actionsPublishUrl: null,
      actionsGenerateUrl: null,
    },
  ];
  const command = new BatchWriteCommand({
    RequestItems: {
      [process.env.VITE_NAME_DYNAMODB_TABLE]: items.map((v) => {
        return {
          PutRequest: {
            Item: v,
          },
        };
      }),
    },
  });
  await client.send(command);
}

function createClient(): DynamoDBClient {
  return new DynamoDBClient({
    region: process.env.VITE_REGION,
  });
}

async function getAllKeys(client: DynamoDBDocumentClient): Promise<string[]> {
  let token = undefined;
  const result: string[] = [];

  do {
    const command = new ScanCommand({
      TableName: process.env.VITE_NAME_DYNAMODB_TABLE,
      ExclusiveStartKey: token,
    });
    const resp = await client.send(command);
    const items = resp.Items ?? [];
    result.push(...resp.Items.map((v) => v.identifier as string));
    token = resp.LastEvaluatedKey;
  } while (token);

  return result;
}

async function deleteAllItems(keys: string[], client: DynamoDBDocumentClient) {
  for (const k of keys) {
    const command = new DeleteCommand({
      TableName: process.env.VITE_NAME_DYNAMODB_TABLE,
      Key: { identifier: k },
    });
    await client.send(command);
  }
}

Promise.all([main()])
  .then(() => console.log("<<< SUCCESS >>>"))
  .catch((e) => {
    console.log("<<< ERROR >>>");
    console.error(e);
  });
