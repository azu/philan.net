# philan.net

寄付者が寄付の予算と実施した履歴を管理するツール。

## Mission

- 寄付が特別な状態ではないことを目指す
- 自身の寄付の状況を公開することで透明性を出す

## Development

次の手順で、ローカルで開発できます。

```
yarn install
# first time
yarn bootstrap
# start server
yarn dev
```

:memo: ローカルでは、統計処理など一部はモックの実装となっています。

## Architectures

This application is based on Next.js(Vercel) +  Cloudflare Workers KV.

- `/*` - [Next.js](./web)
  - `/api` - [Next.js's API(FaaS)](./web/pages/api)
- [ ] `/worker/*` → Cloudflare Workers
  - Not used yet

Storage

- Cloudflare Workers KV
- Google SpreadSheet

## Permission

次の目的のために、それぞれのパーミッションを指定しています。

- SpreadSheetのファイル作成、編集: "https://www.googleapis.com/auth/drive.file"
- ユーザーID: "openid"
- ユーザーアバター画像: "profile"

## Note

### KV 

- KVには強整合性がないため、invalid stateが発生する
    - 保存したけど、次の読み込みに最新かが保証されない
    - 傾向的に2回目が最新になるという感じ
    - 更新してから、反映されるまでにラグがある感じ
