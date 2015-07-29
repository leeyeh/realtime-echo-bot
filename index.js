'use strict';

var util = require('util');
var realtime = require('leancloud-realtime');

realtime.config({
  WebSocket: require('ws')
});

var appId = process.env.APP_ID;
var clientId = process.env.ECHO_BOT_ID || 'LeanEchoBot';

// 首先检查 bot 是否已经在线
var rt0 = realtime({
  appId: appId,
  clientId: '__phantom_' + clientId
});
rt0.on('open', function() {
  rt0.ping(clientId, function(clients) {
    if (clients.length !== 0) {
      throw new Error('Bot[' + clientId + '] is already online. only one instance of the bot is allowed working at the same time.');
    } else {

      var rt = realtime({
        appId: appId,
        clientId: clientId
      }, function() {
        console.log('Echo bot online.');
      });

      rt.on('join', function(data) {
        if (data.op !== 'joined') return;
        console.log('inventied to conv ' + data.cid + ' by ' + data.initBy);
        rt.conv(data.cid, function(conv) {
          // console.log(require('util').inspect(conv));
          conv.count(function(count) {
            console.log('conversition member count: ' + count);
            if (count !== 2) return;
            conv.send('Hello, ' + data.initBy + '!', function(data) {
              // console.log(require('util').inspect(data));
            });
          });
        });
      });

      rt.on('message', function(data) {
        // console.log(util.inspect(data));
        if (data.fromPeerId === clientId) return;
        console.log('message recieved: \"' + data.msg + '\", from ' + data.fromPeerId + ' in ' + data.cid);
        rt.conv(data.cid, function(conv) {
          conv.count(function(count) {
            console.log('conversition member count: ' + count);
            if (count !== 2) return;
            conv.send(data.msg);
          });
        });
      });

    }
  });
});
