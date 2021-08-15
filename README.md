# whatsapp-api-venom-simple
api web whatsapp simple implementation venom-bot

1. git clone https://github.com/diazzaid/whatsapp-api-venom-simple.git
2. cd whatsapp-api-venom-simple
3. npm i
4. node index.js
5. scan qr
6. api send message
7. json
8. curl --location --request POST 'http://localhost:3000/send-message' \
--header 'Content-Type: application/json' \
--data-raw '{
  "number": "6281224993382",
  "message": "api testing json"
}'
9. urldecoded
10. curl --location --request POST 'http://localhost:3000/send-message' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'number=6281224993381' \
--data-urlencode 'message=api testing urldecoded'

thanks

orkestral/venom https://github.com/orkestral/venom
