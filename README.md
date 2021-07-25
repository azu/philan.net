# philan.net

寄付者が寄付の予算と実施した履歴を管理するツール。

A donation webservice that allow you to manage your donations.

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

:memo: ローカルでは、統計処理など一部はモックの実装となっています


## Architectures

See [Next.js + Vercel + Cloudflare Workers KV + Googleスプレットシートで寄付管理サービスを作った | Web Scratch](https://efcl.info/2021/03/12/next.js-vercel-cloudflare-workers-kv/)

Frontend

- Next.js

Backend

- Vercel

Storage

- Cloudflare Workers KV
- Google SpreadSheet

## Permission

次の目的のために、それぞれのパーミッションを指定しています。

- SpreadSheetのファイル作成、編集: "https://www.googleapis.com/auth/drive.file"
- ユーザーID: "openid"
- ユーザーアバター画像: "profile"

## Sponsors

[![Powered by Vercel](./web/public/vercel.svg)](https://vercel.com/?utm_source=philan-net&utm_campaign=oss)


