# nikuTeach — オンライン家庭教師アプリ

先生（自分専用）と生徒のためのオンライン家庭教師アプリです。
Next.js (App Router) + TypeScript + Prisma + SQLite + Tailwind CSS で構築。

## 主な機能

| 機能 | 内容 |
| --- | --- |
| 役割分け | 先生用 / 生徒用の画面を分離（ログインで自動振り分け） |
| チャット | 先生 ⇄ 生徒のリアルタイム風チャット（生徒ごとのスレッド、3秒ポーリング） |
| 問題画像の共有 | 授業ごとに作成。先生・生徒どちらからでも画像の追加/削除が可能 |
| 予約枠 | 先生が授業可能な日時を登録。生徒が空き枠から選んで予約 |
| 自動で埋まる | ある生徒が予約すると枠は `BOOKED` になり、他の生徒には表示されない（競合は条件付き更新で安全に処理） |
| ビデオ通話URL | 予約確定時に自動生成（既定は Jitsi Meet のユニークルーム。`src/lib/video.ts` で差し替え可能） |
| フィードバック | 授業後に先生・生徒の双方から送信・閲覧（任意で5段階評価） |
| 成績 | 生徒がテストの点数・内申点を入力。先生はいつでも閲覧可能 |

## セットアップ

```bash
npm install
npx prisma migrate dev --name init   # DB作成（初回のみ）
npx tsx prisma/seed.ts               # 初期アカウント投入
npm run dev                          # http://localhost:3000
```

### 初期アカウント

| 役割 | ユーザー名 | パスワード |
| --- | --- | --- |
| 先生 | `teacher` | `teacher123` |
| 生徒 | `student` | `student123` |

生徒アカウントは先生画面の「生徒・成績」からも追加できます。

## 使い方の流れ

1. **先生**でログイン → 「予約枠」で授業可能な日時を追加
2. **生徒**でログイン → 「予約する」で空き枠を選択（ビデオURLが自動発行され授業ページへ）
3. 授業ページで問題画像を共有・ビデオ通話に参加
4. 授業後、双方からフィードバックを送信
5. 生徒は「成績入力」でテスト点数・内申点を記録 → 先生は「生徒・成績」で確認

## 技術メモ

- **認証**: HMAC 署名付き Cookie セッション（`src/lib/auth.ts`）。本番では `.env` の `SESSION_SECRET` を必ず変更してください。
- **DB**: SQLite（`prisma/dev.db`）。スキーマは `prisma/schema.prisma`。
- **画像**: base64 data URL として DB に保存（最大約4MB/枚）。
- **ビデオURL**: `VIDEO_BASE_URL`（既定 `https://meet.jit.si`）配下にユニークなルーム名を生成。Zoom 等に変える場合は `src/lib/video.ts` の `generateVideoUrl` を差し替え。

## 環境変数（`.env`）

```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="（本番では長いランダム文字列に変更）"
VIDEO_BASE_URL="https://meet.jit.si"
```
