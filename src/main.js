function main() {
  fetchSlackUsers();
  const newChannels = fetchTimesChannels();

  // 新チャンネルを通知
  if (!newChannels || newChannels.length === 0) {
    console.log("新着のtimesチャンネルはありませんでした。");
    return;
  }

  const config = fetchConfigs();
  const targetChannel = config["NEWS_CHANNEL_ID"];
  let msg = "🎉 *新しい times チャンネルが誕生しました！* 🎉\n";
  const userMap = getUserMap();

  newChannels.forEach((ch) => {
    const creatorName = ch.creator
      ? userMap[ch.creator] || "anonymous"
      : "anonymous";
    msg += `<#${ch.id}> creator: ${creatorName}\n`;
  });

  console.log(msg);
  try {
    postToSlack(targetChannel, msg);
    console.log(`${newChannels.length}件の新着timesを通知しました。`);
  } catch (e) {
    console.error("Slack通知でエラーが発生しました: " + e.msg);
  }
}
