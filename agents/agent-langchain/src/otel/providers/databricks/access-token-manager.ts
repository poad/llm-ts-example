import { logger } from '../../../logging.js';
import dotenv from '@dotenvx/dotenvx';

dotenv.config({ path: ['.env', '.env.test'], override: true });

/**
 * OAuthアクセストークンのキャッシュを表現するインターフェース。
 */
interface TokenCache {
  /** OAuthアクセストークン文字列。 */
  accessToken: string;
  /** トークンの有効期限（ミリ秒単位のUnixタイムスタンプ）。 */
  expiresAt: number;
}

/**
 * OAuthアクセストークンのグローバルなメモリ内キャッシュ。
 * @internal
 */
let tokenCache: TokenCache | null = null;

/**
 * OAuth M2M認証用の設定。
 * @internal
 */
const config = {
  /** OAuthトークンエンドポイントのURL。 */
  endpoint: process.env.DATABRICKS_OAUTH_TOKEN_ENDPOINT,
  /** サービスプリンシパルのクライアントID（アプリケーションID）。 */
  clientId: process.env.DATABRICKS_OAUTH_CLIENT_ID,
  /** サービスプリンシパルのOAuthシークレット。 */
  clientSecret: process.env.DATABRICKS_OAUTH_CLIENT_SECRET,
};

/**
 * キャッシュされたトークンがまだ有効かどうかを確認します。
 * 有効期限の60秒前，提前，避免，使用中のトークン失効を防ぎます。
 * @returns キャッシュされたトークンが有効な場合はtrue、そうでない場合はfalse。
 * @internal
 */
function isTokenValid(): boolean {
  if (!tokenCache) {
    return false;
  }
  const bufferTime = 60 * 1000;
  return Date.now() < tokenCache.expiresAt - bufferTime;
}

/**
 * Databricksトークンエンドポイントから新しいOAuthアクセストークンを取得します。
 * クライアント資格情報グラントフローとBasic認証を使用します。
 * @returns アクセストークン文字列、または取得失敗場合はnull。
 * @internal
 */
async function fetchAccessToken(): Promise<string | null> {
  if (!config.endpoint || !config.clientId || !config.clientSecret) {
    logger.warn('OAuth設定が不完全です', {
      config: {
        ...config,
        clientSecret: config.clientSecret ? '***' : '<undefined>'
      }
    });
    return null;
  }

  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=all-apis',
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`アクセストークンの取得に失敗しました: ${response.status} ${errorText}`);
      // return null;
      throw new Error();
    }

    const data = await response.json() as { access_token: string; expires_in: number };
    const expiresAt = Date.now() + data.expires_in * 1000;

    tokenCache = {
      accessToken: data.access_token,
      expiresAt,
    };

    logger.info('アクセストークンを正常に取得しました');
    return data.access_token;
  } catch (error) {
    logger.error(`アクセストークンの取得中にエラーが発生しました: ${error}`);
    return null;
  }
}

/**
 * 有効なOAuthアクセストークンを取得します。
 * キャッシュされたトークンが利用可能で有効な場合はそれを使用し、
 * 期限切れまたは期限切れ間近の場合は自動的に新しいトークンを取得します。
 *
 * @returns アクセストークン文字列、または利用できない場合はnull。
 *
 * @example
 * ```typescript
 * const token = await getAccessToken();
 * if (token) {
 *   // APIリクエストにトークンを使用
 * }
 * ```
 */
async function getAccessToken(): Promise<string | null> {
  if (isTokenValid() && tokenCache) {
    return tokenCache.accessToken;
  }
  return fetchAccessToken();
}

export { getAccessToken };
