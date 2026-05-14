function notifyNewTimesChannels(
  newChannels: SlackChannel[],
  targetChannel: string,
  config: Record<string, string>,
): void {
  console.log(`新着 times チャンネルの通知処理を開始します。対象: ${newChannels.length}件`);

  if (newChannels.length === 0) {
    console.log("新着の times チャンネルはありませんでした。");
    return;
  }

  const userMap = getUserMap(config);

  let msg = "🎉 *新しい times チャンネルが誕生しました！* 🎉\n";
  newChannels.forEach((ch) => {
    const creatorName = ch.creator
      ? (userMap[ch.creator] ?? "anonymous")
      : "anonymous";
    msg += `<#${ch.id}> creator: ${creatorName}\n`;
  });

  console.log(msg);
  postToSlack(targetChannel, msg);
  console.log(`${newChannels.length}件の新着 times チャンネルを通知しました。`);
}
