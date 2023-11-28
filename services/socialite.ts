import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";

class SocialiteError extends Error {
  constructor(message?: string) {
    super(message);

    this.name = "SocialiteError";
  }
}

abstract class SocialiteDriver {
  public clientId: string;
  public name: string;
  public scopes: string[];
  public scopeSeparator: string = ",";
  public url: string;

  constructor(
    clientId: string,
    name: string,
    url: string,
    scopes: string[] = [],
  ) {
    this.clientId = clientId;
    this.name = name;
    this.scopes = scopes;
    this.url = url;
  }

  getScopes() {
    return this.scopes.join(this.scopeSeparator);
  }
}

export class LineDriver extends SocialiteDriver {
  public scopeSeparator: string = " ";

  constructor(clientId: string) {
    super(clientId, "line", "https://access.line.me/oauth2/v2.1/authorize", [
      "profile",
      "openid",
    ]);
  }
}

export class FacebookDriver extends SocialiteDriver {
  constructor(clientId: string) {
    super(clientId, "facebook", "https://www.facebook.com/v3.3/dialog/oauth", [
      "email",
    ]);
  }
}

class Socialite {
  public baseUrl: string;
  public redirectPath: string;
  protected drivers: Map<string, SocialiteDriver> = new Map();

  constructor(url: string, redirectPath?: string) {
    this.baseUrl = url;
    this.redirectPath = redirectPath ?? "api/connect/{provider}";
  }

  addDriver(driver: SocialiteDriver) {
    this.drivers.set(driver.name, driver);
  }

  getDriver(name: string) {
    const driver = this.drivers.get(name);

    if (!driver) {
      throw new SocialiteError(`Driver [${name}] not found`);
    }

    return driver;
  }

  connect(name: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const driver = this.getDriver(name);

      const redirectPath = this.redirectPath.replaceAll(
        "{provider}",
        driver.name,
      );
      const state = Crypto.randomUUID();

      // console.log(`[Socialite][${name}] REQ`, { redirectPath, state });

      const subscription = Linking.addEventListener("url", ({ url }) => {
        const { path, queryParams } = Linking.parse(url);

        // console.log(`[Socialite][${name}] RES`, { path, queryParams });

        if (path === redirectPath) {
          subscription.remove();

          if (
            typeof queryParams?.code === "string" &&
            queryParams.state === state
          ) {
            resolve(queryParams.code);
          } else {
            reject(new SocialiteError("Authentication failed"));
          }
        }
      });

      Linking.openURL(this.getAuthUrl(driver, redirectPath, state));
    });
  }

  protected getAuthUrl(
    driver: SocialiteDriver,
    redirectPath: string,
    state: string,
  ) {
    const redirectUri = `${this.baseUrl}/${redirectPath}`;

    const params = {
      client_id: driver.clientId,
      redirect_uri: redirectUri,
      scope: driver.getScopes(),
      response_type: "code",
      state,
    };

    const query = Object.entries(params)
      .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
      .join("&");

    return `${driver.url}?${query}`;
  }
}

export function createSocialite(baseUrl: string) {
  return new Socialite(baseUrl);
}
