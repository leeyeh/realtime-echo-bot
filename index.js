'use strict';

var util = require('util');
var realtime = require('leancloud-realtime');
var debug = require('debug')('index');

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
        debug('Echo bot online.');
      });

      rt.on('join', function(data) {
        if (data.op !== 'joined') return;
        debug('inventied to conv ' + data.cid + ' by ' + data.initBy);
        rt.conv(data.cid, function(conv) {
          // debug(require('util').inspect(conv));
          conv.count(function(count) {
            debug('conversition member count: ' + count);
            if (count !== 2) return;
            conv.send('Hello, ' + data.initBy + '!', function(data) {
              // debug(require('util').inspect(data));
            });
          });
        });
      });

      rt.on('message', function(data) {
        // debug(util.inspect(data));
        if (data.fromPeerId === clientId) return;
        debug('message recieved: \"' + data.msg + '\", from ' + data.fromPeerId + ' in ' + data.cid);
        rt.conv(data.cid, function(conv) {
          conv.count(function(count) {
            debug('conversition member count: ' + count);
            if (count !== 2) return;
            conv.send(data.msg);
          });
        });
      });

    }
  });
});
