
/*var Oanda = require('node-oanda');

     var config = {
      token: 'ef341f419fd90a61daea143902dfbea8-57c5975686db1479da10cc247075a93a',
      type: 'practice',
      dateFormat: 'unix',
      version:"v1"
    };
        var apiV1 = new Oanda(config);
        var Oanda = require('node-oanda');

     var config1 = {
      token: 'ef341f419fd90a61daea143902dfbea8-57c5975686db1479da10cc247075a93a',
      type: 'practice',
      dateFormat: 'unix',
      version:"v20"
    };
        var apiV1 = new Oanda(config);
        var apiV2 = new Oanda(config1);
        var requestInstrumentHistory = apiV2.trades.modifyExistingTrade("101-004-8382586-001","75",{"takeProfit":{"price":"1.19900","timeInForce": "GTC",}});
        requestInstrumentHistory.success(function(dataInstrumentHistory) 
        {
           console.log(dataInstrumentHistory)
        });
        requestInstrumentHistory.error(function(err) {           
          console.log('ERROR[RATES LIST]: ', err);
        });
        requestInstrumentHistory.go();

        
        
        function timeConverter(UNIX_timestamp){
          var a = new Date(UNIX_timestamp * 1000);
          var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          var year = a.getFullYear();
          var month = a.getMonth()+1
          var date = a.getDate();
          var hour = a.getHours();
          var min = a.getMinutes();
          var sec = a.getSeconds();
          var time = date + '/' + month + '/' + year + ' ' + hour + ':' + min + ':' + sec ;
          return time;
        }
        console.log(timeConverter('1526072385.000000000'));*/

/*var OANDAAdapter = require('oanda-adapter-v20');
var client = new OANDAAdapter({
    // 'live', 'practice' or 'sandbox'
    environment: 'practice',
    // Generate your API access in the 'Manage API Access' section of 'My Account' on OANDA's website
    accessToken: 'ef341f419fd90a61daea143902dfbea8-57c5975686db1479da10cc247075a93a',    
});
client.replaceTrade("101-004-8382586-001","75",{"takeProfit":{"price":"1.19900","timeInForce": "GTC",}},function(data){
console.log(data)
});*/

var email 	= require("emailjs");
var server 	= email.server.connect({
   user:    "rockscripts@gmail.com", 
   password:"Rock!123", 
   host:    "smtp.gmail.com", 
   ssl:     true
});

// send the message and get a callback with an error or details of the message that was sent
server.send({
   text:    "i hope this works", 
   from:    "you <rockscripts@gmail.com>", 
   to:      "someone <wsalexws@gmail.com>",
   subject: "testing emailjs"
}, function(err, message) { console.log(err || message); });