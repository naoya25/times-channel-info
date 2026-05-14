const SLACK_SERVER_ERROR_PREFIX = "We're sorry";

function slackFetchWithRetry<T extends { ok: boolean; error?: string }>(
  url: string,
  token: string,
): T {
  let attempt = 0;

  while (true) {
    const res = UrlFetchApp.fetch(url, {
      method: "get",
      headers: { Authorization: "Bearer " + token },
      muteHttpExceptions: true,
    });

    const statusCode = res.getResponseCode();

    if (statusCode === 429) {
      const headers = res.getHeaders() as Record<string, string>;
      const retryAfter = Number(headers["Retry-After"] ?? 5);
      Utilities.sleep(retryAfter * 1000);
      continue;
    }

    // 5xx: Slack side server error — retry with exponential backoff (max 3 times)
    if (statusCode >= 500) {
      if (attempt >= 3) throw new Error(`HTTP ${statusCode}`);
      Utilities.sleep(Math.pow(2, attempt) * 2000);
      attempt++;
      continue;
    }

    const json = JSON.parse(res.getContentText()) as T;

    if (!json.ok) {
      // Slack's transient server errors come back as HTTP 200 with ok:false
      if (json.error?.startsWith(SLACK_SERVER_ERROR_PREFIX) && attempt < 3) {
        Utilities.sleep(Math.pow(2, attempt) * 2000);
        attempt++;
        continue;
      }
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
