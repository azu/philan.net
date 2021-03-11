import { createUserKvs } from "../../../api-utils/userKvs";
import { getSpreadSheet } from "../../api/spreadsheet/get";
import { GetServerSidePropsContext } from "next";

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export async function getServerSideProps({ params, res }: GetServerSidePropsContext) {
    const userId = params?.userId;
    if (typeof userId !== "string") {
        throw new Error("No user");
    }
    const userKVS = await createUserKvs();
    const user = await userKVS.findByUserId(userId);
    if (!user) {
        throw new Error("No user");
    }
    const spreadSheet = await getSpreadSheet({
        spreadsheetId: user.spreadsheetId,
        credentials: user.credentials,
        defaultCurrency: user.defaultCurrency
    });
    res.statusCode = 200;
    const cacheTime = 60 * 60; // 1 hour
    res.setHeader("Cache-Control", `s-maxage=${cacheTime}, stale-while-revalidate`);
    res.setHeader("Content-Type", "application/json");
    res.end(
        JSON.stringify({
            userName: user.name,
            userId: user.id,
            userAvatarUrl: user.avatarUrl,
            spreadSheet
        })
    );
    return {
        props: {}
    };
}

const NOOP = () => null;
export default NOOP;
