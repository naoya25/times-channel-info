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

function postToSlack(chId: string, text: string): SlackPostMessageResponse {
  const token =
    PropertiesService.getScriptProperties().getProperty("SLACK_BOT_TOKEN");
  if (!token) throw new Error("SLACK_BOT_TOKEN が未設定です");

  const response = UrlFetchApp.fetch("https://slack.com/api/chat.postMessage", {
    method: "post",
    contentType: "application/json; charset=utf-8",
    headers: {
      Authorization: "Bearer " + token,
    },
    payload: JSON.stringify({
      channel: chId,
      text: text,
    }),
    muteHttpExceptions: true,
  });

  const result = JSON.parse(
    response.getContentText(),
  ) as SlackPostMessageResponse;
  if (!result.ok) {
    throw new Error(response.getContentText());
  }

  return result;
}
