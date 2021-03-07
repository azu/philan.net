export {};
// import type { NextApiRequest, NextApiResponse } from "next";
// import * as playwright from "playwright-aws-lambda";
// import { createUserKvs } from "../../../api-utils/userKvs";
// import { getSpreadSheet } from "../spreadsheet/get";
//
// const isDev = process.env.NODE_ENV !== "production";
// const isPreview = typeof process.env.BLOG_PREVIEW !== "undefined";
//
// async function getLaunchOptions() {
//     if (isDev || isPreview) {
//         return {
//             args: [],
//             executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
//             headless: true
//         };
//     } else {
//         return {};
//     }
// }
//
// export default async (req: NextApiRequest, res: NextApiResponse) => {
//     const [userId] = req.query.path;
//     if (typeof userId !== "string") {
//         return;
//     }
//     const userKVS = await createUserKvs();
//     const user = await userKVS.findByUserId(userId);
//     if (!user) {
//         throw new Error("No user");
//     }
//     const spreadSheetData = await getSpreadSheet({
//         spreadsheetId: user.spreadsheetId,
//         credentials: user.credentials
//     });
//     const options = await getLaunchOptions();
//     const browser = await playwright.launchChromium(options);
//     const page = await browser.newPage({
//         viewport: {
//             width: 1200,
//             height: 630
//         },
//         deviceScaleFactor: 2
//     });
//     const param = new URLSearchParams([
//         ["userName", user.name],
//         ["budget", spreadSheetData[0].stats.budget.value],
//         ["used", spreadSheetData[0].stats.used.value],
//         ["balance", spreadSheetData[0].stats.balance.value]
//     ]);
//     const HOST = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://philan-net.vercel.app";
//     await page.goto(`${HOST}/playOGP?${param.toString()}`, { waitUntil: "load" });
//     await page.evaluateHandle("document.fonts.ready");
//     const mainElement = await page.$("#main");
//     if (!mainElement) {
//         return res.status(400).end();
//     }
//     const data = await mainElement.screenshot({ type: "png" });
//     await browser.close();
//
//     // Set the s-maxage property which caches the images then on the Vercel edge
//     res.setHeader("Cache-Control", "s-maxage=31536000, stale-while-revalidate");
//     res.setHeader("Content-Type", "image/png");
//     // write the image to the response with the specified Content-Type
//     res.end(data);
// };
