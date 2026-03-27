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

abstract class CommonService {
    open suspend fun downloadExport(id: Int): String {
        throw NotImplementedError("Common.downloadExport is not implemented")
    }
}

class CommonServiceImpl internal constructor(
    private val baseUrl: String,
    private val client: HttpClient,
) : CommonService() {
    override suspend fun downloadExport(id: Int): String {
        val response = client.get("$baseUrl/exports/$id")
        return when (response.status.value) {
            302 -> response.headers[HttpHeaders.Location]
                ?: error("Missing Location header in redirect response")
            401 -> throw response.body<OAuthError>()
            else -> throw response.body<ApiError>()
        }
    }
}

data class PachcaServices(
    val common: CommonService? = null
)

class PachcaClient(token: String, baseUrl: String = "https://api.pachca.com/api/shared/v1", services: PachcaServices = PachcaServices()) : Closeable {
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

    val common: CommonService = services.common ?: CommonServiceImpl(baseUrl, client)

    override fun close() {
        client.close()
    }
}
