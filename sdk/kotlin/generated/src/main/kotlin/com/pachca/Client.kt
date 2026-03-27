package com.pachca.sdk

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.*
import io.ktor.client.plugins.auth.*
import io.ktor.client.plugins.auth.providers.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json
import java.io.Closeable

open class SecurityService {
    open suspend fun getAuditEvents(
        startTime: String? = null,
        endTime: String? = null,
        eventKey: AuditEventKey? = null,
        actorId: String? = null,
        actorType: String? = null,
        entityId: String? = null,
        entityType: String? = null,
        limit: Int? = null,
        cursor: String? = null,
    ): GetAuditEventsResponse {
        throw NotImplementedError("Security.getAuditEvents is not implemented")
    }

    open suspend fun getAuditEventsAll(
        startTime: String? = null,
        endTime: String? = null,
        eventKey: AuditEventKey? = null,
        actorId: String? = null,
        actorType: String? = null,
        entityId: String? = null,
        entityType: String? = null,
        limit: Int? = null,
    ): List<AuditEvent> {
        throw NotImplementedError("Security.getAuditEventsAll is not implemented")
    }
}

class SecurityServiceImpl internal constructor(
    private val baseUrl: String,
    private val client: HttpClient,
) : SecurityService() {
    override suspend fun getAuditEvents(
        startTime: String?,
        endTime: String?,
        eventKey: AuditEventKey?,
        actorId: String?,
        actorType: String?,
        entityId: String?,
        entityType: String?,
        limit: Int?,
        cursor: String?,
    ): GetAuditEventsResponse {
        val response = client.get("$baseUrl/audit_events") {
            startTime?.let { parameter("start_time", it) }
            endTime?.let { parameter("end_time", it) }
            eventKey?.let { parameter("event_key", it.value) }
            actorId?.let { parameter("actor_id", it) }
            actorType?.let { parameter("actor_type", it) }
            entityId?.let { parameter("entity_id", it) }
            entityType?.let { parameter("entity_type", it) }
            limit?.let { parameter("limit", it) }
            cursor?.let { parameter("cursor", it) }
        }
        return when (response.status.value) {
            200 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun getAuditEventsAll(
        startTime: String?,
        endTime: String?,
        eventKey: AuditEventKey?,
        actorId: String?,
        actorType: String?,
        entityId: String?,
        entityType: String?,
        limit: Int?,
    ): List<AuditEvent> {
        val items = mutableListOf<AuditEvent>()
        var cursor: String? = null
        do {
            val response = getAuditEvents(
                startTime = startTime,
                endTime = endTime,
                eventKey = eventKey,
                actorId = actorId,
                actorType = actorType,
                entityId = entityId,
                entityType = entityType,
                limit = limit,
                cursor = cursor,
            )
            items.addAll(response.data)
            cursor = response.meta?.paginate?.nextPage
        } while (cursor != null)
        return items
    }
}

open class BotsService {
    open suspend fun getWebhookEvents(limit: Int? = null, cursor: String? = null): GetWebhookEventsResponse {
        throw NotImplementedError("Bots.getWebhookEvents is not implemented")
    }

    open suspend fun getWebhookEventsAll(limit: Int? = null): List<WebhookEvent> {
        throw NotImplementedError("Bots.getWebhookEventsAll is not implemented")
    }

    open suspend fun updateBot(id: Int, request: BotUpdateRequest): BotResponse {
        throw NotImplementedError("Bots.updateBot is not implemented")
    }

    open suspend fun deleteWebhookEvent(id: String) {
        throw NotImplementedError("Bots.deleteWebhookEvent is not implemented")
    }
}

class BotsServiceImpl internal constructor(
    private val baseUrl: String,
    private val client: HttpClient,
) : BotsService() {
    override suspend fun getWebhookEvents(limit: Int?, cursor: String?): GetWebhookEventsResponse {
        val response = client.get("$baseUrl/webhooks/events") {
            limit?.let { parameter("limit", it) }
            cursor?.let { parameter("cursor", it) }
        }
        return when (response.status.value) {
            200 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun getWebhookEventsAll(limit: Int?): List<WebhookEvent> {
        val items = mutableListOf<WebhookEvent>()
        var cursor: String? = null
        do {
            val response = getWebhookEvents(limit = limit, cursor = cursor)
            items.addAll(response.data)
            cursor = response.meta?.paginate?.nextPage
        } while (cursor != null)
        return items
    }

    override suspend fun updateBot(id: Int, request: BotUpdateRequest): BotResponse {
        val response = client.put("$baseUrl/bots/$id") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        return when (response.status.value) {
            200 -> response.body<BotResponseDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun deleteWebhookEvent(id: String) {
        val response = client.delete("$baseUrl/webhooks/events/$id")
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }
}

open class ChatsService {
    open suspend fun listChats(
        sortId: SortOrder? = null,
        availability: ChatAvailability? = null,
        lastMessageAtAfter: String? = null,
        lastMessageAtBefore: String? = null,
        personal: Boolean? = null,
        limit: Int? = null,
        cursor: String? = null,
    ): ListChatsResponse {
        throw NotImplementedError("Chats.listChats is not implemented")
    }

    open suspend fun listChatsAll(
        sortId: SortOrder? = null,
        availability: ChatAvailability? = null,
        lastMessageAtAfter: String? = null,
        lastMessageAtBefore: String? = null,
        personal: Boolean? = null,
        limit: Int? = null,
    ): List<Chat> {
        throw NotImplementedError("Chats.listChatsAll is not implemented")
    }

    open suspend fun getChat(id: Int): Chat {
        throw NotImplementedError("Chats.getChat is not implemented")
    }

    open suspend fun createChat(request: ChatCreateRequest): Chat {
        throw NotImplementedError("Chats.createChat is not implemented")
    }

    open suspend fun updateChat(id: Int, request: ChatUpdateRequest): Chat {
        throw NotImplementedError("Chats.updateChat is not implemented")
    }

    open suspend fun archiveChat(id: Int) {
        throw NotImplementedError("Chats.archiveChat is not implemented")
    }

    open suspend fun unarchiveChat(id: Int) {
        throw NotImplementedError("Chats.unarchiveChat is not implemented")
    }
}

class ChatsServiceImpl internal constructor(
    private val baseUrl: String,
    private val client: HttpClient,
) : ChatsService() {
    override suspend fun listChats(
        sortId: SortOrder?,
        availability: ChatAvailability?,
        lastMessageAtAfter: String?,
        lastMessageAtBefore: String?,
        personal: Boolean?,
        limit: Int?,
        cursor: String?,
    ): ListChatsResponse {
        val response = client.get("$baseUrl/chats") {
            sortId?.let { parameter("sort[{field}]", it.value) }
            availability?.let { parameter("availability", it.value) }
            lastMessageAtAfter?.let { parameter("last_message_at_after", it) }
            lastMessageAtBefore?.let { parameter("last_message_at_before", it) }
            personal?.let { parameter("personal", it) }
            limit?.let { parameter("limit", it) }
            cursor?.let { parameter("cursor", it) }
        }
        return when (response.status.value) {
            200 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun listChatsAll(
        sortId: SortOrder?,
        availability: ChatAvailability?,
        lastMessageAtAfter: String?,
        lastMessageAtBefore: String?,
        personal: Boolean?,
        limit: Int?,
    ): List<Chat> {
        val items = mutableListOf<Chat>()
        var cursor: String? = null
        do {
            val response = listChats(
                sortId = sortId,
                availability = availability,
                lastMessageAtAfter = lastMessageAtAfter,
                lastMessageAtBefore = lastMessageAtBefore,
                personal = personal,
                limit = limit,
                cursor = cursor,
            )
            items.addAll(response.data)
            cursor = response.meta?.paginate?.nextPage
        } while (cursor != null)
        return items
    }

    override suspend fun getChat(id: Int): Chat {
        val response = client.get("$baseUrl/chats/$id")
        return when (response.status.value) {
            200 -> response.body<ChatDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun createChat(request: ChatCreateRequest): Chat {
        val response = client.post("$baseUrl/chats") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        return when (response.status.value) {
            201 -> response.body<ChatDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun updateChat(id: Int, request: ChatUpdateRequest): Chat {
        val response = client.put("$baseUrl/chats/$id") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        return when (response.status.value) {
            200 -> response.body<ChatDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun archiveChat(id: Int) {
        val response = client.put("$baseUrl/chats/$id/archive")
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun unarchiveChat(id: Int) {
        val response = client.put("$baseUrl/chats/$id/unarchive")
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }
}

open class CommonService {
    open suspend fun downloadExport(id: Int): String {
        throw NotImplementedError("Common.downloadExport is not implemented")
    }

    open suspend fun listProperties(entityType: SearchEntityType): ListPropertiesResponse {
        throw NotImplementedError("Common.listProperties is not implemented")
    }

    open suspend fun requestExport(request: ExportRequest) {
        throw NotImplementedError("Common.requestExport is not implemented")
    }

    open suspend fun uploadFile(directUrl: String, request: FileUploadRequest) {
        throw NotImplementedError("Common.uploadFile is not implemented")
    }

    open suspend fun getUploadParams(): UploadParams {
        throw NotImplementedError("Common.getUploadParams is not implemented")
    }
}

class CommonServiceImpl internal constructor(
    private val baseUrl: String,
    private val client: HttpClient,
) : CommonService() {
    override suspend fun downloadExport(id: Int): String {
        val response = client.get("$baseUrl/chats/exports/$id")
        return when (response.status.value) {
            302 -> response.headers[HttpHeaders.Location]
                ?: error("Missing Location header in redirect response")
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun listProperties(entityType: SearchEntityType): ListPropertiesResponse {
        val response = client.get("$baseUrl/custom_properties") {
            parameter("entity_type", entityType.value)
        }
        return when (response.status.value) {
            200 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun requestExport(request: ExportRequest) {
        val response = client.post("$baseUrl/chats/exports") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun uploadFile(directUrl: String, request: FileUploadRequest) {
        val response = client.submitFormWithBinaryData(
            directUrl,
            formData {
                append("Content-Disposition", request.contentDisposition)
                append("acl", request.acl)
                append("policy", request.policy)
                append("x-amz-credential", request.xAmzCredential)
                append("x-amz-algorithm", request.xAmzAlgorithm)
                append("x-amz-date", request.xAmzDate)
                append("x-amz-signature", request.xAmzSignature)
                append("key", request.key)
                append("file", request.file, Headers.build {
                    append(HttpHeaders.ContentDisposition, "filename=\"file\"")
                })
            },
        ) {
            headers.remove(HttpHeaders.Authorization)
        }
        when (response.status.value) {
            204 -> return
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun getUploadParams(): UploadParams {
        val response = client.post("$baseUrl/uploads")
        return when (response.status.value) {
            201 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }
}

open class MembersService {
    open suspend fun listMembers(
        id: Int,
        role: ChatMemberRoleFilter? = null,
        limit: Int? = null,
        cursor: String? = null,
    ): ListMembersResponse {
        throw NotImplementedError("Members.listMembers is not implemented")
    }

    open suspend fun listMembersAll(
        id: Int,
        role: ChatMemberRoleFilter? = null,
        limit: Int? = null,
    ): List<User> {
        throw NotImplementedError("Members.listMembersAll is not implemented")
    }

    open suspend fun addTags(id: Int, groupTagIds: List<Int>) {
        throw NotImplementedError("Members.addTags is not implemented")
    }

    open suspend fun addMembers(id: Int, request: AddMembersRequest) {
        throw NotImplementedError("Members.addMembers is not implemented")
    }

    open suspend fun updateMemberRole(
        id: Int,
        userId: Int,
        role: ChatMemberRole,
    ) {
        throw NotImplementedError("Members.updateMemberRole is not implemented")
    }

    open suspend fun removeTag(id: Int, tagId: Int) {
        throw NotImplementedError("Members.removeTag is not implemented")
    }

    open suspend fun leaveChat(id: Int) {
        throw NotImplementedError("Members.leaveChat is not implemented")
    }

    open suspend fun removeMember(id: Int, userId: Int) {
        throw NotImplementedError("Members.removeMember is not implemented")
    }
}

class MembersServiceImpl internal constructor(
    private val baseUrl: String,
    private val client: HttpClient,
) : MembersService() {
    override suspend fun listMembers(
        id: Int,
        role: ChatMemberRoleFilter?,
        limit: Int?,
        cursor: String?,
    ): ListMembersResponse {
        val response = client.get("$baseUrl/chats/$id/members") {
            role?.let { parameter("role", it.value) }
            limit?.let { parameter("limit", it) }
            cursor?.let { parameter("cursor", it) }
        }
        return when (response.status.value) {
            200 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun listMembersAll(
        id: Int,
        role: ChatMemberRoleFilter?,
        limit: Int?,
    ): List<User> {
        val items = mutableListOf<User>()
        var cursor: String? = null
        do {
            val response = listMembers(
                id = id,
                role = role,
                limit = limit,
                cursor = cursor,
            )
            items.addAll(response.data)
            cursor = response.meta?.paginate?.nextPage
        } while (cursor != null)
        return items
    }

    override suspend fun addTags(id: Int, groupTagIds: List<Int>) {
        val response = client.post("$baseUrl/chats/$id/group_tags") {
            contentType(ContentType.Application.Json)
            setBody(AddTagsRequest(groupTagIds = groupTagIds))
        }
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun addMembers(id: Int, request: AddMembersRequest) {
        val response = client.post("$baseUrl/chats/$id/members") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun updateMemberRole(
        id: Int,
        userId: Int,
        role: ChatMemberRole,
    ) {
        val response = client.put("$baseUrl/chats/$id/members/$userId") {
            contentType(ContentType.Application.Json)
            setBody(UpdateMemberRoleRequest(role = role))
        }
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun removeTag(id: Int, tagId: Int) {
        val response = client.delete("$baseUrl/chats/$id/group_tags/$tagId")
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun leaveChat(id: Int) {
        val response = client.delete("$baseUrl/chats/$id/leave")
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun removeMember(id: Int, userId: Int) {
        val response = client.delete("$baseUrl/chats/$id/members/$userId")
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }
}

open class GroupTagsService {
    open suspend fun listTags(
        names: TagNamesFilter? = null,
        limit: Int? = null,
        cursor: String? = null,
    ): ListTagsResponse {
        throw NotImplementedError("Group tags.listTags is not implemented")
    }

    open suspend fun listTagsAll(names: TagNamesFilter? = null, limit: Int? = null): List<GroupTag> {
        throw NotImplementedError("Group tags.listTagsAll is not implemented")
    }

    open suspend fun getTag(id: Int): GroupTag {
        throw NotImplementedError("Group tags.getTag is not implemented")
    }

    open suspend fun getTagUsers(
        id: Int,
        limit: Int? = null,
        cursor: String? = null,
    ): ListMembersResponse {
        throw NotImplementedError("Group tags.getTagUsers is not implemented")
    }

    open suspend fun getTagUsersAll(id: Int, limit: Int? = null): List<User> {
        throw NotImplementedError("Group tags.getTagUsersAll is not implemented")
    }

    open suspend fun createTag(request: GroupTagRequest): GroupTag {
        throw NotImplementedError("Group tags.createTag is not implemented")
    }

    open suspend fun updateTag(id: Int, request: GroupTagRequest): GroupTag {
        throw NotImplementedError("Group tags.updateTag is not implemented")
    }

    open suspend fun deleteTag(id: Int) {
        throw NotImplementedError("Group tags.deleteTag is not implemented")
    }
}

class GroupTagsServiceImpl internal constructor(
    private val baseUrl: String,
    private val client: HttpClient,
) : GroupTagsService() {
    override suspend fun listTags(
        names: TagNamesFilter?,
        limit: Int?,
        cursor: String?,
    ): ListTagsResponse {
        val response = client.get("$baseUrl/group_tags") {
            names?.let { parameter("names", it) }
            limit?.let { parameter("limit", it) }
            cursor?.let { parameter("cursor", it) }
        }
        return when (response.status.value) {
            200 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun listTagsAll(names: TagNamesFilter?, limit: Int?): List<GroupTag> {
        val items = mutableListOf<GroupTag>()
        var cursor: String? = null
        do {
            val response = listTags(names = names, limit = limit, cursor = cursor)
            items.addAll(response.data)
            cursor = response.meta?.paginate?.nextPage
        } while (cursor != null)
        return items
    }

    override suspend fun getTag(id: Int): GroupTag {
        val response = client.get("$baseUrl/group_tags/$id")
        return when (response.status.value) {
            200 -> response.body<GroupTagDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun getTagUsers(
        id: Int,
        limit: Int?,
        cursor: String?,
    ): ListMembersResponse {
        val response = client.get("$baseUrl/group_tags/$id/users") {
            limit?.let { parameter("limit", it) }
            cursor?.let { parameter("cursor", it) }
        }
        return when (response.status.value) {
            200 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun getTagUsersAll(id: Int, limit: Int?): List<User> {
        val items = mutableListOf<User>()
        var cursor: String? = null
        do {
            val response = getTagUsers(id = id, limit = limit, cursor = cursor)
            items.addAll(response.data)
            cursor = response.meta?.paginate?.nextPage
        } while (cursor != null)
        return items
    }

    override suspend fun createTag(request: GroupTagRequest): GroupTag {
        val response = client.post("$baseUrl/group_tags") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        return when (response.status.value) {
            201 -> response.body<GroupTagDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun updateTag(id: Int, request: GroupTagRequest): GroupTag {
        val response = client.put("$baseUrl/group_tags/$id") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        return when (response.status.value) {
            200 -> response.body<GroupTagDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun deleteTag(id: Int) {
        val response = client.delete("$baseUrl/group_tags/$id")
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }
}

open class MessagesService {
    open suspend fun listChatMessages(
        chatId: Int,
        sortId: SortOrder? = null,
        limit: Int? = null,
        cursor: String? = null,
    ): ListChatMessagesResponse {
        throw NotImplementedError("Messages.listChatMessages is not implemented")
    }

    open suspend fun listChatMessagesAll(
        chatId: Int,
        sortId: SortOrder? = null,
        limit: Int? = null,
    ): List<Message> {
        throw NotImplementedError("Messages.listChatMessagesAll is not implemented")
    }

    open suspend fun getMessage(id: Int): Message {
        throw NotImplementedError("Messages.getMessage is not implemented")
    }

    open suspend fun createMessage(request: MessageCreateRequest): Message {
        throw NotImplementedError("Messages.createMessage is not implemented")
    }

    open suspend fun pinMessage(id: Int) {
        throw NotImplementedError("Messages.pinMessage is not implemented")
    }

    open suspend fun updateMessage(id: Int, request: MessageUpdateRequest): Message {
        throw NotImplementedError("Messages.updateMessage is not implemented")
    }

    open suspend fun deleteMessage(id: Int) {
        throw NotImplementedError("Messages.deleteMessage is not implemented")
    }

    open suspend fun unpinMessage(id: Int) {
        throw NotImplementedError("Messages.unpinMessage is not implemented")
    }
}

class MessagesServiceImpl internal constructor(
    private val baseUrl: String,
    private val client: HttpClient,
) : MessagesService() {
    override suspend fun listChatMessages(
        chatId: Int,
        sortId: SortOrder?,
        limit: Int?,
        cursor: String?,
    ): ListChatMessagesResponse {
        val response = client.get("$baseUrl/messages") {
            parameter("chat_id", chatId)
            sortId?.let { parameter("sort[{field}]", it.value) }
            limit?.let { parameter("limit", it) }
            cursor?.let { parameter("cursor", it) }
        }
        return when (response.status.value) {
            200 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun listChatMessagesAll(
        chatId: Int,
        sortId: SortOrder?,
        limit: Int?,
    ): List<Message> {
        val items = mutableListOf<Message>()
        var cursor: String? = null
        do {
            val response = listChatMessages(
                chatId = chatId,
                sortId = sortId,
                limit = limit,
                cursor = cursor,
            )
            items.addAll(response.data)
            cursor = response.meta?.paginate?.nextPage
        } while (cursor != null)
        return items
    }

    override suspend fun getMessage(id: Int): Message {
        val response = client.get("$baseUrl/messages/$id")
        return when (response.status.value) {
            200 -> response.body<MessageDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun createMessage(request: MessageCreateRequest): Message {
        val response = client.post("$baseUrl/messages") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        return when (response.status.value) {
            201 -> response.body<MessageDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun pinMessage(id: Int) {
        val response = client.post("$baseUrl/messages/$id/pin")
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun updateMessage(id: Int, request: MessageUpdateRequest): Message {
        val response = client.put("$baseUrl/messages/$id") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        return when (response.status.value) {
            200 -> response.body<MessageDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun deleteMessage(id: Int) {
        val response = client.delete("$baseUrl/messages/$id")
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun unpinMessage(id: Int) {
        val response = client.delete("$baseUrl/messages/$id/pin")
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }
}

open class LinkPreviewsService {
    open suspend fun createLinkPreviews(id: Int, request: LinkPreviewsRequest) {
        throw NotImplementedError("Link Previews.createLinkPreviews is not implemented")
    }
}

class LinkPreviewsServiceImpl internal constructor(
    private val baseUrl: String,
    private val client: HttpClient,
) : LinkPreviewsService() {
    override suspend fun createLinkPreviews(id: Int, request: LinkPreviewsRequest) {
        val response = client.post("$baseUrl/messages/$id/link_previews") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }
}

open class ReactionsService {
    open suspend fun listReactions(
        id: Int,
        limit: Int? = null,
        cursor: String? = null,
    ): ListReactionsResponse {
        throw NotImplementedError("Reactions.listReactions is not implemented")
    }

    open suspend fun listReactionsAll(id: Int, limit: Int? = null): List<Reaction> {
        throw NotImplementedError("Reactions.listReactionsAll is not implemented")
    }

    open suspend fun addReaction(id: Int, request: ReactionRequest): Reaction {
        throw NotImplementedError("Reactions.addReaction is not implemented")
    }

    open suspend fun removeReaction(
        id: Int,
        code: String,
        name: String? = null,
    ) {
        throw NotImplementedError("Reactions.removeReaction is not implemented")
    }
}

class ReactionsServiceImpl internal constructor(
    private val baseUrl: String,
    private val client: HttpClient,
) : ReactionsService() {
    override suspend fun listReactions(
        id: Int,
        limit: Int?,
        cursor: String?,
    ): ListReactionsResponse {
        val response = client.get("$baseUrl/messages/$id/reactions") {
            limit?.let { parameter("limit", it) }
            cursor?.let { parameter("cursor", it) }
        }
        return when (response.status.value) {
            200 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun listReactionsAll(id: Int, limit: Int?): List<Reaction> {
        val items = mutableListOf<Reaction>()
        var cursor: String? = null
        do {
            val response = listReactions(id = id, limit = limit, cursor = cursor)
            items.addAll(response.data)
            cursor = response.meta?.paginate?.nextPage
        } while (cursor != null)
        return items
    }

    override suspend fun addReaction(id: Int, request: ReactionRequest): Reaction {
        val response = client.post("$baseUrl/messages/$id/reactions") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        return when (response.status.value) {
            201 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun removeReaction(
        id: Int,
        code: String,
        name: String?,
    ) {
        val response = client.delete("$baseUrl/messages/$id/reactions") {
            parameter("code", code)
            name?.let { parameter("name", it) }
        }
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }
}

open class ReadMembersService {
    open suspend fun listReadMembers(
        id: Int,
        limit: Int? = null,
        cursor: String? = null,
    ): Any {
        throw NotImplementedError("Read members.listReadMembers is not implemented")
    }
}

class ReadMembersServiceImpl internal constructor(
    private val baseUrl: String,
    private val client: HttpClient,
) : ReadMembersService() {
    override suspend fun listReadMembers(
        id: Int,
        limit: Int?,
        cursor: String?,
    ): Any {
        val response = client.get("$baseUrl/messages/$id/read_member_ids") {
            limit?.let { parameter("limit", it) }
            cursor?.let { parameter("cursor", it) }
        }
        return when (response.status.value) {
            200 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }
}

open class ThreadsService {
    open suspend fun getThread(id: Int): Thread {
        throw NotImplementedError("Threads.getThread is not implemented")
    }

    open suspend fun createThread(id: Int): Thread {
        throw NotImplementedError("Threads.createThread is not implemented")
    }
}

class ThreadsServiceImpl internal constructor(
    private val baseUrl: String,
    private val client: HttpClient,
) : ThreadsService() {
    override suspend fun getThread(id: Int): Thread {
        val response = client.get("$baseUrl/threads/$id")
        return when (response.status.value) {
            200 -> response.body<ThreadDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun createThread(id: Int): Thread {
        val response = client.post("$baseUrl/messages/$id/thread")
        return when (response.status.value) {
            201 -> response.body<ThreadDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }
}

open class ProfileService {
    open suspend fun getTokenInfo(): AccessTokenInfo {
        throw NotImplementedError("Profile.getTokenInfo is not implemented")
    }

    open suspend fun getProfile(): User {
        throw NotImplementedError("Profile.getProfile is not implemented")
    }

    open suspend fun getStatus(): Any {
        throw NotImplementedError("Profile.getStatus is not implemented")
    }

    open suspend fun updateStatus(request: StatusUpdateRequest): UserStatus {
        throw NotImplementedError("Profile.updateStatus is not implemented")
    }

    open suspend fun deleteStatus() {
        throw NotImplementedError("Profile.deleteStatus is not implemented")
    }
}

class ProfileServiceImpl internal constructor(
    private val baseUrl: String,
    private val client: HttpClient,
) : ProfileService() {
    override suspend fun getTokenInfo(): AccessTokenInfo {
        val response = client.get("$baseUrl/oauth/token/info")
        return when (response.status.value) {
            200 -> response.body<AccessTokenInfoDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun getProfile(): User {
        val response = client.get("$baseUrl/profile")
        return when (response.status.value) {
            200 -> response.body<UserDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun getStatus(): Any {
        val response = client.get("$baseUrl/profile/status")
        return when (response.status.value) {
            200 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun updateStatus(request: StatusUpdateRequest): UserStatus {
        val response = client.put("$baseUrl/profile/status") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        return when (response.status.value) {
            200 -> response.body<UserStatusDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun deleteStatus() {
        val response = client.delete("$baseUrl/profile/status")
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }
}

open class SearchService {
    open suspend fun searchChats(
        query: String? = null,
        limit: Int? = null,
        cursor: String? = null,
        order: SortOrder? = null,
        createdFrom: String? = null,
        createdTo: String? = null,
        active: Boolean? = null,
        chatSubtype: ChatSubtype? = null,
        personal: Boolean? = null,
    ): ListChatsResponse {
        throw NotImplementedError("Search.searchChats is not implemented")
    }

    open suspend fun searchChatsAll(
        query: String? = null,
        limit: Int? = null,
        order: SortOrder? = null,
        createdFrom: String? = null,
        createdTo: String? = null,
        active: Boolean? = null,
        chatSubtype: ChatSubtype? = null,
        personal: Boolean? = null,
    ): List<Chat> {
        throw NotImplementedError("Search.searchChatsAll is not implemented")
    }

    open suspend fun searchMessages(
        query: String? = null,
        limit: Int? = null,
        cursor: String? = null,
        order: SortOrder? = null,
        createdFrom: String? = null,
        createdTo: String? = null,
        chatIds: List<Int>? = null,
        userIds: List<Int>? = null,
        active: Boolean? = null,
    ): ListChatMessagesResponse {
        throw NotImplementedError("Search.searchMessages is not implemented")
    }

    open suspend fun searchMessagesAll(
        query: String? = null,
        limit: Int? = null,
        order: SortOrder? = null,
        createdFrom: String? = null,
        createdTo: String? = null,
        chatIds: List<Int>? = null,
        userIds: List<Int>? = null,
        active: Boolean? = null,
    ): List<Message> {
        throw NotImplementedError("Search.searchMessagesAll is not implemented")
    }

    open suspend fun searchUsers(
        query: String? = null,
        limit: Int? = null,
        cursor: String? = null,
        sort: SearchSortOrder? = null,
        order: SortOrder? = null,
        createdFrom: String? = null,
        createdTo: String? = null,
        companyRoles: List<UserRole>? = null,
    ): ListMembersResponse {
        throw NotImplementedError("Search.searchUsers is not implemented")
    }

    open suspend fun searchUsersAll(
        query: String? = null,
        limit: Int? = null,
        sort: SearchSortOrder? = null,
        order: SortOrder? = null,
        createdFrom: String? = null,
        createdTo: String? = null,
        companyRoles: List<UserRole>? = null,
    ): List<User> {
        throw NotImplementedError("Search.searchUsersAll is not implemented")
    }
}

class SearchServiceImpl internal constructor(
    private val baseUrl: String,
    private val client: HttpClient,
) : SearchService() {
    override suspend fun searchChats(
        query: String?,
        limit: Int?,
        cursor: String?,
        order: SortOrder?,
        createdFrom: String?,
        createdTo: String?,
        active: Boolean?,
        chatSubtype: ChatSubtype?,
        personal: Boolean?,
    ): ListChatsResponse {
        val response = client.get("$baseUrl/search/chats") {
            query?.let { parameter("query", it) }
            limit?.let { parameter("limit", it) }
            cursor?.let { parameter("cursor", it) }
            order?.let { parameter("order", it.value) }
            createdFrom?.let { parameter("created_from", it) }
            createdTo?.let { parameter("created_to", it) }
            active?.let { parameter("active", it) }
            chatSubtype?.let { parameter("chat_subtype", it.value) }
            personal?.let { parameter("personal", it) }
        }
        return when (response.status.value) {
            200 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun searchChatsAll(
        query: String?,
        limit: Int?,
        order: SortOrder?,
        createdFrom: String?,
        createdTo: String?,
        active: Boolean?,
        chatSubtype: ChatSubtype?,
        personal: Boolean?,
    ): List<Chat> {
        val items = mutableListOf<Chat>()
        var cursor: String? = null
        do {
            val response = searchChats(
                query = query,
                limit = limit,
                cursor = cursor,
                order = order,
                createdFrom = createdFrom,
                createdTo = createdTo,
                active = active,
                chatSubtype = chatSubtype,
                personal = personal,
            )
            items.addAll(response.data)
            cursor = response.meta?.paginate?.nextPage
        } while (cursor != null)
        return items
    }

    override suspend fun searchMessages(
        query: String?,
        limit: Int?,
        cursor: String?,
        order: SortOrder?,
        createdFrom: String?,
        createdTo: String?,
        chatIds: List<Int>?,
        userIds: List<Int>?,
        active: Boolean?,
    ): ListChatMessagesResponse {
        val response = client.get("$baseUrl/search/messages") {
            query?.let { parameter("query", it) }
            limit?.let { parameter("limit", it) }
            cursor?.let { parameter("cursor", it) }
            order?.let { parameter("order", it.value) }
            createdFrom?.let { parameter("created_from", it) }
            createdTo?.let { parameter("created_to", it) }
            chatIds?.let { parameter("chat_ids", it) }
            userIds?.let { parameter("user_ids", it) }
            active?.let { parameter("active", it) }
        }
        return when (response.status.value) {
            200 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun searchMessagesAll(
        query: String?,
        limit: Int?,
        order: SortOrder?,
        createdFrom: String?,
        createdTo: String?,
        chatIds: List<Int>?,
        userIds: List<Int>?,
        active: Boolean?,
    ): List<Message> {
        val items = mutableListOf<Message>()
        var cursor: String? = null
        do {
            val response = searchMessages(
                query = query,
                limit = limit,
                cursor = cursor,
                order = order,
                createdFrom = createdFrom,
                createdTo = createdTo,
                chatIds = chatIds,
                userIds = userIds,
                active = active,
            )
            items.addAll(response.data)
            cursor = response.meta?.paginate?.nextPage
        } while (cursor != null)
        return items
    }

    override suspend fun searchUsers(
        query: String?,
        limit: Int?,
        cursor: String?,
        sort: SearchSortOrder?,
        order: SortOrder?,
        createdFrom: String?,
        createdTo: String?,
        companyRoles: List<UserRole>?,
    ): ListMembersResponse {
        val response = client.get("$baseUrl/search/users") {
            query?.let { parameter("query", it) }
            limit?.let { parameter("limit", it) }
            cursor?.let { parameter("cursor", it) }
            sort?.let { parameter("sort", it.value) }
            order?.let { parameter("order", it.value) }
            createdFrom?.let { parameter("created_from", it) }
            createdTo?.let { parameter("created_to", it) }
            companyRoles?.let { parameter("company_roles", it) }
        }
        return when (response.status.value) {
            200 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun searchUsersAll(
        query: String?,
        limit: Int?,
        sort: SearchSortOrder?,
        order: SortOrder?,
        createdFrom: String?,
        createdTo: String?,
        companyRoles: List<UserRole>?,
    ): List<User> {
        val items = mutableListOf<User>()
        var cursor: String? = null
        do {
            val response = searchUsers(
                query = query,
                limit = limit,
                cursor = cursor,
                sort = sort,
                order = order,
                createdFrom = createdFrom,
                createdTo = createdTo,
                companyRoles = companyRoles,
            )
            items.addAll(response.data)
            cursor = response.meta?.paginate?.nextPage
        } while (cursor != null)
        return items
    }
}

open class TasksService {
    open suspend fun listTasks(limit: Int? = null, cursor: String? = null): ListTasksResponse {
        throw NotImplementedError("Tasks.listTasks is not implemented")
    }

    open suspend fun listTasksAll(limit: Int? = null): List<Task> {
        throw NotImplementedError("Tasks.listTasksAll is not implemented")
    }

    open suspend fun getTask(id: Int): Task {
        throw NotImplementedError("Tasks.getTask is not implemented")
    }

    open suspend fun createTask(request: TaskCreateRequest): Task {
        throw NotImplementedError("Tasks.createTask is not implemented")
    }

    open suspend fun updateTask(id: Int, request: TaskUpdateRequest): Task {
        throw NotImplementedError("Tasks.updateTask is not implemented")
    }

    open suspend fun deleteTask(id: Int) {
        throw NotImplementedError("Tasks.deleteTask is not implemented")
    }
}

class TasksServiceImpl internal constructor(
    private val baseUrl: String,
    private val client: HttpClient,
) : TasksService() {
    override suspend fun listTasks(limit: Int?, cursor: String?): ListTasksResponse {
        val response = client.get("$baseUrl/tasks") {
            limit?.let { parameter("limit", it) }
            cursor?.let { parameter("cursor", it) }
        }
        return when (response.status.value) {
            200 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun listTasksAll(limit: Int?): List<Task> {
        val items = mutableListOf<Task>()
        var cursor: String? = null
        do {
            val response = listTasks(limit = limit, cursor = cursor)
            items.addAll(response.data)
            cursor = response.meta?.paginate?.nextPage
        } while (cursor != null)
        return items
    }

    override suspend fun getTask(id: Int): Task {
        val response = client.get("$baseUrl/tasks/$id")
        return when (response.status.value) {
            200 -> response.body<TaskDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun createTask(request: TaskCreateRequest): Task {
        val response = client.post("$baseUrl/tasks") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        return when (response.status.value) {
            201 -> response.body<TaskDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun updateTask(id: Int, request: TaskUpdateRequest): Task {
        val response = client.put("$baseUrl/tasks/$id") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        return when (response.status.value) {
            200 -> response.body<TaskDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun deleteTask(id: Int) {
        val response = client.delete("$baseUrl/tasks/$id")
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }
}

open class UsersService {
    open suspend fun listUsers(
        query: String? = null,
        limit: Int? = null,
        cursor: String? = null,
    ): ListMembersResponse {
        throw NotImplementedError("Users.listUsers is not implemented")
    }

    open suspend fun listUsersAll(query: String? = null, limit: Int? = null): List<User> {
        throw NotImplementedError("Users.listUsersAll is not implemented")
    }

    open suspend fun getUser(id: Int): User {
        throw NotImplementedError("Users.getUser is not implemented")
    }

    open suspend fun getUserStatus(userId: Int): Any {
        throw NotImplementedError("Users.getUserStatus is not implemented")
    }

    open suspend fun createUser(request: UserCreateRequest): User {
        throw NotImplementedError("Users.createUser is not implemented")
    }

    open suspend fun updateUser(id: Int, request: UserUpdateRequest): User {
        throw NotImplementedError("Users.updateUser is not implemented")
    }

    open suspend fun updateUserStatus(userId: Int, request: StatusUpdateRequest): UserStatus {
        throw NotImplementedError("Users.updateUserStatus is not implemented")
    }

    open suspend fun deleteUser(id: Int) {
        throw NotImplementedError("Users.deleteUser is not implemented")
    }

    open suspend fun deleteUserStatus(userId: Int) {
        throw NotImplementedError("Users.deleteUserStatus is not implemented")
    }
}

class UsersServiceImpl internal constructor(
    private val baseUrl: String,
    private val client: HttpClient,
) : UsersService() {
    override suspend fun listUsers(
        query: String?,
        limit: Int?,
        cursor: String?,
    ): ListMembersResponse {
        val response = client.get("$baseUrl/users") {
            query?.let { parameter("query", it) }
            limit?.let { parameter("limit", it) }
            cursor?.let { parameter("cursor", it) }
        }
        return when (response.status.value) {
            200 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun listUsersAll(query: String?, limit: Int?): List<User> {
        val items = mutableListOf<User>()
        var cursor: String? = null
        do {
            val response = listUsers(query = query, limit = limit, cursor = cursor)
            items.addAll(response.data)
            cursor = response.meta?.paginate?.nextPage
        } while (cursor != null)
        return items
    }

    override suspend fun getUser(id: Int): User {
        val response = client.get("$baseUrl/users/$id")
        return when (response.status.value) {
            200 -> response.body<UserDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun getUserStatus(userId: Int): Any {
        val response = client.get("$baseUrl/users/$userId/status")
        return when (response.status.value) {
            200 -> response.body()
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun createUser(request: UserCreateRequest): User {
        val response = client.post("$baseUrl/users") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        return when (response.status.value) {
            201 -> response.body<UserDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun updateUser(id: Int, request: UserUpdateRequest): User {
        val response = client.put("$baseUrl/users/$id") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        return when (response.status.value) {
            200 -> response.body<UserDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun updateUserStatus(userId: Int, request: StatusUpdateRequest): UserStatus {
        val response = client.put("$baseUrl/users/$userId/status") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        return when (response.status.value) {
            200 -> response.body<UserStatusDataWrapper>().data
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun deleteUser(id: Int) {
        val response = client.delete("$baseUrl/users/$id")
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }

    override suspend fun deleteUserStatus(userId: Int) {
        val response = client.delete("$baseUrl/users/$userId/status")
        when (response.status.value) {
            204 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }
}

open class ViewsService {
    open suspend fun openView(request: OpenViewRequest) {
        throw NotImplementedError("Views.openView is not implemented")
    }
}

class ViewsServiceImpl internal constructor(
    private val baseUrl: String,
    private val client: HttpClient,
) : ViewsService() {
    override suspend fun openView(request: OpenViewRequest) {
        val response = client.post("$baseUrl/views/open") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }
        when (response.status.value) {
            201 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }
}

class PachcaClient(
    token: String,
    baseUrl: String = "https://api.pachca.com/api/shared/v1",
    bots: BotsService? = null,
    chats: ChatsService? = null,
    common: CommonService? = null,
    groupTags: GroupTagsService? = null,
    linkPreviews: LinkPreviewsService? = null,
    members: MembersService? = null,
    messages: MessagesService? = null,
    profile: ProfileService? = null,
    reactions: ReactionsService? = null,
    readMembers: ReadMembersService? = null,
    search: SearchService? = null,
    security: SecurityService? = null,
    tasks: TasksService? = null,
    threads: ThreadsService? = null,
    users: UsersService? = null,
    views: ViewsService? = null
) : Closeable {
    private val client = HttpClient {
        expectSuccess = false
        followRedirects = false
        install(ContentNegotiation) {
            json(Json { explicitNulls = false })
        }
        install(HttpRequestRetry) {
            retryOnServerErrors(maxRetries = 3)
            retryIf { _, response -> response.status.value == 429 }
            delayMillis { retry ->
                val retryAfter = response?.headers?.get("Retry-After")?.toLongOrNull()
                if (retryAfter != null) retryAfter * 1000L else retry * 1000L
            }
        }
        defaultRequest {
            bearerAuth(token)
        }
    }

    val bots: BotsService = bots ?: BotsServiceImpl(baseUrl, client)
    val chats: ChatsService = chats ?: ChatsServiceImpl(baseUrl, client)
    val common: CommonService = common ?: CommonServiceImpl(baseUrl, client)
    val groupTags: GroupTagsService = groupTags ?: GroupTagsServiceImpl(baseUrl, client)
    val linkPreviews: LinkPreviewsService = linkPreviews ?: LinkPreviewsServiceImpl(baseUrl, client)
    val members: MembersService = members ?: MembersServiceImpl(baseUrl, client)
    val messages: MessagesService = messages ?: MessagesServiceImpl(baseUrl, client)
    val profile: ProfileService = profile ?: ProfileServiceImpl(baseUrl, client)
    val reactions: ReactionsService = reactions ?: ReactionsServiceImpl(baseUrl, client)
    val readMembers: ReadMembersService = readMembers ?: ReadMembersServiceImpl(baseUrl, client)
    val search: SearchService = search ?: SearchServiceImpl(baseUrl, client)
    val security: SecurityService = security ?: SecurityServiceImpl(baseUrl, client)
    val tasks: TasksService = tasks ?: TasksServiceImpl(baseUrl, client)
    val threads: ThreadsService = threads ?: ThreadsServiceImpl(baseUrl, client)
    val users: UsersService = users ?: UsersServiceImpl(baseUrl, client)
    val views: ViewsService = views ?: ViewsServiceImpl(baseUrl, client)

    override fun close() {
        client.close()
    }
}
