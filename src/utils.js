function buildUrl_(base, params) {
  const query = Object.keys(params)
    .filter(key => params[key] !== "" && params[key] !== null && params[key] !== undefined)
    .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(params[key]))
    .join("&");

  return query ? base + "?" + query : base;
}

function parseRegex(str) {
  const match = str.match(/^\/(.+)\/([a-z]*)$/i);
  if (!match) {
    throw new Error("Invalid regex: " + str);
  }
  return new RegExp(match[1], match[2]);
}

function slackFetchWithRetry(url, token) {
  while (true) {
    const res = UrlFetchApp.fetch(url, {
      method: "get",
      headers: { Authorization: "Bearer " + token },
      muteHttpExceptions: true
    });

    if (res.getResponseCode() === 429) {
      const retryAfter = Number(res.getHeaders()["Retry-After"] || 5);
      Utilities.sleep(retryAfter * 1000);
      continue;
    }

    const json = JSON.parse(res.getContentText());

    if (!json.ok) {
      throw new Error(json.error);
    }

    return json;
  }
}


function getUserMap() {
  const config = fetchConfigs();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(config["USERS_SHEET_NAME"]);
  const userMap = {};

  if (!sheet) return userMap;

  // データのある範囲を一括取得
  const data = sheet.getDataRange().getValues();

  // 1行目はヘッダー想定なので i = 1 からスタート
  for (let i = 1; i < data.length; i++) {
    const id = data[i][0];          // A列: ID
    const name = data[i][1];        // B列: real_name など
    const displayName = data[i][2]; // C列: display_name など

    if (id) {
      // display_name があれば優先し、なければ name、どちらも無ければ "anonymous"
      userMap[id] = displayName || name || "anonymous";
    }
  }

  return userMap;
}