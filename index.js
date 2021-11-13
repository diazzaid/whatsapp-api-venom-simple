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
      console.log('Terminal qrcode: ', asciiQR);
      console.log('base64 image string qrcode: ', base64Qrimg);
    },
     (statusSession, session) => {
      console.log('Status Session: ', statusSession); 
      console.log('Session name: ', session);
    },
    {
      headless: true, // Headless chrome
        devtools: false, // Open devtools by default
        useChrome: true, // If false will use Chromium instance
        debug: false, // Opens a debug session
        logQR: true, // Logs QR automatically in terminal
        //browserWS: 'ws://localhost:3030', // If u want to use browserWSEndpoint
        browserArgs: [
		'--log-level=3',
                    '--no-default-browser-check',
                    '--disable-site-isolation-trials',
                    '--no-experiments',
                    '--ignore-gpu-blacklist',
                    '--ignore-certificate-errors',
                    '--ignore-certificate-errors-spki-list',
                    '--disable-gpu',
                    '--disable-extensions',
                    '--disable-default-apps',
                    '--enable-features=NetworkService',
                    '--disable-setuid-sandbox',
                    '--no-sandbox',
                    // Extras
                    '--disable-webgl',
                    '--disable-threaded-animation',
                    '--disable-threaded-scrolling',
                    '--disable-in-process-stack-traces',
                    '--disable-histogram-customizer',
                    '--disable-gl-extensions',
                    '--disable-composited-antialiasing',
                    '--disable-canvas-aa',
                    '--disable-3d-apis',
                    '--disable-accelerated-2d-canvas',
                    '--disable-accelerated-jpeg-decoding',
                    '--disable-accelerated-mjpeg-decode',
                    '--disable-app-list-dismiss-on-blur',
                    '--disable-accelerated-video-decode',
				    '--single-process', // <- this one doesn't works in Windows
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
console.log("Requested sending VIA POST message");	
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
      } else if (msg.body == '!chats') {
        const chats = await client.getAllChats();
        client.sendText(msg.from, `The bot has ${chats.length} chats open.`);
      } else if (msg.body == '!info') {
        let info = await client.getHostDevice();
        let message = `_*Connection info*_\n\n`;
        message += `*User name:* ${info.pushname}\n`;
        message += `*Number:* ${info.wid.user}\n`;
        message += `*Battery:* ${info.battery}\n`;
        message += `*Plugged:* ${info.plugged}\n`;
        message += `*Device Manufacturer:* ${info.phone.device_manufacturer}\n`;
        message += `*WhatsApp version:* ${info.phone.wa_version}\n`;
        client.sendText(msg.from, message);
        
		//} else if (msg.body.startsWith('!sendto ')) {
        // Direct send a new message to specific id
        //let number = msg.body.split(' ')[1];
        //let messageIndex = msg.body.indexOf(number) + number.length;
        //let message = msg.body.slice(messageIndex, msg.body.length);
        //number = number.includes('@c.us') ? number : `${number}@c.us`;
        //client.sendText(number, message);
      
	  } else if (msg.body.startsWith('!pin ')) {
        let option = msg.body.split(' ')[1];
        if (option == 'true') {
          await client.pinChat(msg.from, true);
        } else {
          await client.pinChat(msg.from, false);
        }
      } else if (msg.body.startsWith('!typing ')) {
        const option = msg.body.split(' ')[1];
        if (option == 'true') {
          // Start typing...
          await client.startTyping(msg.from);
        } else {
          // Stop typing
          await client.stopTyping(msg.from);
        }
      } else if (msg.body.startsWith('!ChatState ')) {
        const option = msg.body.split(' ')[1];
        if (option == '1') {
          await client.setChatState(msg.from, '0');
        } else if (option == '2') {
          await client.setChatState(msg.from, '1');
        } else {
          await client.setChatState(msg.from, '2');
        }
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
