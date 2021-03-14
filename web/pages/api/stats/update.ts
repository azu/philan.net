import { NextApiResponse } from "next";
import nextConnect from "next-connect";
import { withSession } from "../../../api-utils/with-session";
import { User } from "../../../domain/User";
import { NextApiRequestWithUserSession, requireLogin } from "../../../api-utils/requireLogin";
import dayjs from "dayjs";
import { GetResponseBody } from "../spreadsheet/api-types";
import { env } from "../../../api-utils/env";
import { crateS3EventItemsNDJSON, createS3StatsNDJSON } from "../../../api-utils/s3.event";
import { uploadGzip } from "../../../api-utils/s3";
import { getSpreadSheet } from "../spreadsheet/get";

async function uploadSpreadSheet({ user, spreadSheet }: { user: User; spreadSheet: GetResponseBody }): Promise<void> {
    if (!env.STATS_ENABLED) {
        return;
    }
    // No await to upload
    const year = dayjs().format("YYYY");
    const stats = createS3StatsNDJSON({
        user,
        responseData: spreadSheet,
        year
    });
    const items = crateS3EventItemsNDJSON({
        user,
        responseData: spreadSheet,
        year
    });
    return Promise.all([
        stats
            ? uploadGzip({
                  key: `stats/user_id=${user.id}/year=${year}/stats.json.gz`,
                  value: stats
              })
            : undefined,
        items
            ? uploadGzip({
                  key: `items/user_id=${user.id}/year=${year}/items.json.gz`,
                  value: items
              })
            : undefined
    ]).then(() => {
        // nope
    });
}

const handler = nextConnect<NextApiRequestWithUserSession, NextApiResponse>()
    .use(withSession())
    .use(requireLogin())
    .post(async (req, res) => {
        const user = req.user;
        const spreadsheetResponse = await getSpreadSheet({
            spreadsheetId: user.spreadsheetId,
            credentials: user.credentials,
            defaultCurrency: user.defaultCurrency
        });
        await uploadSpreadSheet({
            user,
            spreadSheet: spreadsheetResponse
        });
        res.json({
            ok: true
        });
    });
export default handler;
