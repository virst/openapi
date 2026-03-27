import {
  GetAuditEventsParams,
  GetAuditEventsResponse,
  AuditEvent,
  OAuthError,
  ApiError,
  GetWebhookEventsParams,
  GetWebhookEventsResponse,
  WebhookEvent,
  BotUpdateRequest,
  BotResponse,
  ListChatsParams,
  ListChatsResponse,
  Chat,
  ChatCreateRequest,
  ChatUpdateRequest,
  ListPropertiesParams,
  ListPropertiesResponse,
  ExportRequest,
  FileUploadRequest,
  UploadParams,
  ListMembersParams,
  ListMembersResponse,
  User,
  AddMembersRequest,
  ChatMemberRole,
  ListTagsParams,
  ListTagsResponse,
  GroupTag,
  GetTagUsersParams,
  GroupTagRequest,
  ListChatMessagesParams,
  ListChatMessagesResponse,
  Message,
  MessageCreateRequest,
  MessageUpdateRequest,
  LinkPreviewsRequest,
  ListReactionsParams,
  ListReactionsResponse,
  Reaction,
  ReactionRequest,
  RemoveReactionParams,
  ListReadMembersParams,
  Thread,
  AccessTokenInfo,
  StatusUpdateRequest,
  UserStatus,
  SearchChatsParams,
  SearchMessagesParams,
  SearchUsersParams,
  ListTasksParams,
  ListTasksResponse,
  Task,
  TaskCreateRequest,
  TaskUpdateRequest,
  ListUsersParams,
  UserCreateRequest,
  UserUpdateRequest,
  OpenViewRequest,
} from "./types";
import { deserialize, serialize, fetchWithRetry } from "./utils";

export class SecurityService {
  async getAuditEvents(params?: GetAuditEventsParams): Promise<GetAuditEventsResponse> {
    throw new Error("Security.getAuditEvents is not implemented");
  }

  async getAuditEventsAll(params?: Omit<GetAuditEventsParams, 'cursor'>): Promise<AuditEvent[]> {
    throw new Error("Security.getAuditEventsAll is not implemented");
  }
}

export class SecurityServiceImpl extends SecurityService {
  constructor(
    private baseUrl: string,
    private headers: Record<string, string>,
  ) {
    super();
  }

  override async getAuditEvents(params?: GetAuditEventsParams): Promise<GetAuditEventsResponse> {
    const query = new URLSearchParams();
    if (params?.startTime !== undefined) query.set("start_time", params.startTime);
    if (params?.endTime !== undefined) query.set("end_time", params.endTime);
    if (params?.eventKey !== undefined) query.set("event_key", params.eventKey);
    if (params?.actorId !== undefined) query.set("actor_id", params.actorId);
    if (params?.actorType !== undefined) query.set("actor_type", params.actorType);
    if (params?.entityId !== undefined) query.set("entity_id", params.entityId);
    if (params?.entityType !== undefined) query.set("entity_type", params.entityType);
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.cursor !== undefined) query.set("cursor", params.cursor);
    const url = `${this.baseUrl}/audit_events${query.toString() ? `?${query}` : ""}`;
    const response = await fetchWithRetry(url, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body) as GetAuditEventsResponse;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async getAuditEventsAll(params?: Omit<GetAuditEventsParams, 'cursor'>): Promise<AuditEvent[]> {
    const items: AuditEvent[] = [];
    let cursor: string | undefined;
    do {
      const response = await this.getAuditEvents({ ...params, cursor } as GetAuditEventsParams);
      items.push(...response.data);
      cursor = response.meta?.paginate?.nextPage;
    } while (cursor);
    return items;
  }
}

export class BotsService {
  async getWebhookEvents(params?: GetWebhookEventsParams): Promise<GetWebhookEventsResponse> {
    throw new Error("Bots.getWebhookEvents is not implemented");
  }

  async getWebhookEventsAll(params?: Omit<GetWebhookEventsParams, 'cursor'>): Promise<WebhookEvent[]> {
    throw new Error("Bots.getWebhookEventsAll is not implemented");
  }

  async updateBot(id: number, request: BotUpdateRequest): Promise<BotResponse> {
    throw new Error("Bots.updateBot is not implemented");
  }

  async deleteWebhookEvent(id: string): Promise<void> {
    throw new Error("Bots.deleteWebhookEvent is not implemented");
  }
}

export class BotsServiceImpl extends BotsService {
  constructor(
    private baseUrl: string,
    private headers: Record<string, string>,
  ) {
    super();
  }

  override async getWebhookEvents(params?: GetWebhookEventsParams): Promise<GetWebhookEventsResponse> {
    const query = new URLSearchParams();
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.cursor !== undefined) query.set("cursor", params.cursor);
    const url = `${this.baseUrl}/webhooks/events${query.toString() ? `?${query}` : ""}`;
    const response = await fetchWithRetry(url, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body) as GetWebhookEventsResponse;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async getWebhookEventsAll(params?: Omit<GetWebhookEventsParams, 'cursor'>): Promise<WebhookEvent[]> {
    const items: WebhookEvent[] = [];
    let cursor: string | undefined;
    do {
      const response = await this.getWebhookEvents({ ...params, cursor } as GetWebhookEventsParams);
      items.push(...response.data);
      cursor = response.meta?.paginate?.nextPage;
    } while (cursor);
    return items;
  }

  override async updateBot(id: number, request: BotUpdateRequest): Promise<BotResponse> {
    const response = await fetchWithRetry(`${this.baseUrl}/bots/${id}`, {
      method: "PUT",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(serialize(request)),
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body.data) as BotResponse;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async deleteWebhookEvent(id: string): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/webhooks/events/${id}`, {
      method: "DELETE",
      headers: this.headers,
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }
}

export class ChatsService {
  async listChats(params?: ListChatsParams): Promise<ListChatsResponse> {
    throw new Error("Chats.listChats is not implemented");
  }

  async listChatsAll(params?: Omit<ListChatsParams, 'cursor'>): Promise<Chat[]> {
    throw new Error("Chats.listChatsAll is not implemented");
  }

  async getChat(id: number): Promise<Chat> {
    throw new Error("Chats.getChat is not implemented");
  }

  async createChat(request: ChatCreateRequest): Promise<Chat> {
    throw new Error("Chats.createChat is not implemented");
  }

  async updateChat(id: number, request: ChatUpdateRequest): Promise<Chat> {
    throw new Error("Chats.updateChat is not implemented");
  }

  async archiveChat(id: number): Promise<void> {
    throw new Error("Chats.archiveChat is not implemented");
  }

  async unarchiveChat(id: number): Promise<void> {
    throw new Error("Chats.unarchiveChat is not implemented");
  }
}

export class ChatsServiceImpl extends ChatsService {
  constructor(
    private baseUrl: string,
    private headers: Record<string, string>,
  ) {
    super();
  }

  override async listChats(params?: ListChatsParams): Promise<ListChatsResponse> {
    const query = new URLSearchParams();
    if (params?.sortId !== undefined) query.set("sort[{field}]", params.sortId);
    if (params?.availability !== undefined) query.set("availability", params.availability);
    if (params?.lastMessageAtAfter !== undefined) query.set("last_message_at_after", params.lastMessageAtAfter);
    if (params?.lastMessageAtBefore !== undefined) query.set("last_message_at_before", params.lastMessageAtBefore);
    if (params?.personal !== undefined) query.set("personal", String(params.personal));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.cursor !== undefined) query.set("cursor", params.cursor);
    const url = `${this.baseUrl}/chats${query.toString() ? `?${query}` : ""}`;
    const response = await fetchWithRetry(url, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body) as ListChatsResponse;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async listChatsAll(params?: Omit<ListChatsParams, 'cursor'>): Promise<Chat[]> {
    const items: Chat[] = [];
    let cursor: string | undefined;
    do {
      const response = await this.listChats({ ...params, cursor } as ListChatsParams);
      items.push(...response.data);
      cursor = response.meta?.paginate?.nextPage;
    } while (cursor);
    return items;
  }

  override async getChat(id: number): Promise<Chat> {
    const response = await fetchWithRetry(`${this.baseUrl}/chats/${id}`, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body.data) as Chat;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async createChat(request: ChatCreateRequest): Promise<Chat> {
    const response = await fetchWithRetry(`${this.baseUrl}/chats`, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(serialize(request)),
    });
    const body = await response.json();
    switch (response.status) {
      case 201:
        return deserialize(body.data) as Chat;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async updateChat(id: number, request: ChatUpdateRequest): Promise<Chat> {
    const response = await fetchWithRetry(`${this.baseUrl}/chats/${id}`, {
      method: "PUT",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(serialize(request)),
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body.data) as Chat;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async archiveChat(id: number): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/chats/${id}/archive`, {
      method: "PUT",
      headers: this.headers,
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }

  override async unarchiveChat(id: number): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/chats/${id}/unarchive`, {
      method: "PUT",
      headers: this.headers,
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }
}

export class CommonService {
  async downloadExport(id: number): Promise<string> {
    throw new Error("Common.downloadExport is not implemented");
  }

  async listProperties(params: ListPropertiesParams): Promise<ListPropertiesResponse> {
    throw new Error("Common.listProperties is not implemented");
  }

  async requestExport(request: ExportRequest): Promise<void> {
    throw new Error("Common.requestExport is not implemented");
  }

  async uploadFile(directUrl: string, request: FileUploadRequest): Promise<void> {
    throw new Error("Common.uploadFile is not implemented");
  }

  async getUploadParams(): Promise<UploadParams> {
    throw new Error("Common.getUploadParams is not implemented");
  }
}

export class CommonServiceImpl extends CommonService {
  constructor(
    private baseUrl: string,
    private headers: Record<string, string>,
  ) {
    super();
  }

  override async downloadExport(id: number): Promise<string> {
    const response = await fetchWithRetry(`${this.baseUrl}/chats/exports/${id}`, {
      headers: this.headers,
      redirect: "manual",
    });
    switch (response.status) {
      case 302: {
        const location = response.headers.get("location");
        if (!location) {
          throw new Error("Missing Location header in redirect response");
        }
        return location;
      }
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }

  override async listProperties(params: ListPropertiesParams): Promise<ListPropertiesResponse> {
    const query = new URLSearchParams();
    query.set("entity_type", params.entityType);
    const response = await fetchWithRetry(`${this.baseUrl}/custom_properties?${query}`, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body) as ListPropertiesResponse;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async requestExport(request: ExportRequest): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/chats/exports`, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(serialize(request)),
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }

  override async uploadFile(directUrl: string, request: FileUploadRequest): Promise<void> {
    const form = new FormData();
    form.set("Content-Disposition", request.contentDisposition);
    form.set("acl", request.acl);
    form.set("policy", request.policy);
    form.set("x-amz-credential", request.xAmzCredential);
    form.set("x-amz-algorithm", request.xAmzAlgorithm);
    form.set("x-amz-date", request.xAmzDate);
    form.set("x-amz-signature", request.xAmzSignature);
    form.set("key", request.key);
    form.set("file", request.file, "upload");
    const response = await fetchWithRetry(directUrl, {
      method: "POST",
      body: form,
    });
    switch (response.status) {
      case 204:
        return;
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }

  override async getUploadParams(): Promise<UploadParams> {
    const response = await fetchWithRetry(`${this.baseUrl}/uploads`, {
      method: "POST",
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 201:
        return deserialize(body) as UploadParams;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }
}

export class MembersService {
  async listMembers(id: number, params?: ListMembersParams): Promise<ListMembersResponse> {
    throw new Error("Members.listMembers is not implemented");
  }

  async listMembersAll(id: number, params?: Omit<ListMembersParams, 'cursor'>): Promise<User[]> {
    throw new Error("Members.listMembersAll is not implemented");
  }

  async addTags(id: number, groupTagIds: number[]): Promise<void> {
    throw new Error("Members.addTags is not implemented");
  }

  async addMembers(id: number, request: AddMembersRequest): Promise<void> {
    throw new Error("Members.addMembers is not implemented");
  }

  async updateMemberRole(id: number, userId: number, role: ChatMemberRole): Promise<void> {
    throw new Error("Members.updateMemberRole is not implemented");
  }

  async removeTag(id: number, tagId: number): Promise<void> {
    throw new Error("Members.removeTag is not implemented");
  }

  async leaveChat(id: number): Promise<void> {
    throw new Error("Members.leaveChat is not implemented");
  }

  async removeMember(id: number, userId: number): Promise<void> {
    throw new Error("Members.removeMember is not implemented");
  }
}

export class MembersServiceImpl extends MembersService {
  constructor(
    private baseUrl: string,
    private headers: Record<string, string>,
  ) {
    super();
  }

  override async listMembers(id: number, params?: ListMembersParams): Promise<ListMembersResponse> {
    const query = new URLSearchParams();
    if (params?.role !== undefined) query.set("role", params.role);
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.cursor !== undefined) query.set("cursor", params.cursor);
    const url = `${this.baseUrl}/chats/${id}/members${query.toString() ? `?${query}` : ""}`;
    const response = await fetchWithRetry(url, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body) as ListMembersResponse;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async listMembersAll(id: number, params?: Omit<ListMembersParams, 'cursor'>): Promise<User[]> {
    const items: User[] = [];
    let cursor: string | undefined;
    do {
      const response = await this.listMembers(id, { ...params, cursor } as ListMembersParams);
      items.push(...response.data);
      cursor = response.meta?.paginate?.nextPage;
    } while (cursor);
    return items;
  }

  override async addTags(id: number, groupTagIds: number[]): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/chats/${id}/group_tags`, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify({ group_tag_ids: groupTagIds }),
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }

  override async addMembers(id: number, request: AddMembersRequest): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/chats/${id}/members`, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(serialize(request)),
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }

  override async updateMemberRole(id: number, userId: number, role: ChatMemberRole): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/chats/${id}/members/${userId}`, {
      method: "PUT",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify({ role: role }),
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }

  override async removeTag(id: number, tagId: number): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/chats/${id}/group_tags/${tagId}`, {
      method: "DELETE",
      headers: this.headers,
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }

  override async leaveChat(id: number): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/chats/${id}/leave`, {
      method: "DELETE",
      headers: this.headers,
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }

  override async removeMember(id: number, userId: number): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/chats/${id}/members/${userId}`, {
      method: "DELETE",
      headers: this.headers,
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }
}

export class GroupTagsService {
  async listTags(params?: ListTagsParams): Promise<ListTagsResponse> {
    throw new Error("Group tags.listTags is not implemented");
  }

  async listTagsAll(params?: Omit<ListTagsParams, 'cursor'>): Promise<GroupTag[]> {
    throw new Error("Group tags.listTagsAll is not implemented");
  }

  async getTag(id: number): Promise<GroupTag> {
    throw new Error("Group tags.getTag is not implemented");
  }

  async getTagUsers(id: number, params?: GetTagUsersParams): Promise<ListMembersResponse> {
    throw new Error("Group tags.getTagUsers is not implemented");
  }

  async getTagUsersAll(id: number, params?: Omit<GetTagUsersParams, 'cursor'>): Promise<User[]> {
    throw new Error("Group tags.getTagUsersAll is not implemented");
  }

  async createTag(request: GroupTagRequest): Promise<GroupTag> {
    throw new Error("Group tags.createTag is not implemented");
  }

  async updateTag(id: number, request: GroupTagRequest): Promise<GroupTag> {
    throw new Error("Group tags.updateTag is not implemented");
  }

  async deleteTag(id: number): Promise<void> {
    throw new Error("Group tags.deleteTag is not implemented");
  }
}

export class GroupTagsServiceImpl extends GroupTagsService {
  constructor(
    private baseUrl: string,
    private headers: Record<string, string>,
  ) {
    super();
  }

  override async listTags(params?: ListTagsParams): Promise<ListTagsResponse> {
    const query = new URLSearchParams();
    if (params?.names !== undefined) query.set("names", String(params.names));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.cursor !== undefined) query.set("cursor", params.cursor);
    const url = `${this.baseUrl}/group_tags${query.toString() ? `?${query}` : ""}`;
    const response = await fetchWithRetry(url, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body) as ListTagsResponse;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async listTagsAll(params?: Omit<ListTagsParams, 'cursor'>): Promise<GroupTag[]> {
    const items: GroupTag[] = [];
    let cursor: string | undefined;
    do {
      const response = await this.listTags({ ...params, cursor } as ListTagsParams);
      items.push(...response.data);
      cursor = response.meta?.paginate?.nextPage;
    } while (cursor);
    return items;
  }

  override async getTag(id: number): Promise<GroupTag> {
    const response = await fetchWithRetry(`${this.baseUrl}/group_tags/${id}`, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body.data) as GroupTag;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async getTagUsers(id: number, params?: GetTagUsersParams): Promise<ListMembersResponse> {
    const query = new URLSearchParams();
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.cursor !== undefined) query.set("cursor", params.cursor);
    const url = `${this.baseUrl}/group_tags/${id}/users${query.toString() ? `?${query}` : ""}`;
    const response = await fetchWithRetry(url, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body) as ListMembersResponse;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async getTagUsersAll(id: number, params?: Omit<GetTagUsersParams, 'cursor'>): Promise<User[]> {
    const items: User[] = [];
    let cursor: string | undefined;
    do {
      const response = await this.getTagUsers(id, { ...params, cursor } as GetTagUsersParams);
      items.push(...response.data);
      cursor = response.meta?.paginate?.nextPage;
    } while (cursor);
    return items;
  }

  override async createTag(request: GroupTagRequest): Promise<GroupTag> {
    const response = await fetchWithRetry(`${this.baseUrl}/group_tags`, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(serialize(request)),
    });
    const body = await response.json();
    switch (response.status) {
      case 201:
        return deserialize(body.data) as GroupTag;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async updateTag(id: number, request: GroupTagRequest): Promise<GroupTag> {
    const response = await fetchWithRetry(`${this.baseUrl}/group_tags/${id}`, {
      method: "PUT",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(serialize(request)),
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body.data) as GroupTag;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async deleteTag(id: number): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/group_tags/${id}`, {
      method: "DELETE",
      headers: this.headers,
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }
}

export class MessagesService {
  async listChatMessages(params: ListChatMessagesParams): Promise<ListChatMessagesResponse> {
    throw new Error("Messages.listChatMessages is not implemented");
  }

  async listChatMessagesAll(params: Omit<ListChatMessagesParams, 'cursor'>): Promise<Message[]> {
    throw new Error("Messages.listChatMessagesAll is not implemented");
  }

  async getMessage(id: number): Promise<Message> {
    throw new Error("Messages.getMessage is not implemented");
  }

  async createMessage(request: MessageCreateRequest): Promise<Message> {
    throw new Error("Messages.createMessage is not implemented");
  }

  async pinMessage(id: number): Promise<void> {
    throw new Error("Messages.pinMessage is not implemented");
  }

  async updateMessage(id: number, request: MessageUpdateRequest): Promise<Message> {
    throw new Error("Messages.updateMessage is not implemented");
  }

  async deleteMessage(id: number): Promise<void> {
    throw new Error("Messages.deleteMessage is not implemented");
  }

  async unpinMessage(id: number): Promise<void> {
    throw new Error("Messages.unpinMessage is not implemented");
  }
}

export class MessagesServiceImpl extends MessagesService {
  constructor(
    private baseUrl: string,
    private headers: Record<string, string>,
  ) {
    super();
  }

  override async listChatMessages(params: ListChatMessagesParams): Promise<ListChatMessagesResponse> {
    const query = new URLSearchParams();
    query.set("chat_id", String(params.chatId));
    if (params?.sortId !== undefined) query.set("sort[{field}]", params.sortId);
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.cursor !== undefined) query.set("cursor", params.cursor);
    const response = await fetchWithRetry(`${this.baseUrl}/messages?${query}`, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body) as ListChatMessagesResponse;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async listChatMessagesAll(params: Omit<ListChatMessagesParams, 'cursor'>): Promise<Message[]> {
    const items: Message[] = [];
    let cursor: string | undefined;
    do {
      const response = await this.listChatMessages({ ...params, cursor } as ListChatMessagesParams);
      items.push(...response.data);
      cursor = response.meta?.paginate?.nextPage;
    } while (cursor);
    return items;
  }

  override async getMessage(id: number): Promise<Message> {
    const response = await fetchWithRetry(`${this.baseUrl}/messages/${id}`, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body.data) as Message;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async createMessage(request: MessageCreateRequest): Promise<Message> {
    const response = await fetchWithRetry(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(serialize(request)),
    });
    const body = await response.json();
    switch (response.status) {
      case 201:
        return deserialize(body.data) as Message;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async pinMessage(id: number): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/messages/${id}/pin`, {
      method: "POST",
      headers: this.headers,
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }

  override async updateMessage(id: number, request: MessageUpdateRequest): Promise<Message> {
    const response = await fetchWithRetry(`${this.baseUrl}/messages/${id}`, {
      method: "PUT",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(serialize(request)),
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body.data) as Message;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async deleteMessage(id: number): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/messages/${id}`, {
      method: "DELETE",
      headers: this.headers,
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }

  override async unpinMessage(id: number): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/messages/${id}/pin`, {
      method: "DELETE",
      headers: this.headers,
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }
}

export class LinkPreviewsService {
  async createLinkPreviews(id: number, request: LinkPreviewsRequest): Promise<void> {
    throw new Error("Link Previews.createLinkPreviews is not implemented");
  }
}

export class LinkPreviewsServiceImpl extends LinkPreviewsService {
  constructor(
    private baseUrl: string,
    private headers: Record<string, string>,
  ) {
    super();
  }

  override async createLinkPreviews(id: number, request: LinkPreviewsRequest): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/messages/${id}/link_previews`, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(serialize(request)),
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }
}

export class ReactionsService {
  async listReactions(id: number, params?: ListReactionsParams): Promise<ListReactionsResponse> {
    throw new Error("Reactions.listReactions is not implemented");
  }

  async listReactionsAll(id: number, params?: Omit<ListReactionsParams, 'cursor'>): Promise<Reaction[]> {
    throw new Error("Reactions.listReactionsAll is not implemented");
  }

  async addReaction(id: number, request: ReactionRequest): Promise<Reaction> {
    throw new Error("Reactions.addReaction is not implemented");
  }

  async removeReaction(id: number, params: RemoveReactionParams): Promise<void> {
    throw new Error("Reactions.removeReaction is not implemented");
  }
}

export class ReactionsServiceImpl extends ReactionsService {
  constructor(
    private baseUrl: string,
    private headers: Record<string, string>,
  ) {
    super();
  }

  override async listReactions(id: number, params?: ListReactionsParams): Promise<ListReactionsResponse> {
    const query = new URLSearchParams();
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.cursor !== undefined) query.set("cursor", params.cursor);
    const url = `${this.baseUrl}/messages/${id}/reactions${query.toString() ? `?${query}` : ""}`;
    const response = await fetchWithRetry(url, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body) as ListReactionsResponse;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async listReactionsAll(id: number, params?: Omit<ListReactionsParams, 'cursor'>): Promise<Reaction[]> {
    const items: Reaction[] = [];
    let cursor: string | undefined;
    do {
      const response = await this.listReactions(id, { ...params, cursor } as ListReactionsParams);
      items.push(...response.data);
      cursor = response.meta?.paginate?.nextPage;
    } while (cursor);
    return items;
  }

  override async addReaction(id: number, request: ReactionRequest): Promise<Reaction> {
    const response = await fetchWithRetry(`${this.baseUrl}/messages/${id}/reactions`, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(serialize(request)),
    });
    const body = await response.json();
    switch (response.status) {
      case 201:
        return deserialize(body) as Reaction;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async removeReaction(id: number, params: RemoveReactionParams): Promise<void> {
    const query = new URLSearchParams();
    query.set("code", params.code);
    if (params?.name !== undefined) query.set("name", params.name);
    const response = await fetchWithRetry(`${this.baseUrl}/messages/${id}/reactions?${query}`, {
      method: "DELETE",
      headers: this.headers,
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }
}

export class ReadMembersService {
  async listReadMembers(id: number, params?: ListReadMembersParams): Promise<unknown> {
    throw new Error("Read members.listReadMembers is not implemented");
  }
}

export class ReadMembersServiceImpl extends ReadMembersService {
  constructor(
    private baseUrl: string,
    private headers: Record<string, string>,
  ) {
    super();
  }

  override async listReadMembers(id: number, params?: ListReadMembersParams): Promise<unknown> {
    const query = new URLSearchParams();
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.cursor !== undefined) query.set("cursor", params.cursor);
    const url = `${this.baseUrl}/messages/${id}/read_member_ids${query.toString() ? `?${query}` : ""}`;
    const response = await fetchWithRetry(url, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body) as unknown;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }
}

export class ThreadsService {
  async getThread(id: number): Promise<Thread> {
    throw new Error("Threads.getThread is not implemented");
  }

  async createThread(id: number): Promise<Thread> {
    throw new Error("Threads.createThread is not implemented");
  }
}

export class ThreadsServiceImpl extends ThreadsService {
  constructor(
    private baseUrl: string,
    private headers: Record<string, string>,
  ) {
    super();
  }

  override async getThread(id: number): Promise<Thread> {
    const response = await fetchWithRetry(`${this.baseUrl}/threads/${id}`, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body.data) as Thread;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async createThread(id: number): Promise<Thread> {
    const response = await fetchWithRetry(`${this.baseUrl}/messages/${id}/thread`, {
      method: "POST",
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 201:
        return deserialize(body.data) as Thread;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }
}

export class ProfileService {
  async getTokenInfo(): Promise<AccessTokenInfo> {
    throw new Error("Profile.getTokenInfo is not implemented");
  }

  async getProfile(): Promise<User> {
    throw new Error("Profile.getProfile is not implemented");
  }

  async getStatus(): Promise<unknown> {
    throw new Error("Profile.getStatus is not implemented");
  }

  async updateStatus(request: StatusUpdateRequest): Promise<UserStatus> {
    throw new Error("Profile.updateStatus is not implemented");
  }

  async deleteStatus(): Promise<void> {
    throw new Error("Profile.deleteStatus is not implemented");
  }
}

export class ProfileServiceImpl extends ProfileService {
  constructor(
    private baseUrl: string,
    private headers: Record<string, string>,
  ) {
    super();
  }

  override async getTokenInfo(): Promise<AccessTokenInfo> {
    const response = await fetchWithRetry(`${this.baseUrl}/oauth/token/info`, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body.data) as AccessTokenInfo;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async getProfile(): Promise<User> {
    const response = await fetchWithRetry(`${this.baseUrl}/profile`, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body.data) as User;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async getStatus(): Promise<unknown> {
    const response = await fetchWithRetry(`${this.baseUrl}/profile/status`, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body) as unknown;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async updateStatus(request: StatusUpdateRequest): Promise<UserStatus> {
    const response = await fetchWithRetry(`${this.baseUrl}/profile/status`, {
      method: "PUT",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(serialize(request)),
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body.data) as UserStatus;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async deleteStatus(): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/profile/status`, {
      method: "DELETE",
      headers: this.headers,
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }
}

export class SearchService {
  async searchChats(params?: SearchChatsParams): Promise<ListChatsResponse> {
    throw new Error("Search.searchChats is not implemented");
  }

  async searchChatsAll(params?: Omit<SearchChatsParams, 'cursor'>): Promise<Chat[]> {
    throw new Error("Search.searchChatsAll is not implemented");
  }

  async searchMessages(params?: SearchMessagesParams): Promise<ListChatMessagesResponse> {
    throw new Error("Search.searchMessages is not implemented");
  }

  async searchMessagesAll(params?: Omit<SearchMessagesParams, 'cursor'>): Promise<Message[]> {
    throw new Error("Search.searchMessagesAll is not implemented");
  }

  async searchUsers(params?: SearchUsersParams): Promise<ListMembersResponse> {
    throw new Error("Search.searchUsers is not implemented");
  }

  async searchUsersAll(params?: Omit<SearchUsersParams, 'cursor'>): Promise<User[]> {
    throw new Error("Search.searchUsersAll is not implemented");
  }
}

export class SearchServiceImpl extends SearchService {
  constructor(
    private baseUrl: string,
    private headers: Record<string, string>,
  ) {
    super();
  }

  override async searchChats(params?: SearchChatsParams): Promise<ListChatsResponse> {
    const query = new URLSearchParams();
    if (params?.query !== undefined) query.set("query", params.query);
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.cursor !== undefined) query.set("cursor", params.cursor);
    if (params?.order !== undefined) query.set("order", params.order);
    if (params?.createdFrom !== undefined) query.set("created_from", params.createdFrom);
    if (params?.createdTo !== undefined) query.set("created_to", params.createdTo);
    if (params?.active !== undefined) query.set("active", String(params.active));
    if (params?.chatSubtype !== undefined) query.set("chat_subtype", params.chatSubtype);
    if (params?.personal !== undefined) query.set("personal", String(params.personal));
    const url = `${this.baseUrl}/search/chats${query.toString() ? `?${query}` : ""}`;
    const response = await fetchWithRetry(url, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body) as ListChatsResponse;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async searchChatsAll(params?: Omit<SearchChatsParams, 'cursor'>): Promise<Chat[]> {
    const items: Chat[] = [];
    let cursor: string | undefined;
    do {
      const response = await this.searchChats({ ...params, cursor } as SearchChatsParams);
      items.push(...response.data);
      cursor = response.meta?.paginate?.nextPage;
    } while (cursor);
    return items;
  }

  override async searchMessages(params?: SearchMessagesParams): Promise<ListChatMessagesResponse> {
    const query = new URLSearchParams();
    if (params?.query !== undefined) query.set("query", params.query);
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.cursor !== undefined) query.set("cursor", params.cursor);
    if (params?.order !== undefined) query.set("order", params.order);
    if (params?.createdFrom !== undefined) query.set("created_from", params.createdFrom);
    if (params?.createdTo !== undefined) query.set("created_to", params.createdTo);
    if (params?.chatIds !== undefined) query.set("chat_ids", String(params.chatIds));
    if (params?.userIds !== undefined) query.set("user_ids", String(params.userIds));
    if (params?.active !== undefined) query.set("active", String(params.active));
    const url = `${this.baseUrl}/search/messages${query.toString() ? `?${query}` : ""}`;
    const response = await fetchWithRetry(url, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body) as ListChatMessagesResponse;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async searchMessagesAll(params?: Omit<SearchMessagesParams, 'cursor'>): Promise<Message[]> {
    const items: Message[] = [];
    let cursor: string | undefined;
    do {
      const response = await this.searchMessages({ ...params, cursor } as SearchMessagesParams);
      items.push(...response.data);
      cursor = response.meta?.paginate?.nextPage;
    } while (cursor);
    return items;
  }

  override async searchUsers(params?: SearchUsersParams): Promise<ListMembersResponse> {
    const query = new URLSearchParams();
    if (params?.query !== undefined) query.set("query", params.query);
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.cursor !== undefined) query.set("cursor", params.cursor);
    if (params?.sort !== undefined) query.set("sort", params.sort);
    if (params?.order !== undefined) query.set("order", params.order);
    if (params?.createdFrom !== undefined) query.set("created_from", params.createdFrom);
    if (params?.createdTo !== undefined) query.set("created_to", params.createdTo);
    if (params?.companyRoles !== undefined) query.set("company_roles", String(params.companyRoles));
    const url = `${this.baseUrl}/search/users${query.toString() ? `?${query}` : ""}`;
    const response = await fetchWithRetry(url, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body) as ListMembersResponse;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async searchUsersAll(params?: Omit<SearchUsersParams, 'cursor'>): Promise<User[]> {
    const items: User[] = [];
    let cursor: string | undefined;
    do {
      const response = await this.searchUsers({ ...params, cursor } as SearchUsersParams);
      items.push(...response.data);
      cursor = response.meta?.paginate?.nextPage;
    } while (cursor);
    return items;
  }
}

export class TasksService {
  async listTasks(params?: ListTasksParams): Promise<ListTasksResponse> {
    throw new Error("Tasks.listTasks is not implemented");
  }

  async listTasksAll(params?: Omit<ListTasksParams, 'cursor'>): Promise<Task[]> {
    throw new Error("Tasks.listTasksAll is not implemented");
  }

  async getTask(id: number): Promise<Task> {
    throw new Error("Tasks.getTask is not implemented");
  }

  async createTask(request: TaskCreateRequest): Promise<Task> {
    throw new Error("Tasks.createTask is not implemented");
  }

  async updateTask(id: number, request: TaskUpdateRequest): Promise<Task> {
    throw new Error("Tasks.updateTask is not implemented");
  }

  async deleteTask(id: number): Promise<void> {
    throw new Error("Tasks.deleteTask is not implemented");
  }
}

export class TasksServiceImpl extends TasksService {
  constructor(
    private baseUrl: string,
    private headers: Record<string, string>,
  ) {
    super();
  }

  override async listTasks(params?: ListTasksParams): Promise<ListTasksResponse> {
    const query = new URLSearchParams();
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.cursor !== undefined) query.set("cursor", params.cursor);
    const url = `${this.baseUrl}/tasks${query.toString() ? `?${query}` : ""}`;
    const response = await fetchWithRetry(url, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body) as ListTasksResponse;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async listTasksAll(params?: Omit<ListTasksParams, 'cursor'>): Promise<Task[]> {
    const items: Task[] = [];
    let cursor: string | undefined;
    do {
      const response = await this.listTasks({ ...params, cursor } as ListTasksParams);
      items.push(...response.data);
      cursor = response.meta?.paginate?.nextPage;
    } while (cursor);
    return items;
  }

  override async getTask(id: number): Promise<Task> {
    const response = await fetchWithRetry(`${this.baseUrl}/tasks/${id}`, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body.data) as Task;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async createTask(request: TaskCreateRequest): Promise<Task> {
    const response = await fetchWithRetry(`${this.baseUrl}/tasks`, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(serialize(request)),
    });
    const body = await response.json();
    switch (response.status) {
      case 201:
        return deserialize(body.data) as Task;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async updateTask(id: number, request: TaskUpdateRequest): Promise<Task> {
    const response = await fetchWithRetry(`${this.baseUrl}/tasks/${id}`, {
      method: "PUT",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(serialize(request)),
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body.data) as Task;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async deleteTask(id: number): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/tasks/${id}`, {
      method: "DELETE",
      headers: this.headers,
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }
}

export class UsersService {
  async listUsers(params?: ListUsersParams): Promise<ListMembersResponse> {
    throw new Error("Users.listUsers is not implemented");
  }

  async listUsersAll(params?: Omit<ListUsersParams, 'cursor'>): Promise<User[]> {
    throw new Error("Users.listUsersAll is not implemented");
  }

  async getUser(id: number): Promise<User> {
    throw new Error("Users.getUser is not implemented");
  }

  async getUserStatus(userId: number): Promise<unknown> {
    throw new Error("Users.getUserStatus is not implemented");
  }

  async createUser(request: UserCreateRequest): Promise<User> {
    throw new Error("Users.createUser is not implemented");
  }

  async updateUser(id: number, request: UserUpdateRequest): Promise<User> {
    throw new Error("Users.updateUser is not implemented");
  }

  async updateUserStatus(userId: number, request: StatusUpdateRequest): Promise<UserStatus> {
    throw new Error("Users.updateUserStatus is not implemented");
  }

  async deleteUser(id: number): Promise<void> {
    throw new Error("Users.deleteUser is not implemented");
  }

  async deleteUserStatus(userId: number): Promise<void> {
    throw new Error("Users.deleteUserStatus is not implemented");
  }
}

export class UsersServiceImpl extends UsersService {
  constructor(
    private baseUrl: string,
    private headers: Record<string, string>,
  ) {
    super();
  }

  override async listUsers(params?: ListUsersParams): Promise<ListMembersResponse> {
    const query = new URLSearchParams();
    if (params?.query !== undefined) query.set("query", params.query);
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.cursor !== undefined) query.set("cursor", params.cursor);
    const url = `${this.baseUrl}/users${query.toString() ? `?${query}` : ""}`;
    const response = await fetchWithRetry(url, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body) as ListMembersResponse;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async listUsersAll(params?: Omit<ListUsersParams, 'cursor'>): Promise<User[]> {
    const items: User[] = [];
    let cursor: string | undefined;
    do {
      const response = await this.listUsers({ ...params, cursor } as ListUsersParams);
      items.push(...response.data);
      cursor = response.meta?.paginate?.nextPage;
    } while (cursor);
    return items;
  }

  override async getUser(id: number): Promise<User> {
    const response = await fetchWithRetry(`${this.baseUrl}/users/${id}`, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body.data) as User;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async getUserStatus(userId: number): Promise<unknown> {
    const response = await fetchWithRetry(`${this.baseUrl}/users/${userId}/status`, {
      headers: this.headers,
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body) as unknown;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async createUser(request: UserCreateRequest): Promise<User> {
    const response = await fetchWithRetry(`${this.baseUrl}/users`, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(serialize(request)),
    });
    const body = await response.json();
    switch (response.status) {
      case 201:
        return deserialize(body.data) as User;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async updateUser(id: number, request: UserUpdateRequest): Promise<User> {
    const response = await fetchWithRetry(`${this.baseUrl}/users/${id}`, {
      method: "PUT",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(serialize(request)),
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body.data) as User;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async updateUserStatus(userId: number, request: StatusUpdateRequest): Promise<UserStatus> {
    const response = await fetchWithRetry(`${this.baseUrl}/users/${userId}/status`, {
      method: "PUT",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(serialize(request)),
    });
    const body = await response.json();
    switch (response.status) {
      case 200:
        return deserialize(body.data) as UserStatus;
      case 401:
        throw new OAuthError(body.error);
      default:
        throw new ApiError(body.errors);
    }
  }

  override async deleteUser(id: number): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/users/${id}`, {
      method: "DELETE",
      headers: this.headers,
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }

  override async deleteUserStatus(userId: number): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/users/${userId}/status`, {
      method: "DELETE",
      headers: this.headers,
    });
    switch (response.status) {
      case 204:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }
}

export class ViewsService {
  async openView(request: OpenViewRequest): Promise<void> {
    throw new Error("Views.openView is not implemented");
  }
}

export class ViewsServiceImpl extends ViewsService {
  constructor(
    private baseUrl: string,
    private headers: Record<string, string>,
  ) {
    super();
  }

  override async openView(request: OpenViewRequest): Promise<void> {
    const response = await fetchWithRetry(`${this.baseUrl}/views/open`, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(serialize(request)),
    });
    switch (response.status) {
      case 201:
        return;
      case 401:
        throw new OAuthError(((await response.json()) as any).error);
      default:
        throw new ApiError(((await response.json()) as any).errors);
    }
  }
}

export interface PachcaClientOptions {
  token: string;
  baseUrl?: string;
  bots?: BotsService;
  chats?: ChatsService;
  common?: CommonService;
  groupTags?: GroupTagsService;
  linkPreviews?: LinkPreviewsService;
  members?: MembersService;
  messages?: MessagesService;
  profile?: ProfileService;
  reactions?: ReactionsService;
  readMembers?: ReadMembersService;
  search?: SearchService;
  security?: SecurityService;
  tasks?: TasksService;
  threads?: ThreadsService;
  users?: UsersService;
  views?: ViewsService;
}

export class PachcaClient {
  readonly bots: BotsService;
  readonly chats: ChatsService;
  readonly common: CommonService;
  readonly groupTags: GroupTagsService;
  readonly linkPreviews: LinkPreviewsService;
  readonly members: MembersService;
  readonly messages: MessagesService;
  readonly profile: ProfileService;
  readonly reactions: ReactionsService;
  readonly readMembers: ReadMembersService;
  readonly search: SearchService;
  readonly security: SecurityService;
  readonly tasks: TasksService;
  readonly threads: ThreadsService;
  readonly users: UsersService;
  readonly views: ViewsService;

  constructor(options: PachcaClientOptions) {
    const { token } = options;
    const baseUrl = options.baseUrl ?? "https://api.pachca.com/api/shared/v1";
    const headers = { Authorization: `Bearer ${token}` };
    this.bots = options.bots ?? new BotsServiceImpl(baseUrl, headers);
    this.chats = options.chats ?? new ChatsServiceImpl(baseUrl, headers);
    this.common = options.common ?? new CommonServiceImpl(baseUrl, headers);
    this.groupTags = options.groupTags ?? new GroupTagsServiceImpl(baseUrl, headers);
    this.linkPreviews = options.linkPreviews ?? new LinkPreviewsServiceImpl(baseUrl, headers);
    this.members = options.members ?? new MembersServiceImpl(baseUrl, headers);
    this.messages = options.messages ?? new MessagesServiceImpl(baseUrl, headers);
    this.profile = options.profile ?? new ProfileServiceImpl(baseUrl, headers);
    this.reactions = options.reactions ?? new ReactionsServiceImpl(baseUrl, headers);
    this.readMembers = options.readMembers ?? new ReadMembersServiceImpl(baseUrl, headers);
    this.search = options.search ?? new SearchServiceImpl(baseUrl, headers);
    this.security = options.security ?? new SecurityServiceImpl(baseUrl, headers);
    this.tasks = options.tasks ?? new TasksServiceImpl(baseUrl, headers);
    this.threads = options.threads ?? new ThreadsServiceImpl(baseUrl, headers);
    this.users = options.users ?? new UsersServiceImpl(baseUrl, headers);
    this.views = options.views ?? new ViewsServiceImpl(baseUrl, headers);
  }

  static stub(options: Partial<PachcaClientOptions> = {}): PachcaClient {
    return new PachcaClient({ token: options.token ?? "", baseUrl: options.baseUrl ?? "https://api.pachca.com/api/shared/v1",
      bots: options.bots ?? new BotsService(),
      chats: options.chats ?? new ChatsService(),
      common: options.common ?? new CommonService(),
      groupTags: options.groupTags ?? new GroupTagsService(),
      linkPreviews: options.linkPreviews ?? new LinkPreviewsService(),
      members: options.members ?? new MembersService(),
      messages: options.messages ?? new MessagesService(),
      profile: options.profile ?? new ProfileService(),
      reactions: options.reactions ?? new ReactionsService(),
      readMembers: options.readMembers ?? new ReadMembersService(),
      search: options.search ?? new SearchService(),
      security: options.security ?? new SecurityService(),
      tasks: options.tasks ?? new TasksService(),
      threads: options.threads ?? new ThreadsService(),
      users: options.users ?? new UsersService(),
      views: options.views ?? new ViewsService(),
    });
  }
}
