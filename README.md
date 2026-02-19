# colamone_vs

colamone_vs を **Next.js + Cloud Run** で動かすためのベース構成です。

## Local

```bash
npm install
npm run dev
# http://localhost:3000
```

トップ (`/`) は `/colamone_vs.html` にリダイレクトします。

## Cloud Run deploy

```bash
gcloud config set project xiidec

gcloud run deploy colamone-vs \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated
```

デプロイ後のURLでそのままプレイ可能です。

## 現在の状態

- 既存ゲームUI/ロジック（`colamone_vs.html`, `boardgame_vs.js`, `rtc.js`）は `public/` 配下でそのまま稼働
- まずは Next.js 化と Cloud Run 稼働確認を優先
- 新SkyWay token API は次のステップで追加
