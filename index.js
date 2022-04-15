const express = require('express');
const venom = require('venom-bot');
const fileUpload = require('express-fileupload');
const app = express();
const { phoneNumberFormatter } = require('./helpers/formatter');

app.use(express.json()); //parser used for requests via post,
app.use(express.urlencoded({ extended : true }));
app.use(fileUpload({
  debug: false
}));

app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

venom.create(
  'chat1', 
    
    (base64Qrimg, asciiQR, attempts) => {
      console.log('Number of attempts to read the qrcode: ', attempts);
      //console.log('Terminal qrcode: ', asciiQR);
      //console.log('base64 image string qrcode: ', base64Qrimg);
    },
     (statusSession, session) => {
      console.log('Status Session: ', statusSession); 
      console.log('Session name: ', session);
    },
    {
      headless: false, // Headless chrome
	multidevice: true, // for version not multidevice use false.(default: true)
        folderNameToken: 'tokens', 
	mkdirFolderToken: '',
        devtools: false, // Open devtools by default
	
        useChrome: true, // If false will use Chromium instance
        debug: false, // Opens a debug session
        logQR: true, // Logs QR automatically in terminal
        //browserWS: 'ws://localhost:3030', // If u want to use browserWSEndpoint
        browserArgs: [
                    '--no-sandbox',
					], 
    })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

function start(client){
const port = '8000'; 
var server = app.listen(port);
console.log('Server berjalan pada port %s', server.address().port);
//sendText
app.post('/send-message', function (req, res) {
console.log("Mengirim pesan ke "+req.body.number);	
        client
            .sendText(phoneNumberFormatter(req.body.number), req.body.message)
            .then((result) => {
         res.json({status: 'success', response: 'message sent successfully'});
            })
            .catch((erro) => {
                res.json({status: 'error', response: 'The number is not registered'});
            });
        })



//auto reply	
	  client.onMessage(async (msg) => {
    try {
      if (msg.body == '!ping') {
        // Send a new message to the same chat
        client.sendText(msg.from, 'pong');
	  } else if (msg.body == 'hai') {
        // Send a new message to the same chat
        client.sendText(msg.from, 'hallo');
      } else if (msg.body == '!ping reply') {
        // Send a new message as a reply to the current one
        client.reply(msg.from, 'pong', msg.id.toString());
      }
    } catch (e) {
      console.log(e);
    }
  });
  
  client.onStateChange((state) => {
    console.log('State changed: ', state);
    if ('CONFLICT'.includes(state)) client.useHere();
    if ('UNPAIRED'.includes(state)) console.log('logout');
  });
}
