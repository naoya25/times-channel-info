function fetchSlackUsers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const config = fetchConfigs();
  const token =
    PropertiesService.getScriptProperties().getProperty("SLACK_BOT_TOKEN");

  const excludeBots = config["EXCLUDE_BOTS"];
  const excludeDeleted = config["EXCLUDE_DELETED_USERS"];
  const excludeRestricted = config["EXCLUDE_RESTRICTED_USERS"];
  const excludeUltraRestricted = config["EXCLUDE_ULTRA_RESTRICTED_USERS"];

  // ===== シート準備 =====
  let sheet = ss.getSheetByName(config["USERS_SHEET_NAME"]);
  if (!sheet) sheet = ss.insertSheet(config["USERS_SHEET_NAME"]);
  else sheet.clear();

  // ===== ユーザ取得（ページング） =====
  let cursor = "";
  const allUsers = [];

  do {
    const url = buildUrl_("https://slack.com/api/users.list", {
      limit: 200,
      cursor: cursor,
    });

    const json = slackFetchWithRetry(url, token);

    allUsers.push(...json.members);
    cursor = json.response_metadata?.next_cursor || "";

    Utilities.sleep(300); // 軽いレート制限対策
  } while (cursor);

  // ===== 出力 =====
  const output = [
    ["id", "name", "real_name", "display_name", "is_bot", "deleted"],
  ];

  allUsers.forEach((user) => {
    if (excludeBots && user.is_bot) return;
    if (excludeDeleted && user.deleted) return;
    if (excludeRestricted && user.is_restricted) return;
    if (excludeUltraRestricted && user.is_ultra_restricted) return;

    output.push([
      user.id,
      user.name,
      user.real_name || "",
      user.profile?.display_name || "",
      user.is_bot,
      user.deleted,
    ]);
  });

  sheet.getRange(1, 1, output.length, output[0].length).setValues(output);
}
