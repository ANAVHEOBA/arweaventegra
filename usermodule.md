a@a:~/arweaventegra$ curl -X POST http://localhost:5000/api/users/connect-wallet \
-H "Content-Type: application/json" \
-d '{"walletAddress": "0x123456789abcdef0123456789abcdef012345678"}'
{"message":"Wallet connected successfully","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiMHgxMjM0NTY3ODlhYmNkZWYwMTIzNDU2Nzg5YWJjZGVmMDEyMzQ1Njc4IiwiaWF0IjoxNzUyNjQ4OTM1LCJleHAiOjE3NTI2NDg5NTl9.E2P7ga62HyIwc5QnA6xg6g2O31GOxAaNqJHUHYtd9fg","user":{"walletAddress":"0x123456789abcdef0123456789abcdef012345678","createdAt":"2025-07-16T06:55:35.631Z","lastLogin":"2025-07-16T06:55:35.632Z"}}a@a:~/arweaventegra$ 








a@a:~/arweaventegra$ curl -X POST http://localhost:5000/api/users/disconnect-wallet \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiMHgxMjM0NTY3ODlhYmNkZWYwMTIzNDU2Nzg5YWJjZGVmMDEyMzQ1Njc4IiwiaWF0IjoxNzUyNjQ5MjAzLCJleHAiOjE3NTI3MzU2MDN9.g1Qp_lwDUOG-eN__XgtOQSxUg4q3lH4vVHVfj_ec0xg"
{"message":"Wallet disconnected successfully"}a@a:~/arweaventegra$ 






curl -X POST http://localhost:5000/api/arweave/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoiMHgxMjM0NTY3ODlhYmNkZWYwMTIzNDU2Nzg5YWJjZGVmMDEyMzQ1Njc4IiwiaWF0IjoxNzUyNjUxNTM1LCJleHAiOjE3NTI3Mzc5MzV9.ZqtPGYgVlLc8SdFJCTTWu32npxHIvS2sZfBDqdhHXVk" \
  -F "file=@test.txt" \
  -v