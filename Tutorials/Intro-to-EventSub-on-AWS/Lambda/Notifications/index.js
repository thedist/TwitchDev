
const crypto = require('crypto');
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({ region: process.env.region });

const writeNotification = (id, body) => {
  // Table Entry consists of the notification ID, and the notification payload
  // Using the attribute_not_exists(id) prevents storing duplicate notifications
  const params = {
    TableName: process.env.tableName,
    Item: { id, ...body },
    ConditionExpression: 'attribute_not_exists(id)'
  };

  // In production proper error handling would be used, but a 2xx should still be sent or Twitch might retry sending the notification that'll just error again
  return documentClient.put(params).promise()
    .catch(err => {
      console.warn(err);
    });
};

exports.handler = async (event) => {
  const verifySignature = () => {
    // Generate a signature from the id, timestamp, and request body
    const message = event.headers['Twitch-Eventsub-Message-Id'] + event.headers['Twitch-Eventsub-Message-Timestamp'] + event.body;
    const signature = 'sha256=' + crypto.createHmac('sha256', process.env.eventSubSecret).update(message).digest('hex');

    // Compare generated signature against Twitch's provided signature
    return signature === event.headers['Twitch-Eventsub-Message-Signature'];
  };

  // If notification fails verification, return a 4xx
  if (!verifySignature()) return { statusCode: 403, body: 'Verification failed' };

  let body;

  try {
    body = JSON.parse(event.body);
  }
  catch (e) {
    console.warn(e);
    return { statusCode: 500, body: 'Error parsing request body' };
  }

  const type = event.headers['Twitch-Eventsub-Message-Type'];
  if (type === 'callback-verification') {
    // Verify the callback by responding with a 2XX status code and echoing the challenge sent in the request
    return { statusCode: 200, body: body.challenge };
  } else if (type === 'notification') {
    // write notification to DynamoDB table
    await writeNotification(event.headers['Twitch-Eventsub-Message-Id'], body);
    return { statusCode: 200 };
  } else if (type === 'revocation') {
    // In a production environment we may want to take action here should a token be revoked, for this tutorial we'll just log it
    console.log(body);
    return { statusCode: 200 };
  } else {
    return { statusCode: 400, body: 'Unknown message type' };
  }
};