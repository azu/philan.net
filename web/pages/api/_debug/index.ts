import nextConnect from "next-connect";

const handler = nextConnect().get(async () => {
    console.log(JSON.stringify(process.env));
    res.json({});
});

export default handler;
