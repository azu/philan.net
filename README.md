# philan.net

## Mission

- 寄付が特別な状態ではないことを目指す
- 自身の寄付の状況を公開することで透明性を出す

## Development

  yarn install
  yarn dev

- [ ] https://github.com/azu/philan.net/issues/11

## Architectures

This application is based on Next.js(Vercel) +  Cloudflare Workers KV.

- `/*` → Next.js Web/API
- [ ] `/worker/*` → Cloudflare Workers
  - Not used yet

Overview

- /* - Next.js
  - /api - Next.js's API(FaaS)
  
Storage

- Cloudflare Workers KV
- Google SpreadSheet

## Permission

次の目的のために、それぞれのパーミッションをしていている。

- SpreadSheetの読み書き: "https://www.googleapis.com/auth/spreadsheets"
- SpreadSheetファイルの作成: "https://www.googleapis.com/auth/drive"
- ユーザーID: "openid"
- ユーザーアバター画像: "profile"

## Note

### KV 

- KVには強整合性がないため、invalid stateが発生する
    - 保存したけど、次の読み込みに最新かが保証されない
    - 傾向的に2回目が最新になるという感じ
    - 更新してから、反映されるまでにラグがある感じ
