const axios = require('axios');
require('dotenv').config();
const createAuthRefreshInterceptor = require('axios-auth-refresh');

const Store = require('electron-store');
const store = new Store();

const TwitchClientId = process.env.TWITCH_CLIENT_ID

class TwitchApi {
  twitchAPIEndpoint = 'https://api.twitch.tv/helix'
  twitchAPIUserEndpoint = `${this.twitchAPIEndpoint}/users`
  twitchAPIStreamEndpoint = `${this.twitchAPIEndpoint}/streams`
  twitchAPIWebhookEndpoint = `${this.twitchAPIEndpoint}/eventsub/subscriptions`

  constructor(config) {
    const now = Date.now()
    const auth = store.get('appAuth')
    this.config = config
    this.headers = {
      'Client-ID': TwitchClientId,
      'Authorization': `Bearer ${auth.accessToken}`,
      'Content-Type': 'application/json',
    }
  }
  static refreshAuthLogic = failedRequest => axios.post('https://www.example.com/auth/token/refresh').then(tokenRefreshResponse => {
    // set auth in store
    // set header in class
    return Promise.resolve();
  });

  // Instantiate the interceptor
  // createAuthRefreshInterceptor(axios, refreshAuthLogic);
  async deleteHooks() {
    try {
      const response = await axios.get(
        this.twitchAPIWebhookEndpoint,
        {
          headers: this.headers
        });
      const subscriptions = response.data.data.map(s => s.id)
      const deletePromises = subscriptions.map(id => {
        return axios.delete(`${this.twitchAPIWebhookEndpoint}?id=${id}`, {
          headers: this.headers
        })
      })
      await Promise.all(deletePromises)
    }
    catch(err) {
      console.error(err)
    }
  }
  /**
   * Registers all webhooks with Twitch directed to this instance of the bot
   */
  async registerWebhooks() {
    this.webhookSecret = "chance_webhook_secret";

    console.log('registering webhooks')
    await this.deleteHooks()
    // await this.registerChannelUpdateWebhook();
    await this.registerFollowWebhook();
  }
  async registerFollowWebhook() {
    const ngrokURL = store.get('ngrokURL')
    try {
      const payload = {
        "type": "channel.follow",
        "version": "1",
        "condition": {
            "broadcaster_user_id": "216296469"
        },
        "transport": {
            "method": "webhook",
            "callback": `${ngrokURL}/webhooks/follow`,
            "secret": this.webhookSecret
        }
      };
      console.log(this.headers)
      const response = await axios.post(
        this.twitchAPIWebhookEndpoint,
        payload,
        {
          headers: this.headers
        });
      console.log(`TwitchAPI:registerFollowWebhook - Response = ${response.status}`);
    } catch (err) {
      if(err.response.status !== 409) {
        console.log(`TwitchAPI:registerFollowWebhook ${err}`);
      }
      else console.log('TwitchAPI:registerFollowWebhook - Webhook already exists')
    }
  }
  async banUser(login) {
    console.log('BANNING USER: ', login)
  }
  
}
module.exports = TwitchApi