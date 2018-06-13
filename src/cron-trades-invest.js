var mysql = require('mysql');
var DBPool = mysql.createPool(
{
  host: "localhost",
  user: "root",
  password: "",
  database: "oanda",
  port: "3306",
  acquireTimeout:90000,
  waitForConnections:true
});

var Noty = require('noty');

var config = {
  token: 'ef341f419fd90a61daea143902dfbea8-57c5975686db1479da10cc247075a93a',
  type: 'practice',
  dateFormat: 'unix',
  version:"v20"
};

/*added to replace trade or edit
  node oanda does not work
*/
var OANDAAdapter = require('oanda-adapter-v20');

var client = new OANDAAdapter({
    // 'live', 'practice' or 'sandbox'
    environment: 'practice',
    // Generate your API access in the 'Manage API Access' section of 'My Account' on OANDA's website
    accessToken: config.token,    
});
//>with account id
//get trades
var accountId = '101-004-8382586-002'; //Ana
getAccountGlobalConf(accountId,'BUY',function(accountGlobalConf){
  Object.keys(accountGlobalConf).forEach(function(key) 
      {
        var accountGlobalConfRow = accountGlobalConf[key]
        client.getPrice(accountGlobalConfRow.instrument, accountId, function(error, ratesprices)
      {
        //console.log(ratesprices)
        if(error==null)
        {
          var currentPrice = ratesprices.bids[0].price;          
        }
        console.log(currentPrice);
              // getGlobalConf("BUY",accountGlobalConfRow.instrument,function(globalConf)
             // {
                  /*IS TIME TO AUTO INVEST?*/
                  if(accountGlobalConfRow!=null)
                  {
                    if(parseFloat(currentPrice) > parseFloat(accountGlobalConfRow.minPrice) && parseFloat(currentPrice) < parseFloat(accountGlobalConfRow.maxPrice))                  
                    {
                      console.log('start create trade');
                      if(accountGlobalConfRow.enabled == 1)
                      {
                        if(accountGlobalConfRow.alreadyInvested == 0)
                        {   
                         console.log('create trade');                                            
                         createTrade(accountGlobalConfRow.instrument, accountGlobalConfRow.maxUnits, accountGlobalConfRow.id);
                        }
                      }
                    }  
                  }    
                             
             // });
      });
      });
  
});
    
  


function createTrade(instrument, units, confId)
{
  var accountID = accountId; 
 
    setGlobalConf(confId,{alreadyInvested:1},function(err, result)
    {
      if(result.affectedRows>0)
      {
        client.createOrder(accountID,{"order":{"units":units, "instrument": instrument, "timeInForce":"FOK", "type": "MARKET", "positionFill": "DEFAULT"}},function(result)
        {
          var nowDateTime = new Date();
          nowDateTime = formatDate(nowDateTime, "dddd h:mmtt d MMM yyyy"); 
          sendNotification("Trade Order Requested","Instrument: "+instrument +"\n"+"Units: "+units+"\n"+"Date: "+nowDateTime);     
        });
      }
    });     
}

function takeProfit(tradeId, currentPrice, confId)
{
  var accountId = accountId;
  console.log({"takeProfit":{"price":currentPrice,"timeInForce": "GTC",}})
  setGlobalConf(confId,{alreadyInvested:0},function(err, result)
  {
    if(result.affectedRows>0)
    {
      client.replaceTrade(accountId,tradeId,{"takeProfit":{"price":currentPrice,"timeInForce": "GTC",}},function(data)
      {
        var nowDateTime = new Date();
        nowDateTime = formatDate(nowDateTime, "dddd h:mmtt d MMM yyyy"); 
        sendNotification("Take Profit Requested","Trade ID: "+tradeId +"\n"+"Taked at: "+currentPrice+"\n"+"Date: "+nowDateTime);   
      });
    }
  });
}

function stopLoss(tradeId, currentPrice, confId)
{
  var accountID = accountId;
  setGlobalConf(confId,{alreadyInvested:0},function(err, result)
  {
    if(result.affectedRows>0)
    {
      client.replaceTrade(accountID,tradeId,{"stopLoss":{"price":currentPrice,"timeInForce": "GTC",}},function(data)
      {
        console.log('stop loss')
        var nowDateTime = new Date();
        nowDateTime = formatDate(nowDateTime, "dddd h:mmtt d MMM yyyy");
        sendNotification("Stop Loss Requested","Trade ID: "+tradeId +"\n"+"Stopped at: "+currentPrice+"\n"+"Date: "+nowDateTime);   
      });
    }  
  });
}

function getGlobalConf(type,instrument,callback)
{
  var accountID = accountId;   
  DBPool.getConnection(function(err, connection) 
  {
    connection.query("SELECT * FROM globalConfiguration WHERE accountId='"+accountID+"' AND type='"+type+"' AND instrument='"+instrument+"'", function (error, results, fields) 
      {        
        connection.release();
        if(error==null)
        {             
            return callback(results[0]);       
        }      
        else
        {          
          return callback(null);
        }     
      });
  });
}
function getAccountGlobalConf(accountId,type,callback)
{
  var accountID = accountId;   
  DBPool.getConnection(function(err, connection) 
  {
    connection.query("SELECT * FROM globalConfiguration WHERE accountId='"+accountID+"' AND type='"+type+"'", function (error, results, fields) 
      {        
        connection.release();
        if(error==null)
        {             
            return callback(results);       
        }      
        else
        {          
          return callback(null);
        }     
      });
  });
}
function getGlobalConfById(id,callback)
{
  var accountID = accountId;   
  DBPool.getConnection(function(err, connection) 
  {
    connection.query("SELECT * FROM globalConfiguration WHERE id='"+id+"'", function (error, results, fields) 
      {
        connection.release();
        if(error==null)
        {             
            return callback(results[0]);       
        }      
        else
        {          
          return callback(null);
        }     
      });
  });
}
function setGlobalConf(id,updateData, callback)
{    
  DBPool.getConnection(function(err, connection) 
  {
    connection.query('UPDATE globalConfiguration SET ? WHERE ?', [updateData, { id: id }], function (error, results) 
    {
      connection.release(); 
      return callback(error, results)
    })
  });
}
function setGlobalConfAccount(accountId,updateData, callback)
{    
  DBPool.getConnection(function(err, connection) 
  {
    connection.query('UPDATE globalConfiguration SET ? WHERE ?', [updateData, { accountId: accountId }], function (error, results) 
    {
      connection.release(); 
      return callback(error, results)
    })
  });
}
function displayNotification(type,msn)
{
  //alert, success, warning, error, info/information
  new Noty({
    text: msn,
    type: type,
    layout: 'topRight',
    theme: 'relax'
  }).show();
}

function sumeFloat(a,b)
{
  var decimalCount = countDecimals(a);
  decimalCount 
  decimalCount
  return (parseFloat(a) + parseFloat(b)).toFixed(5);
}
function restFloat(a,b)
{
  return (parseFloat(a) + parseFloat(b)).toFixed(5);
}
//@format 11/5/2018 15:59:45
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

function sendNotification(subject,message)
{
  var email 	= require("emailjs");
var server 	= email.server.connect({
   user:    "rockscripts@gmail.com", 
   password:"Rock!123", 
   host:    "smtp.gmail.com", 
   ssl:     true
});

// send the message and get a callback with an error or details of the message that was sent
server.send({
   text:    message, 
   from:    "you <rockscripts@gmail.com>", 
   to:      "someone <wsalexws@gmail.com>",
   subject: subject
}, function(err, message) { console.log(err || message); });
}

function formatDate(date, format, utc) {
  var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function ii(i, len) {
      var s = i + "";
      len = len || 2;
      while (s.length < len) s = "0" + s;
      return s;
  }

  var y = utc ? date.getUTCFullYear() : date.getFullYear();
  format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
  format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
  format = format.replace(/(^|[^\\])y/g, "$1" + y);

  var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
  format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
  format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
  format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
  format = format.replace(/(^|[^\\])M/g, "$1" + M);

  var d = utc ? date.getUTCDate() : date.getDate();
  format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
  format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
  format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
  format = format.replace(/(^|[^\\])d/g, "$1" + d);

  var H = utc ? date.getUTCHours() : date.getHours();
  format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
  format = format.replace(/(^|[^\\])H/g, "$1" + H);

  var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
  format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
  format = format.replace(/(^|[^\\])h/g, "$1" + h);

  var m = utc ? date.getUTCMinutes() : date.getMinutes();
  format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
  format = format.replace(/(^|[^\\])m/g, "$1" + m);

  var s = utc ? date.getUTCSeconds() : date.getSeconds();
  format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
  format = format.replace(/(^|[^\\])s/g, "$1" + s);

  var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
  format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
  f = Math.round(f / 10);
  format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
  f = Math.round(f / 10);
  format = format.replace(/(^|[^\\])f/g, "$1" + f);

  var T = H < 12 ? "AM" : "PM";
  format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
  format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

  var t = T.toLowerCase();
  format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
  format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

  var tz = -date.getTimezoneOffset();
  var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
  if (!utc) {
      tz = Math.abs(tz);
      var tzHrs = Math.floor(tz / 60);
      var tzMin = tz % 60;
      K += ii(tzHrs) + ":" + ii(tzMin);
  }
  format = format.replace(/(^|[^\\])K/g, "$1" + K);

  var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
  format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
  format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

  format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
  format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

  format = format.replace(/\\(.)/g, "$1");

  return format;
};

var countDecimals = function (value) { 
  if ((value % 1) != 0) 
      return value.toString().split(".")[1].length;  
  return 0;
};