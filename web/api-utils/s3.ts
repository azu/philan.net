import AWS from "aws-sdk";
import zlib from "zlib";
import { env } from "./env";

AWS.config.update({
    credentials: new AWS.Credentials(env.STATS_AWS_ACCESS_KEY_ID, env.STATS_AWS_SECRET_ACCESS_KEY),
    region: env.STATS_AWS_S3_REGION
});

const s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    signatureVersion: "v4"
});

const gzip = (value: string) => {
    return new Promise<Buffer>((resolve, reject) => {
        zlib.gzip(value, (error, result) => {
            if (error) {
                return reject(error);
            } else {
                resolve(result);
            }
        });
    });
};
export const uploadGzip = async ({ key, value }: { key: string; value: string }) => {
    const body = await gzip(value);
    const toParam: AWS.S3.PutObjectRequest = {
        Bucket: env.STATS_AWS_S3_BUCKETS_NAME,
        Key: key,
        Body: body,
        ACL: "private",
        ContentType: "application/json",
        ContentEncoding: "gzip"
    };
    await s3
        .upload(toParam)
        .promise()
        .catch((err) => {
            console.error(err);
            throw new Error(`failed s3 upload: ${key}`);
        });
};
