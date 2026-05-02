// function fetchTimesChannels() {
//   const ss = SpreadsheetApp.getActiveSpreadsheet();
//   const config = fetchConfigs();

//   const sheetName = config["TIMES_SHEET_NAME"];
//   const regex = parseRegex(config["TIME_CHANNEL_PREFIX_REGEX"]);

//   // シート準備
//   let sheet = ss.getSheetByName(sheetName);
//   if (!sheet) {
//     sheet = ss.insertSheet(sheetName);
//   } else {
//     sheet.clear();
//   }

//   const token = PropertiesService.getScriptProperties().getProperty("SLACK_BOT_TOKEN");

//   // ===== チャンネル取得（ページング） =====
//   let cursor = "";
//   const allChannels = [];

//   do {
//     const url = buildUrl_("https://slack.com/api/conversations.list", {
//       types: "public_channel",
//       exclude_archived: true,
//       limit: 200,
//       cursor: cursor
//     });

//     const json = slackFetchWithRetry(url, token);

//     allChannels.push(...json.channels);

//     cursor = json.response_metadata?.next_cursor || "";
//   } while (cursor);

//   // ===== timesチャンネル抽出 =====
//   const timesChannels = allChannels.filter(ch => {
//     if (!ch.name) return false;
//     return regex.test(ch.name);
//   });

//   // ===== ヘッダー =====
//   const output = [
//     ["channel_id", "channel_name", "creator", "created", "num_members"]
//   ];

//   // ===== データ整形 =====
//   timesChannels.forEach(ch => {
//     output.push([
//       ch.id,
//       ch.name,
//       ch.creator || "",
//       ch.created ? new Date(ch.created * 1000) : "",
//       ch.num_members || ""
//     ]);
//   });

//   // ===== 書き込み =====
//   sheet.getRange(1, 1, output.length, output[0].length).setValues(output);
// }







function fetchTimesChannels() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const config = fetchConfigs();

  const sheetName = config["TIMES_SHEET_NAME"];
  const regex = parseRegex(config["TIME_CHANNEL_PREFIX_REGEX"]);

  // シート準備（なければ作成）
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  // ===== 1. 既存データの取得（差分比較用） =====
  let existingChannelIds = [];
  const lastRow = sheet.getLastRow();

  // 見出し行(1行目)より下にデータがある場合のみIDを取得
  if (lastRow > 1) {
    existingChannelIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  }

  const token = PropertiesService.getScriptProperties().getProperty("SLACK_BOT_TOKEN");

  // ===== 2. チャンネル取得（ページング） =====
  let cursor = "";
  const allChannels = [];

  do {
    const url = buildUrl_("https://slack.com/api/conversations.list", {
      types: "public_channel",
      exclude_archived: true,
      limit: 200,
      cursor: cursor
    });

    const json = slackFetchWithRetry(url, token);
    allChannels.push(...json.channels);
    cursor = json.response_metadata?.next_cursor || "";
  } while (cursor);

  // ===== 3. timesチャンネル抽出 =====
  const timesChannels = allChannels.filter(ch => {
    if (!ch.name) return false;
    return regex.test(ch.name);
  });

  // ===== 4. 差分の抽出 =====
  // 最新のtimesの中から、既存IDリストに含まれていないものを抽出
  const newChannels = timesChannels.filter(ch => !existingChannelIds.includes(ch.id));

  // ===== 5. データ整形と書き込み =====
  const output = [
    ["channel_id", "channel_name", "creator", "created", "num_members"]
  ];

  timesChannels.forEach(ch => {
    output.push([
      ch.id,
      ch.name,
      ch.creator || "",
      ch.created ? new Date(ch.created * 1000) : "",
      ch.num_members || ""
    ]);
  });

  // 中身をクリアしてから書き込み（行数と列数の順番を厳守）
  sheet.clear();
  sheet.getRange(1, 1, output.length, output[0].length).setValues(output);

  // ===== 6. 差分を返却 =====
  return newChannels;
}
