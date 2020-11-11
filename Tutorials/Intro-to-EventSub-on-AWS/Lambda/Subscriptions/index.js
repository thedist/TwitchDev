const got = require('got');

// Use the Client Credentials OAuth flow to obtain an App token
const getAppToken = async () => {
  const url = `https://id.twitch.tv/oauth2/token?client_id=${process.env.clientID}&client_secret=${process.env.clientSecret}&grant_type=client_credentials`;

  return await got.post(url, { responseType: 'json' })
    .then(res => res.body.access_token)
    .catch(err => {
      console.warn(err);
      return false;
    })
};

exports.handler = async (event) => {
  const token = await getAppToken();

  // If there was an error creating an App token end the process here.
  if (!token) return { statusCode: 500, body: 'Error obtaining App token' };


  // Request headers
  const options = {
    headers: {
      'Client-ID': process.env.clientID,
      Authorization: 'Bearer ' + token
    },
    responseType: 'json'
  };

  const subscribe = async () => {

    // This example topic will let you easily test if the notification handler is working and writing to DyanmoDB
    // Once subscribed you can test by following my channel https://twitch.tv/thedist which will trigger a notification
    const body = {
      type: 'channel.follow',
      version: '1',
      condition: {
        broadcaster_user_id: '32168215'
      },
      transport: {
        method: 'webhook',
        callback: process.env.callback,
        secret: process.env.eventSubSecret
      }
    };

    return await got.post('https://api.twitch.tv/helix/eventsub/subscriptions', { ...options, json: body })
      .then(res => {
        return { statusCode: 200 };
      })
      .catch(err => {
        return { statusCode: 500, body: err };
      });
  };

  const unsubscribe = async () => {
    // The EventSub subscription ID, which can be obtained by using the Status test, must be provided for use of this endpoint to be successful.
    return await got.delete('https://api.twitch.tv/helix/eventsub/subscriptions', { ...options, searchParams: { id: event.id }})
      .then(res => {
        return { statusCode: 200 };
      })
      .catch(err => {
        return { statusCode: 500, body: err };
      });
  };

  const status = async () => {
    return await got('https://api.twitch.tv/helix/eventsub/subscriptions', options)
      .then(res => {
        return { statusCode: 200, body: res.body };
      })
      .catch(err => {
        return { statusCode: 500, body: err };
      });
  };


  if (event.type === 'subscribe') {
    return subscribe();
  } else if (event.type === 'unsubscribe') {
    return unsubscribe();
  } else if (event.type === 'status') {
    return status();
  } else {
    return { statusCode: 400, body: 'Unknown type' };
  }
};
