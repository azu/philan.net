import shortHash from "shorthash2";
import dayjs from "dayjs";

/**
 * Create Unique id for row/item
 * @param dateString
 * @param amountRaw
 * @param url
 */
export const createItemId = ({
    dateString,
    amountNumber,
    url
}: {
    dateString: string;
    amountNumber: number;
    url?: string;
}) => {
    const stringSeeds = [dateString, String(amountNumber), url].filter((seed) => seed !== undefined) as string[];
    const hashId = shortHash(stringSeeds.join("--"));
    const dateKey = dayjs(dateString!).format("YYYY-MM-DD");
    return `${dateKey}-${hashId}`;
};
