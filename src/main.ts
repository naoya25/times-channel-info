function main(targetChannel: string = TARGET_CHANNEL): void {
  const config = fetchConfigs();
  const userCount = fetchSlackUsers(config);
  const newChannels = fetchTimesChannels(config);
  notifyNewTimesChannels(newChannels, targetChannel, config);

  console.log(
    `処理完了 — ユーザー: ${userCount}人 / 新着 times: ${newChannels.length}件 / 通知先: ${targetChannel}`,
  );
}
