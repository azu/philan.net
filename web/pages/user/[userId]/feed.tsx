import { createUserKvs } from "../../../api-utils/userKvs";
import { getSpreadSheet } from "../../api/spreadsheet/get";
import { GetServerSidePropsContext } from "next";
import { Feed } from "feed";

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
        credentials: user.credentials
    });
    const HOST = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://philan.net";
    const link = `${HOST}/user/${user.id}`;
    const feed = new Feed({
        title: `${user.name} on philan.net`,
        id: link,
        link: link,
        description: `${user.name} donations`,
        author: {
            name: user.name,
            link: link,
            email: user.id
        },
        copyright: "philan.net",
        updated: new Date()
    });
    spreadSheet?.forEach((sheet) => {
        sheet.items.forEach((item) => {
            feed.addItem({
                title: `Donate ${item.amount.value} to ${item.to}`,
                content: `Donate ${item.amount.value} to ${item.to}`,
                link: `${link}`,
                date: new Date(item.date)
            });
        });
    });
    res.statusCode = 200;
    const cacheTime = 60 * 60 * 24; // 24 hour
    res.setHeader("Cache-Control", `s-maxage=${cacheTime}, stale-while-revalidate`);
    res.setHeader("Content-Type", "text/xml");
    res.end(feed.atom1());
    return {
        props: {}
    };
}

const NOOP = () => null;
export default NOOP;
