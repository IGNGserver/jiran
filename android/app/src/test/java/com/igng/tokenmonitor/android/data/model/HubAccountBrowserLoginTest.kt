package com.igng.tokenmonitor.android.data.model

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The account wire contract for the browser-login-only lifecycle.
 *
 * `credentialConfigured` decides whether the editor shows "已填写" or asks the
 * user to sign in again; `credentialMetadata` no longer only carries the manual
 * shapes, and `accountId` on the exchange is what keeps re-authorization from
 * creating a second account.
 */
class HubAccountBrowserLoginTest {
  private val json = Json {
    ignoreUnknownKeys = true
    explicitNulls = false
  }

  @Test
  fun accountCredentialStateParsesForAnOauthAccount() {
    val body = """
      {
        "ok": true,
        "authority": "hub",
        "accounts": [
          {
            "id": "acct-1",
            "provider": "codex",
            "name": "codex-work",
            "enabled": true,
            "status": "ok",
            "credentialConfigured": true,
            "credentialMetadata": { "accountId": "chatgpt-account-1" }
          },
          {
            "id": "acct-2",
            "provider": "antigravity",
            "name": "agy-cleared",
            "enabled": true,
            "status": "notConfigured",
            "credentialConfigured": false
          }
        ]
      }
    """.trimIndent()
    val response = json.decodeFromString(AccountsResponseDto.serializer(), body)
    assertEquals(2, response.accounts.size)
    assertEquals(true, response.accounts[0].credentialConfigured)
    assertEquals("chatgpt-account-1", response.accounts[0].credentialMetadata?.get("accountId")?.toString()?.trim('"'))
    assertEquals(false, response.accounts[1].credentialConfigured)
    assertNull(response.accounts[1].credentialMetadata)
  }

  @Test
  fun accountCredentialStateIsUnknownWhenTheHubOmitsIt() {
    val body = """{ "ok": true, "accounts": [ { "id": "acct-3", "provider": "codex" } ] }"""
    val response = json.decodeFromString(AccountsResponseDto.serializer(), body)
    assertNull(response.accounts[0].credentialConfigured)
  }

  @Test
  fun exchangeCanTargetAnExistingAccount() {
    val body = json.encodeToString(
      OAuthExchangeRequestDto.serializer(),
      OAuthExchangeRequestDto(
        sessionId = "s1",
        redirectUrl = "http://localhost:1455/auth/callback?code=x",
        accountId = "acct-1"
      )
    )
    assertTrue(body.contains("\"accountId\":\"acct-1\""))

    val withoutTarget = json.encodeToString(
      OAuthExchangeRequestDto.serializer(),
      OAuthExchangeRequestDto(sessionId = "s1", redirectUrl = "code")
    )
    assertTrue(!withoutTarget.contains("accountId"))
  }

  @Test
  fun credentialMetadataRoundTripsAsJson() {
    val metadata: JsonObject = JsonObject(mapOf("accountId" to JsonPrimitive("a-1")))
    val account = HubAccountDto(credentialMetadata = metadata)
    assertEquals("a-1", account.credentialMetadata?.get("accountId")?.toString()?.trim('"'))
  }
}
