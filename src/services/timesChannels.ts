function fetchTimesChannels(config: Record<string, string>): {
  newChannels: SlackChannel[];
  allTimesChannels: SlackChannel[];
} {
  console.log("times チャンネルの取得を開始します...");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = config["TIMES_SHEET_NAME"];
  const regex = parseRegex(config["TIME_CHANNEL_PREFIX_REGEX"]);

  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  let existingChannelIds: string[] = [];
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    existingChannelIds = (
      sheet.getRange(2, 1, lastRow - 1, 1).getValues() as string[][]
    ).flat();
  }

  const token =
    PropertiesService.getScriptProperties().getProperty("SLACK_BOT_TOKEN");

  const allChannels = fetchChannelsFromSlack(token!);

  const allTimesChannels = allChannels.filter(
    (ch) => ch.name && regex.test(ch.name),
  );

  const newChannels = allTimesChannels.filter(
    (ch) => !existingChannelIds.includes(ch.id),
  );

  console.log(
    `${allTimesChannels.length}件の times チャンネルを取得しました。新着: ${newChannels.length}件`,
  );

  return { newChannels, allTimesChannels };
}

function updateTimesChannelsSheet(
  config: Record<string, string>,
  timesChannels: SlackChannel[],
): void {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = config["TIMES_SHEET_NAME"];

  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  const output: (string | number | Date)[][] = [
    ["channel_id", "channel_name", "creator", "created", "num_members"],
  ];

  timesChannels.forEach((ch) => {
    output.push([
      ch.id,
      ch.name,
      ch.creator ?? "",
      ch.created ? new Date(ch.created * 1000) : "",
      ch.num_members ?? "",
    ]);
  });

  sheet.clear();
  sheet.getRange(1, 1, output.length, output[0].length).setValues(output);

  console.log(`スプレッドシートを更新しました。${timesChannels.length}件`);
}
