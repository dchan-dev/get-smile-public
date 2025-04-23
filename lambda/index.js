const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const csv = require('csv-parser');

// Initialize S3 client
const s3Client = new S3Client({ region: 'us-east-1' }); // Update with your region

// Initialize queue client (v3)
const sqsClient = new SQSClient();

/*
  set up redis client
  package: ioredis
  host: env variable: REDIS_ENDPOINT
  port: env variable: REDIS_PORT
 */
const Redis = require('ioredis');
const client = new Redis(process.env.REDIS_ENDPOINT, { port: process.env.REDIS_PORT });
client.on('connect', () => {
  console.log('Connected to Redis');
});
client.on('error', (err) => {
  console.error('Error connecting to Redis:', err);
});


exports.handler = async (event) => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));

    /*
      event.headers.referer is url: https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxx.lambda-url.us-east-1.on.aws/purchase?serial_number=20231003-005-001
      if url path is /purchase,
      1) declare body from url "event.headers.referer"
      2) store key `sold:${body.serial_number}`: body
      3) send body to queue, name: 'purchase-smile-vinyl'
     */
    if (event.rawPath === '/purchase') {
      const body = event.queryStringParameters;
      console.log(body);
      const messageId = `${body.serial_number}`;
      const out = await client.set(`sold:${messageId}`, '{}');
      console.log('Message stored in Redis:', messageId, body, out);

      // TODO: send vpn endpoint support queue service
      // await sqsClient.send(new SendMessageCommand( {
      //   QueueUrl: 'https://sqs.us-east-1.amazonaws.com/xxxxxxxxxxxxxxxx/purchase-smile-vinyl',
      //   MessageBody: JSON.stringify(body)
      // }));
      // console.log('Message send to queue:', params);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: 'ok!' })
      };
    }

    // Example of retrieving data from Redis
    // const keys = await client.keys('message:*');
    // const messages = [];
    //
    // for (const key of keys) {
    //   const value = await client.get(key);
    //   messages.push({ key, value });
    // }

    // Process SQS messages if they exist
    /*if (event.Records && event.Records.length > 0) {
      for (const record of event.Records) {
        if (record.eventSource === 'aws:sqs') {
          console.log('SQS message received:', record.body);
          // Process the SQS message here
        }
      }
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'ok' })
      };
    }*/

    // Index page

    // Parameters for S3 bucket and file
    const bucketName = 'get-smile-vinyl';
    const fileName = 'product.csv';

    // Get the CSV file from S3
    const products = await getProductsFromS3(bucketName, fileName);

    // Generate HTML response
    const htmlResponse = generateHtmlResponse(products);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html'
      },
      body: htmlResponse
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process request' })
    };
  }
};

/**
 * Retrieves and parses the product CSV file from S3
 * @param {string} bucket - S3 bucket name
 * @param {string} key - S3 object key (file path)
 * @returns {Promise<Array>} - Array of product objects
 */
async function getProductsFromS3(bucket, key) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  });

  const response = await s3Client.send(command);
  const products = [];

  return new Promise((resolve, reject) => {
    response.Body
      .pipe(csv())
      .on('data', (data) => products.push(data))
      .on('end', () => resolve(products))
      .on('error', (error) => reject(error));
  });
}

/**
 * Generates HTML for the product list page
 * @param {Array} products - Array of product objects
 * @returns {string} - HTML content
 */
function generateHtmlResponse(products) {
  let html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smile Vinyl Products</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f5f5f5;
      }
      h1 {
        color: #333;
        text-align: center;
      }
      .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }
      .product-card {
        background-color: white;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }
      .product-image {
        width: 100%;
        height: auto;
        border-radius: 4px;
      }
      .product-info {
        margin-top: 10px;
      }
      .product-name {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      .product-details {
        color: #666;
        font-size: 14px;
      }
      .airdrop-button {
        background-color: #4CAF50;
        border: none;
        color: white;
        padding: 10px 15px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 14px;
        margin-top: 10px;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.3s;
      }
      .airdrop-button:hover {
        background-color: #45a049;
      }
    </style>
    <script>
      function claimAirdrop(serialNumber) {
        const purchaseUrl = window.location.href.split('?')[0] + '/purchase?serial_number=' + serialNumber;
        
        fetch(purchaseUrl)
          .then(response => response.json())
          .then(data => {
            alert('Congratulations!');
            console.log('Purchase response:', data);
          })
          .catch(error => {
            console.error('Error claiming airdrop:', error);
            alert('Error claiming your airdrop. Please try again.');
          });
      }
    </script>
  </head>
  <body>
    <h1>Smile Vinyl Products</h1>
    <div class="product-grid">
  `;

  products.forEach(product => {
    html += `
      <div class="product-card">
        <img class="product-image" src="${product.Image}" alt="${product.Name}">
        <div class="product-info">
          <div class="product-name">${product.Name}</div>
          <div class="product-details">
            <p>Model: ${product.Model || product['Model Number']}</p>
            <p>SKU: ${product.SKU}</p>
            <button class="airdrop-button" onclick="claimAirdrop('${product['Model Number']}')">claim your airdrop</button>
          </div>
        </div>
      </div>
    `;
  });

  html += `
    </div>
  </body>
  </html>
  `;

  return html;
}
