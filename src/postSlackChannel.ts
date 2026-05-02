function postToSlack(chId: string, text: string): SlackPostMessageResponse {
  const token = PropertiesService.getScriptProperties().getProperty(
    "SLACK_BOT_TOKEN_dev",
  ); // FIXME: デバッグ用
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
