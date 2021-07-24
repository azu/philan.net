export const parseAmount = (amount: string | number, defaultCurrency: string) => {
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
