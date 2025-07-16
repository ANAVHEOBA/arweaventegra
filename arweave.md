// Base path: /api/arweave

POST /upload
- Upload single file to Arweave
- Generate metadata
- Calculate cost
- Return transaction ID

POST /upload/batch
- Upload multiple files
- Batch metadata creation
- Bulk cost calculation
- Return array of transaction IDs


GET /cost/estimate
- Calculate storage cost before upload
- Parameters: file size, type
- Return AR token amount and USD equivalent

GET /cost/network-stats
- Get current network fees
- Get AR/USD price
- Get network status


GET /metadata/:transactionId
- Get metadata for specific file
- Include file info, cost, timestamps

POST /metadata/:transactionId
- Update/Add metadata for existing file
- Add tags, descriptions, etc.

GET /metadata/list
- List all uploaded files with metadata
- Pagination support


GET /status/:transactionId
- Check upload status
- Get confirmation count
- Get permanent URL

GET /verify/:transactionId
- Verify file integrity
- Check file availability