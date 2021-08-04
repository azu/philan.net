import nextConnect from "next-connect";

const handler = nextConnect().get(async () => {
    console.log(JSON.stringify(process.env));
});

export default handler;
