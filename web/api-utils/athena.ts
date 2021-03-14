import AWS from "aws-sdk";
import { env } from "./env";
import dayjs from "dayjs";
import { QueryExecutionId } from "aws-sdk/clients/athena";

AWS.config.update({
    credentials: new AWS.Credentials(env.STATS_AWS_ACCESS_KEY_ID, env.STATS_AWS_SECRET_ACCESS_KEY),
    region: env.STATS_AWS_S3_REGION
});

const athena = new AWS.Athena({
    apiVersion: "2017-05-18"
});
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function waitForQueryResult(queryExecutionId: QueryExecutionId) {
    return new Promise((resolve, reject) => {
        const params = { QueryExecutionId: queryExecutionId };

        function loop() {
            athena.getQueryExecution(params, async function (error, data) {
                if (error) {
                    return reject(error);
                }
                if (data.QueryExecution?.Status?.State == "SUCCEEDED") {
                    return resolve(queryExecutionId);
                } else {
                    await sleep(2000);
                    loop();
                }
            });
        }

        return loop();
    });
}

async function getQueryResult(queryExecutionId: QueryExecutionId) {
    await waitForQueryResult(queryExecutionId);
    return athena.getQueryResults({ QueryExecutionId: queryExecutionId }).promise();
}

async function executeQuery(query: string) {
    const key = dayjs().format("YYYY/MM/DD");
    const executingQuery = await athena
        .startQueryExecution({
            QueryString: query,
            ResultConfiguration: {
                /* required */ OutputLocation: `s3://${env.AWS_ATHENA_OUTPUT_S3_BUCKETS_NAME}/${key}/`
            }
        })
        .promise();
    if (!executingQuery.QueryExecutionId) {
        throw new Error("Failed to execute");
    }
    return getQueryResult(executingQuery.QueryExecutionId);
}

export type UserStat = { budget: number; used: number; currency: string };

async function getTotalStats(year: string) {
    const response = await executeQuery(`
-- total_budget
SELECT
SUM(budget) as total_budget,
SUM(used) as total_used,
currency
FROM "philannet"."stats"
WHERE year = '${year}' AND item_count > 0
GROUP BY currency
`);
    const Rows = response.ResultSet?.Rows;

    const array: UserStat[] = [];
    // remove table
    Rows?.slice(1).forEach((row) => {
        const [totalData, totalUsedData, currencyData] = row?.Data ?? [];
        if (!totalData || !totalUsedData || !currencyData) {
            return;
        }
        const totalBudget = Number(totalData.VarCharValue);
        const totalUsed = Number(totalUsedData.VarCharValue);
        const currency = currencyData.VarCharValue as string;
        array.push({
            budget: totalBudget,
            used: totalUsed,
            currency
        });
    });
    return array;
}

const DUMMY_STATS: UserStat[] = [
    {
        budget: 100000,
        used: 5000,
        currency: "JPY"
    },
    {
        budget: 2500,
        used: 1000.25,
        currency: "USD"
    }
];

export const fetchUserStats = async (): Promise<UserStat[]> => {
    if (!env.STATS_ENABLED) {
        return DUMMY_STATS;
    }
    const year = dayjs().format("YYYY");
    return await getTotalStats(year);
};
