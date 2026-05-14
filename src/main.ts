function main(targetChannel: string = TARGET_CHANNEL): void {
  const config = fetchConfigs();
  const userCount = fetchSlackUsers(config);
  const { newChannels, allTimesChannels } = fetchTimesChannels(config);

  try {
    notifyNewTimesChannels(newChannels, targetChannel, config);
    updateTimesChannelsSheet(config, allTimesChannels);
  } catch (e) {
    const errMsg = (e as Error).message;
    const sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
    console.error("通知に失敗しました: " + errMsg);
    postToSlack(
      config["NEWS_CHANNEL_ID"],
      `<@${config["OWNER_ID"]}> times チャンネルの通知に失敗しました。\nエラー: ${errMsg}\nシート: ${sheetUrl}`,
    );
    return;
  }

  console.log(
    `処理完了 — ユーザー: ${userCount}人 / 新着 times: ${newChannels.length}件 / 通知先: ${targetChannel}`,
  );
}
