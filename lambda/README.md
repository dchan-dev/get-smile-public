# Get Smile Vinyl Products Lambda Function

This Lambda function retrieves product information from a CSV file stored in an S3 bucket and generates an HTML product listing page.

## Features

- Retrieves product.csv from the get-smile-vinyl S3 bucket using AWS SDK v3
- Parses CSV data to extract product information:
  - Name (e.g., Smile Dance Extension)
  - Model Number (e.g., 20230715-001-123)
  - SKU (e.g., 7 inch, 10 inch, 12 inch)
  - Image (full image path, 1024x1024)
- Generates a responsive HTML page displaying all products

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Configure AWS credentials with appropriate S3 access permissions

3. Deploy to AWS Lambda:
   - Create a new Lambda function
   - Set the handler to "index.handler"
   - Upload the code as a ZIP file or use AWS SAM/CloudFormation

4. Configure an API Gateway trigger to access the function via HTTP

## Expected CSV Format

The product.csv file should have the following columns:
- Name
- Model Number (or Model)
- SKU
- Image

## Notes

- Make sure the S3 bucket 'get-smile-vinyl' has the proper permissions for the Lambda function to access it
- The region in the code may need to be updated to match your S3 bucket's region

----

# Add airdrop button

I've updated the Lambda function to include a "claim your airdrop" button under each product's SKU. Here are the changes I made:

1. Added a new CSS class for the button:
css
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


2. Added JavaScript to handle the button click:
javascript
<script>
  function claimAirdrop(serialNumber) {
    const currentUrl = window.location.href.split('?')[0];
    const purchaseUrl = `${currentUrl}/purchase?serial_number=${serialNumber}`;

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


3. Added the button to each product card:
html
<button class="airdrop-button" onclick="claimAirdrop('${product.SKU}')">claim your airdrop</button>


4. Modified the /purchase endpoint response to return a JSON response with the "Congratulations!" message:
javascript
return {
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ message: 'Congratulations!' })
};


Now when a user views the product list:
1. Each product will display a green "claim your airdrop" button under the SKU
2. When clicked, the button will call the API endpoint {current_url}/purchase?serial_number={serial_number}
3. After a successful API call, an alert box will appear with the message "Congratulations!"

The updated file has been saved to /mnt/c/Users/USER/workspace/get-smile/lambda/index.js.