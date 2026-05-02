type UrlParams = Record<string, string | number | boolean | undefined | null>;

function buildUrl_(base: string, params: UrlParams): string {
  const query = Object.keys(params)
    .filter(
      (key) =>
        params[key] !== "" && params[key] !== null && params[key] !== undefined,
    )
    .map(
      (key) =>
        encodeURIComponent(key) + "=" + encodeURIComponent(String(params[key])),
    )
    .join("&");

  return query ? base + "?" + query : base;
}

function parseRegex(str: string): RegExp {
  const match = str.match(/^\/(.+)\/([a-z]*)$/i);
  if (!match) {
    throw new Error("Invalid regex: " + str);
  }
  return new RegExp(match[1], match[2]);
}

function slackFetchWithRetry<T extends { ok: boolean; error?: string }>(
  url: string,
  token: string,
): T {
  while (true) {
    const res = UrlFetchApp.fetch(url, {
      method: "get",
      headers: { Authorization: "Bearer " + token },
      muteHttpExceptions: true,
    });

    if (res.getResponseCode() === 429) {
      const headers = res.getHeaders() as Record<string, string>;
      const retryAfter = Number(headers["Retry-After"] ?? 5);
      Utilities.sleep(retryAfter * 1000);
      continue;
    }

    const json = JSON.parse(res.getContentText()) as T;

    if (!json.ok) {
      throw new Error(json.error);
    }

    return json;
  }
}

function getUserMap(): Record<string, string> {
  const config = fetchConfigs();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(config["USERS_SHEET_NAME"]);
  const userMap: Record<string, string> = {};

  if (!sheet) return userMap;

  const data = sheet.getDataRange().getValues() as string[][];

  // 1行目はヘッダー想定なので i = 1 からスタート
  for (let i = 1; i < data.length; i++) {
    const id = data[i][0];
    const name = data[i][1];
    const displayName = data[i][2];

    if (id) {
      // display_name があれば優先し、なければ name、どちらも無ければ "anonymous"
      userMap[id] = displayName || name || "anonymous";
    }
  }

  return userMap;
}
