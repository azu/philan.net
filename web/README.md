# philan.net

## Development

    yarn install
    yarn dev

## Testing

    yarn test

:memo: some testing require `TEST_GOOGLE_CREDENTIAL_BASE64`.

## MAINTENANCE MODE

Unavailable all pages and all apis under the MAINTENANCE MODE.

Enter MAINTENANCE_MODE

1. Change to `NEXT_PUBLIC_MAINTENANCE_MODE=1` in [.env.production](.env.production)
2. Add announce to https://github.com/azu/philan.net/discussions/categories/maintenance

Leave MAINTENANCE_MODE

1. Change to `NEXT_PUBLIC_MAINTENANCE_MODE=0` in [.env.production](.env.production)
2. Add announce to https://github.com/azu/philan.net/discussions/categories/maintenance

## Specification

### Language and CURRENCY

- SpreadSheet Setting > Language and Country
- Amount should be a single currency using [GOOGLEFINANCE](https://support.google.com/docs/answer/3093281?hl=en)
  function
    - e.g.) force format $5 to JPY.
    - `= 5 * index(GOOGLEFINANCE("CURRENCY:USDJPY", "price", date(2021,2,28)), 2, 2)`
    - [google sheets - How can I get GOOGLEFINANCE to return only the historical price of a stock and not an array? - Web Applications Stack Exchange](https://webapps.stackexchange.com/questions/14725/how-can-i-get-googlefinance-to-return-only-the-historical-price-of-a-stock-and-n)
