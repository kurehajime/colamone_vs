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

### 手動デプロイ

```bash
gcloud config set project xiidec

gcloud run deploy colamone-vs \
  --source . \
  --region asia-northeast1 \
  --allow-unauthenticated
```

### 自動デプロイ（main/master マージ時）

`.github/workflows/deploy-cloud-run.yml` を追加済みです。  
有効化に必要な GitHub Secrets:

- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`

この2つを設定すると、`master` への push（PRマージ含む）で Cloud Run に自動デプロイされます。

デプロイ後のURLでそのままプレイ可能です。

## 現在の状態

- 既存ゲームUI/ロジック（`colamone_vs.html`, `boardgame_vs.js`, `rtc.js`）は `public/` 配下でそのまま稼働
- まずは Next.js 化と Cloud Run 稼働確認を優先
- 新SkyWay token API は次のステップで追加
