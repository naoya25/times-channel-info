function fetchChannelsFromSlack(token: string): SlackChannel[] {
  let cursor = "";
  const allChannels: SlackChannel[] = [];

  do {
    const url = buildUrl_("https://slack.com/api/conversations.list", {
      types: "public_channel",
      exclude_archived: true,
      limit: 200,
      cursor: cursor,
    });

    const json = slackFetchWithRetry<SlackConversationsResponse>(url, token);
    allChannels.push(...json.channels);
    cursor = json.response_metadata?.next_cursor ?? "";
  } while (cursor);

  return allChannels;
}
