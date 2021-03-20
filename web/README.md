# philan.net

## Development

    yarn install
    yarn dev

## Testing

    yarn test

:memo: some testing require `TEST_GOOGLE_CREDENTIAL_BASE64`.

## Specification

### Language

- SpreadSheet Setting > Language and Country
- Amount should be a single currency using [GOOGLEFINANCE](https://support.google.com/docs/answer/3093281?hl=en) function
    - e.g.) force format $5 to JPY.
    - `= 5 * index(GOOGLEFINANCE("CURRENCY:USDJPY", "price", date(2021,2,28)), 2, 2)`
    - [google sheets - How can I get GOOGLEFINANCE to return only the historical price of a stock and not an array? - Web Applications Stack Exchange](https://webapps.stackexchange.com/questions/14725/how-can-i-get-googlefinance-to-return-only-the-historical-price-of-a-stock-and-n)
  
### CURRENCY

- Default Language: Your selected → { SpreadSheet.locale, User }
- INPUT currency: User selected. User.local → `CURRECY_TARGETCURRENTY`

Require

new Intl.Locale(Intl.getCanonicalLocales(new Intl.NumberFormat().resolvedOptions().locale)).region;

- Locale: `new Intl.NumberFormat().resolvedOptions().locale`
- Locale to Country: ``
- Country to Currency: https://github.com/thiagodp/country-to-currency

FINALLy get CURRECY
