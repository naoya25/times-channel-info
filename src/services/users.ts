function fetchSlackUsers(config: Record<string, string>): number {
  console.log("Slack ユーザーの取得を開始します...");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const token =
    PropertiesService.getScriptProperties().getProperty("SLACK_BOT_TOKEN");

  const excludeBots = config["EXCLUDE_BOTS"] === "true";
  const excludeDeleted = config["EXCLUDE_DELETED_USERS"] === "true";
  const excludeRestricted = config["EXCLUDE_RESTRICTED_USERS"] === "true";
  const excludeUltraRestricted =
    config["EXCLUDE_ULTRA_RESTRICTED_USERS"] === "true";

  let sheet = ss.getSheetByName(config["USERS_SHEET_NAME"]);
  if (!sheet) sheet = ss.insertSheet(config["USERS_SHEET_NAME"]);
  else sheet.clear();

  const allUsers = fetchUsersFromSlack(token!);

  const output: (string | boolean)[][] = [
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
      user.real_name ?? "",
      user.profile?.display_name ?? "",
      user.is_bot,
      user.deleted,
    ]);
  });

  sheet.getRange(1, 1, output.length, output[0].length).setValues(output);

  const savedCount = output.length - 1;
  console.log(`${savedCount}人のユーザーを取得しました。`);
  return savedCount;
}

function getUserMap(config: Record<string, string>): Record<string, string> {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(config["USERS_SHEET_NAME"]);
  const userMap: Record<string, string> = {};

  if (!sheet) return userMap;

  const data = sheet.getDataRange().getValues() as string[][];

  for (let i = 1; i < data.length; i++) {
    const id = data[i][0];
    const name = data[i][1];
    const displayName = data[i][2];

    if (id) {
      userMap[id] = displayName || name || "anonymous";
    }
  }

  return userMap;
}
