import dayjs from "dayjs";

export type ParsedAmount = {
    amount: number;
    from: string;
    to: string;
};
/**
 * cell value as formula
 * @param value
 * @param currency to should be defaultCurrency
 * @param date
 */
export const createAmountFormula = ({
    value,
    currency,
    date
}: {
    value: number;
    date: Date;
    currency: { from: string; to: string };
}) => {
    if (currency.from === currency.to) {
        return String(value);
    }
    const dateString = dayjs(date).format("YYYY/MM/DD");
    // price * finance rate
    // "currency.to" is display lang. should be
    return `= ${value} * index(GOOGLEFINANCE("CURRENCY:${currency.from}${currency.to}", "price", "${dateString}"), 2, 2)`;
};
/**
 * today amount
 * @param value
 * @param currency to should be defaultCurrency
 * @param date
 */
export const createTodayAmountFormula = ({
    value,
    currency
}: {
    value: number;
    currency: { from: string; to: string };
}) => {
    if (currency.from === currency.to) {
        return value;
    }
    return `= ${value} * index(GOOGLEFINANCE("CURRENCY:${currency.from}${currency.to}", "price", TODAY()), 2, 2)`;
};
export const parseAmount = (amount: string | number, defaultCurrency: string): ParsedAmount => {
    if (amount === undefined) {
        console.error("amount is undefined");
    }
    if (typeof amount === "number") {
        return {
            amount,
            from: defaultCurrency,
            to: defaultCurrency
        };
    }
    // = ${v} * index(GOOGLEFINANCE("CURRENCY:${item.currency.from}${item.currency.to}", "price", "${date}"), 2, 2);
    if (amount.startsWith("=")) {
        const match = amount.match(
            /=\s*(?<AMOUNT>\d+)\s*\*\s*index\(GOOGLEFINANCE\("CURRENCY:(?<FROM>\w{3})(?<TO>\w{3})/
        );
        if (!match) {
            return {
                amount: 0,
                from: defaultCurrency,
                to: defaultCurrency
            };
        }
        return {
            amount: Number(match.groups?.AMOUNT!),
            from: match.groups?.FROM!,
            to: match.groups?.TO!
        };
    } else {
        return {
            amount: Number(amount),
            from: defaultCurrency,
            to: defaultCurrency
        };
    }
};
