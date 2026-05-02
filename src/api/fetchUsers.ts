function fetchUsersFromSlack(token: string): SlackUser[] {
  let cursor = "";
  const allUsers: SlackUser[] = [];

  do {
    const url = buildUrl_("https://slack.com/api/users.list", {
      limit: 200,
      cursor: cursor,
    });

    const json = slackFetchWithRetry<SlackUsersResponse>(url, token);
    allUsers.push(...json.members);
    cursor = json.response_metadata?.next_cursor ?? "";

    Utilities.sleep(300);
  } while (cursor);

  return allUsers;
}
