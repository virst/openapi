package com.pachca.sdk

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.*
import io.ktor.client.plugins.auth.*
import io.ktor.client.plugins.auth.providers.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json
import java.io.Closeable

abstract class LinkPreviewsService {
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
            201 -> return
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }
}

data class PachcaServices(
    val linkPreviews: LinkPreviewsService? = null
)

class PachcaClient(token: String, baseUrl: String = "https://api.pachca.com/api/shared/v1", services: PachcaServices = PachcaServices()) : Closeable {
    private val client = HttpClient {
        expectSuccess = false
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

    val linkPreviews: LinkPreviewsService = services.linkPreviews ?: LinkPreviewsServiceImpl(baseUrl, client)

    override fun close() {
        client.close()
    }
}
