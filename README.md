# philan.net


## Architectures

This application is based on Cloudflare Workers + Next.js(Vercel).

- `/worker/*` → Cloudflare Workers
- `/api/*` → Next.js API

## Production

- Cloudflare Workers → Next.js → Cloudflare Workers →　Next.js API

## Development

- Next.js → Cloudflare Workers →　Next.js API 


## KV 

- KVには強整合性がないため、invalid stateが発生する
    - 保存したけど、次の読み込みに最新かが保証されない
    - 傾向的に2回目が最新になるという感じ
    - 更新してから、反映されるまでにラグがある感じ
