interface SlackChannel {
  id: string;
  name: string;
  creator?: string;
  created?: number;
  num_members?: number;
}

interface SlackUser {
  id: string;
  name: string;
  real_name?: string;
  is_bot: boolean;
  deleted: boolean;
  is_restricted?: boolean;
  is_ultra_restricted?: boolean;
  profile?: {
    display_name?: string;
  };
}

interface SlackConversationsResponse {
  ok: boolean;
  error?: string;
  channels: SlackChannel[];
  response_metadata?: { next_cursor: string };
}

interface SlackUsersResponse {
  ok: boolean;
  error?: string;
  members: SlackUser[];
  response_metadata?: { next_cursor: string };
}

interface SlackPostMessageResponse {
  ok: boolean;
  error?: string;
}
