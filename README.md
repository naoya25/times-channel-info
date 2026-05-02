# times-channel-info

Slack の times チャンネルを定期的に集計し、新規チャンネルを通知する Google Apps Script (GAS) プロジェクト。

## 概要

Slack Bot Token を使って以下を自動実行する。

1. ワークスペース内の全ユーザーを取得し、スプレッドシートに保存する
2. 正規表現にマッチする times チャンネルを全件取得し、スプレッドシートに保存する
3. 前回実行時から新たに作成された times チャンネルを検出し、指定チャンネルに通知する

## ファイル構成

```
src/
├── main.js                # エントリーポイント
├── fetchConfigs.js        # スプレッドシートから設定値を読み込む
├── fetchSlackUsers.js     # Slack ユーザー一覧を取得・保存
├── fetchTimesChannels.js  # times チャンネルを取得・差分検出・保存
├── postSlackChannel.js    # Slack へメッセージを投稿
└── utils.js               # URL ビルダー・正規表現パース・API リトライ・ユーザーマップ
```

## セットアップ

### 前提条件

- Node.js / npm
- [clasp](https://github.com/google/clasp) (GAS デプロイツール)
- Slack Bot Token（`conversations:read`, `users:read`, `chat:write` スコープが必要）

### 手順

1. 依存パッケージをインストールする

    ```bash
    npm install
    ```

2. clasp でログインし、GAS プロジェクトと紐付ける

    ```bash
    npx clasp login
    npx clasp clone <scriptId>  # または npx clasp create
    ```

3. GAS のスクリプトプロパティに以下を設定する

    | キー              | 値                                       |
    | ----------------- | ---------------------------------------- |
    | `SLACK_BOT_TOKEN` | Slack Bot の OAuth トークン (`xoxb-...`) |

4. スプレッドシートに `configs` シートを作成し、以下の設定値を入力する（1行目はヘッダー行）

    | キー                             | 値の例       | 説明                                   |
    | -------------------------------- | ------------ | -------------------------------------- |
    | `TIMES_SHEET_NAME`               | `times`      | times チャンネル一覧を書き込むシート名 |
    | `TIME_CHANNEL_PREFIX_REGEX`      | `/^times_/i` | times チャンネルを識別する正規表現     |
    | `USERS_SHEET_NAME`               | `users`      | ユーザー一覧を書き込むシート名         |
    | `EXCLUDE_BOTS`                   | `true`       | ボットユーザーを除外するか             |
    | `EXCLUDE_DELETED_USERS`          | `true`       | 削除済みユーザーを除外するか           |
    | `EXCLUDE_RESTRICTED_USERS`       | `false`      | 制限ユーザーを除外するか               |
    | `EXCLUDE_ULTRA_RESTRICTED_USERS` | `false`      | 超制限ユーザーを除外するか             |

5. `main.js` の `targetChannel` を通知先のチャンネル ID に変更する

6. コードをデプロイする

    ```bash
    npm run deploy
    ```

## 実行方法

GAS のトリガーを設定して `main` 関数を定期実行する（例: 毎日午前9時）。

手動実行する場合は、GAS エディタから `main` 関数を直接実行する。

## 開発

```bash
# 型チェック
npm run check

# GAS へプッシュ（型チェックなし）
npm run push

# 型チェック後にプッシュ
npm run deploy

# GAS エディタを開く
npm run open
```

## スプレッドシートの出力形式

### times シート

| channel_id | channel_name | creator | created    | num_members |
| ---------- | ------------ | ------- | ---------- | ----------- |
| C...       | times_yamada | U...    | 2024-01-01 | 5           |

### users シート

| id   | name   | real_name | display_name | is_bot | deleted |
| ---- | ------ | --------- | ------------ | ------ | ------- |
| U... | yamada | 山田 太郎 | yamada       | false  | false   |
