# philan.net

## Development

1. create `.env.development.local`
  - `cp .env.example .env.development.local`
2. install and run next.js

    yarn install

3. Start Next.js app

`dev:local` use local storage instead of cloudflare KV.
It is useful for debug in fresh env.

    yarn dev:local

`dev` command use Cloudflare KV that is defined in `.env.development.local` file

    yarn dev

`dev` command use Cloudflare KV in production(`APP_PROD_CF_namespace_user`) that is defined in `.env.development.local` file
It is useful to view production data from local.

    yarn dev:prod

## Testing

    yarn test

:memo: some testing require `TEST_GOOGLE_CREDENTIAL_BASE64` env.

## MAINTENANCE MODE

Unavailable all pages and all apis under the MAINTENANCE MODE.

Enter MAINTENANCE_MODE

1. Change to `NEXT_PUBLIC_MAINTENANCE_MODE=1` in [.env.production](.env.production)
2. Add announce to https://github.com/azu/philan.net/discussions/categories/maintenance

Leave MAINTENANCE_MODE

1. Change to `NEXT_PUBLIC_MAINTENANCE_MODE=0` in [.env.production](.env.production)
2. Add announce to https://github.com/azu/philan.net/discussions/categories/maintenance

## Deploy

### Add Env

1. Add env to GitHub Actions's secrets
2. Map the env to [serverless.yml](serverless.yml)

## Specification

### Language and CURRENCY

- SpreadSheet Setting > Language and Country
- Amount should be a single currency using [GOOGLEFINANCE](https://support.google.com/docs/answer/3093281?hl=en)
  function
    - e.g.) force format $5 to JPY.
    - `= 5 * index(GOOGLEFINANCE("CURRENCY:USDJPY", "price", date(2021,2,28)), 2, 2)`
    - [google sheets - How can I get GOOGLEFINANCE to return only the historical price of a stock and not an array? - Web Applications Stack Exchange](https://webapps.stackexchange.com/questions/14725/how-can-i-get-googlefinance-to-return-only-the-historical-price-of-a-stock-and-n)
