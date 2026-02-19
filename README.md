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
初回セットアップは以下を1回実行:

```bash
PROJECT_ID=xiidec REPO=kurehajime/colamone_vs ./scripts/setup-github-oidc.sh
```

スクリプト実行後に表示される2つを GitHub Actions Secrets に登録:

- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`

これで `master` への push（PRマージ含む）で Cloud Run に自動デプロイされます。

デプロイ後のURLでそのままプレイ可能です。

## 現在の状態

- 既存ゲームUI/ロジック（`colamone_vs.html`, `boardgame_vs.js`, `rtc.js`）は `public/` 配下でそのまま稼働
- まずは Next.js 化と Cloud Run 稼働確認を優先
- 新SkyWay token API は次のステップで追加
