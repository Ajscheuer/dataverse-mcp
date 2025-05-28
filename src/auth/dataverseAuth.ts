import { ConfidentialClientApplication, ClientCredentialRequest } from '@azure/msal-node';
import { config } from '../config/environment.js';
import { AccessToken } from '../types/dataverse.js';

export class DataverseAuth {
  private msalInstance: ConfidentialClientApplication;
  private cachedToken: AccessToken | null = null;
  private tokenExpiryTime: number = 0;

  constructor() {
    console.error('[Auth] Initializing Dataverse authentication...');
    
    this.msalInstance = new ConfidentialClientApplication({
      auth: {
        clientId: config.dataverse.clientId,
        clientSecret: config.dataverse.clientSecret,
        authority: `https://login.microsoftonline.com/${config.dataverse.tenantId}`,
      },
    });

    console.error('[Auth] MSAL client initialized successfully');
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    try {
      // Check if we have a valid cached token
      if (this.cachedToken && Date.now() < this.tokenExpiryTime) {
        console.error('[Auth] Using cached access token');
        return this.cachedToken.access_token;
      }

      console.error('[Auth] Requesting new access token...');

      // Prepare the client credential request
      const clientCredentialRequest: ClientCredentialRequest = {
        scopes: [`${config.dataverse.environmentUrl}/.default`],
      };

      // Get the token
      const response = await this.msalInstance.acquireTokenByClientCredential(clientCredentialRequest);
      
      if (!response) {
        throw new Error('Failed to acquire access token - no response received');
      }

      // Cache the token with a buffer time (5 minutes before actual expiry)
      this.cachedToken = {
        access_token: response.accessToken,
        token_type: 'Bearer',
        expires_in: response.expiresOn ? Math.floor((response.expiresOn.getTime() - Date.now()) / 1000) : 3600,
        expires_on: response.expiresOn ? Math.floor(response.expiresOn.getTime() / 1000) : Math.floor(Date.now() / 1000) + 3600,
      };

      // Set expiry time with 5-minute buffer
      this.tokenExpiryTime = (response.expiresOn?.getTime() || Date.now() + 3600000) - 300000;

      console.error('[Auth] Access token acquired successfully');
      console.error(`[Auth] Token expires at: ${new Date(this.tokenExpiryTime).toISOString()}`);

      return this.cachedToken.access_token;
    } catch (error) {
      console.error('[Auth] Failed to acquire access token:', error);
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear the cached token (useful for testing or forcing refresh)
   */
  clearTokenCache(): void {
    console.error('[Auth] Clearing token cache');
    this.cachedToken = null;
    this.tokenExpiryTime = 0;
  }

  /**
   * Get authorization header for API requests
   */
  async getAuthorizationHeader(): Promise<{ Authorization: string }> {
    const token = await this.getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }
} 