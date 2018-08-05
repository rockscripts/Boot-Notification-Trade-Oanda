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
var tulind = require('tulind');

var config = {
  token: 'ef341f419fd90a61daea143902dfbea8-57c5975686db1479da10cc247075a93a',
  type: 'practice',
  dateFormat: 'unix',
  version:"v20"
};
var fs                = require('fs');
var csv               = require('fast-csv');
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

var accountId =
client.getAccounts(function(error, accounts)
{
if(error==null)
 {
  if(accounts.length>0)
  {
   var index = 0;
  Object.keys(accounts).forEach(function(key) 
  {
    var account = accounts[key];
    var accountId = account.id;

      getAccountGlobalConf(accountId,'BUY',function(accountGlobalConf){
        Object.keys(accountGlobalConf).forEach(function(key) 
            {
              var accountGlobalConfRow = accountGlobalConf[key];
              
              client.getPrice(accountGlobalConfRow.instrument, accountId, function(error, ratesprices)
            {
              var strategy = accountGlobalConfRow.strategy;
              //console.log(ratesprices)
              if(error==null)
              {
                var currentPrice = ratesprices.bids[0].price;          
              }
            
                    // getGlobalConf("BUY",accountGlobalConfRow.instrument,function(globalConf)
                  // {
                        /*IS TIME TO AUTO INVEST?*/
                        if(accountGlobalConfRow!=null)
                        { 
                          var macd = JSON.parse(accountGlobalConfRow.macd);
                          var nowTime = new Date();
                          var signalTime = new Date(macd.time+".000Z");                                  
                          var nextSignalTime = new Date(macd.time+".000Z");;
                          nextSignalTime.setHours(nextSignalTime.getHours() + 4); //BASED ON ONE HOUR CANDLE
                          nextSignalTime.toISOString();
                          var clientCSVPath = __dirname+"/indicators-csv/"+accountId; 

                          if(accountGlobalConfRow.enabled == 1)
                            {
                              if(accountGlobalConfRow.alreadyInvested == 0)
                                { 
                                  //CUSTOM STRATEGY RANGE
                                  if(strategy=="custom range")
                                  {
                                    if(parseFloat(currentPrice) > parseFloat(accountGlobalConfRow.minPrice) && parseFloat(currentPrice) < parseFloat(accountGlobalConfRow.maxPrice))                  
                                    {                                                       
                                      //buy                                            
                                      createTrade(accountGlobalConfRow.instrument, accountGlobalConfRow.maxUnits, accountGlobalConfRow.id);
                                    }
                                    if(parseFloat(currentPrice) > parseFloat(accountGlobalConfRow.sMinPrice) && parseFloat(currentPrice) < parseFloat(accountGlobalConfRow.sMaxPrice))                  
                                    {                        
                                      //sell                                            
                                      createTrade(accountGlobalConfRow.instrument, accountGlobalConfRow.maxUnits * (-1), accountGlobalConfRow.id);
                                    }
                                  }

                                  //MACD and RSI STRATEGY
                                  if(strategy=="macd")
                                  {                                                              
                                    var breakDebug = false;
                                    //if(nowTime.getTime()>=signalTime.getTime() && nowTime.getTime()<=nextSignalTime.getTime() && breakDebug==true)
                                    { 
                                      console.log("Starting MACD Strategy");
                                      console.log("**********************")

                                      if(macd.signalOrder=="Buy")
                                      {   
                                        console.log("Buying Signal..."); 
                                         
                                        //sendNotification("MACD Strategy - sell before cross below","All Thechnical indicators were passed. Trade disabled...");
                                        get_RSI_CMO_Stoch_indicators(accountGlobalConfRow.instrument,accountGlobalConfRow.candlesCount,accountGlobalConfRow.candlesGranularity, function(indicators)
                                        {                                    
                                          var rsi = indicators[0];
                                          rsi = rsi.rsi;
                                          var mco = indicators[1];
                                          var stock = indicators[2];
                                          stock = stock.stock;
                                          var rows = [];
                                          const streamBuy = fs.createReadStream(clientCSVPath+"/MACD-"+accountGlobalConfRow.instrument+".csv"); 
                                          csv .fromStream(streamBuy) 
                                              .on('data', function (data) 
                                              {
                                                rows.push(data)
                                              }) 
                                              .on('end', () => 
                                              { 
                                                //## Strategy SELL when signal is buy before MACD cross belos signal
                                              //BEGIN STRATEGY #1
                                              var startedMACDBuyPeriod = false;  
                                              var periodsBearing = 0;
                                              var signalMacdTime = macd.time;
                                              Object.keys(rows).forEach(function(key) 
                                              {
                                                var row = rows[key];
                                                if(key>1)
                                                {                                                  
                                                  var currentMacdTime = row[0];

                                                  if(currentMacdTime == signalMacdTime)
                                                  {
                                                    startedMACDBuyPeriod = true;
                                                  }
                                                  if(startedMACDBuyPeriod == true)
                                                  {
                                                    //Check bearing secuencies, if last macd value is less than penultimate pass filter 
                                                    var currentMACD = row[2];
                                                    var previousMACDRow = rows[key-1]; 
                                                    var previousMACD = previousMACDRow[2];
                                                    console.log("current  MACD: "+parseFloat(currentMACD))
                                                    console.log("previous MACD: "+parseFloat(previousMACD))
                                                    if(parseFloat(currentMACD) < parseFloat(previousMACD))
                                                    {
                                                      periodsBearing++;
                                                    }
                                                    console.log("Bearing Periods: "+periodsBearing);
                                                  }                                                  
                                                }                                        
                                              });
                                              
                                             if(periodsBearing>1)
                                              {                                                
                                                console.log("RSI: "+rsi);
                                                //if(rsi < 40)  //use RSI for over selling
                                                {                                                    
                                                  var stochsK = stock.K;
                                                  var stochsD = stock.D;
                                                  stochsK.reverse();
                                                  stochsD.reverse();
                                                  console.log("%K: "+stochsK[0]);  
                                                  console.log("%D: "+stochsD[0]); 
                                                  if(stochsK[0] < stochsD[0]) // K cross below D so, bearish
                                                  {
                                                    var difference = stochsD[0]  - stochsK[0]; 
                                                    console.log("%D - %K: "+difference); 
                                                    if(difference > 3) // angle opened - trends bearish
                                                    {
                                                      
                                                      //place trade / sell - short
                                                      console.log("Creating Sell/Short Order...")
                                                      if(accountGlobalConfRow.alreadyInvested == 0)
                                                      {
                                                        sendNotification("MACD Strategy - selling before cross below","All Thechnical indicators were passed. Trade enabled...");
                                                        createTrade(accountId,accountGlobalConfRow.instrument, accountGlobalConfRow.maxUnits * (-1), accountGlobalConfRow.id);
                                                      }
                                                      else
                                                      {
                                                        //
                                                      }
                                                      //createTrade(accountId,accountGlobalConfRow.instrument, accountGlobalConfRow.maxUnits * (-1), accountGlobalConfRow.id);
                                                    }
                                                  }
                                                }
                                              }
                                              //## Strategy SELL when signal is buy before MACD cross below signal
                                              //ENDS STRATEGY #1
                                              });
                                                               
                                        });                                                                                                                                              
                                      } 
                                      
                                      if(macd.signalOrder=="Sell")
                                      {
                                        console.log("Selling Signal...");                                                                                                       
                                        get_RSI_CMO_Stoch_indicators(accountGlobalConfRow.instrument,accountGlobalConfRow.candlesCount,accountGlobalConfRow.candlesGranularity, function(indicators)
                                        {                                    
                                          var rsi = indicators[0];
                                          rsi = rsi.rsi;
                                          var mco = indicators[1];
                                          var stock = indicators[2];
                                          stock = stock.stock;                                          
                                          var signalMacdTime = macd.time;
                                          var rows = [];
                                          const streamSell = fs.createReadStream(clientCSVPath+"/MACD-"+accountGlobalConfRow.instrument+".csv"); 
                                          csv .fromStream(streamSell) 
                                            .on("data",function(data)
                                            {
                                              rows.push(data);
                                            })
                                            .on("end", function()
                                            {                                            
                                              //## Strategy BUY when signal is sell before MACD cross avobe signal
                                              //BEGIN STRATEGY #1
                                              var startedMACDSellingPeriod = false;  
                                              var periodsBullish = 0;
                                              Object.keys(rows).forEach(function(key) 
                                              {
                                                var row = rows[key];
                                                if(key>0)
                                                {                                                  
                                                  var currentMacdTime = row[0];
                                                  
                                                  if(currentMacdTime == signalMacdTime)
                                                  {
                                                    startedMACDSellingPeriod = true;
                                                  }                                                  
                                                  if(startedMACDSellingPeriod == true)
                                                  {
                                                    //console.log("current  Time: "+currentMacdTime)
                                                    //console.log("signal Time: "+signalMacdTime)
                                                    //Check bullish secuencies, if last macd value is more than penultimate, pass filter 
                                                    //console.log(row)
                                                    var currentMACD = row[2];
                                                    var previousMACDRow = rows[key-1]; 
                                                    var previousMACD = previousMACDRow[2];
                                                    console.log("current  MACD: "+parseFloat(currentMACD))
                                                    console.log("previous MACD: "+parseFloat(previousMACD))
                                                    if(parseFloat(currentMACD) > parseFloat(previousMACD))
                                                    {
                                                      periodsBullish++;
                                                    }
                                                  }
                                                }                                          
                                              });
                                              console.log("Bullish Periods: "+periodsBullish);
                                              if(periodsBullish>1)
                                              {
                                                console.log("RSI: "+rsi);
                                               // if(rsi > 40)
                                                {
                                                  var stochsK = stock.K;
                                                  var stochsD = stock.D;
                                                  stochsK.reverse();
                                                  stochsD.reverse();
                                                  console.log("%K: "+stochsK[0]);  
                                                  console.log("%D: "+stochsD[0]);                                                 
                                                  if(stochsK[0] > stochsD[0]) // K cross above D so, bullish
                                                  {
                                                    var difference = stochsK[0] - stochsD[0]; 
                                                    console.log("%K - %D: "+difference);  
                                                    if(difference > 3) // angle opened - trends bullish
                                                    {
                                                      //place trade / buy - long
                                                      console.log("Creating Buy/Long Order...")
                                                      createTrade(accountId, accountGlobalConfRow.instrument, accountGlobalConfRow.maxUnits, accountGlobalConfRow.id);
                                                      sendNotification("MACD Strategy - Buy/Long before cross avove","All Thechnical indicators were passed. Trade disabled...");
                                                    }
                                                  }
                                                }
                                              }
                                              //## Strategy BUY when signal is sell before MACD cross avobe signal
                                              //ENDS STRATEGY #1

                                            })
                                            .on("end", function(data){
                                              
                                            });                                                                        
                                        });                                                                                                                                      
                                      } 
                                    }                                                                                                           
                                  }
                                }
                            }    
                        }   
            });
        });
        
      });
      if(index == (accounts.length-1))
                {
                    setTimeout(function() {
                        process.exit();
                    }, 20000);
                }
              index++;
    });
  }
  else
    {
        process.exit();
    }

  }
  else
    {
        process.exit();
    }

});
    
function get_RSI_CMO_Stoch_indicators(instrument,count,granularity, callback)
{
  var indicators = [];
  var closes = [];
  var highers = [];
  var lowers = [];
  var times = []
  /*Get Candles*/
  client.getInstruments(instrument,count,granularity,function(error, candles)
  {    

  Object.keys(candles).forEach(function(key) 
  {
      var candle = candles[key];
      closes.push(candle.mid.c);
      lowers.push(candle.mid.l);
      highers.push(candle.mid.h);
      times.push(candle.time);
  });

  tulind.indicators.rsi.indicator([closes],[14], function(err, rsiResult) 
    {
      rsiResult = rsiResult[0];
      rsiResult.reverse();
      indicators.push({rsi:rsiResult[0]
    });

  tulind.indicators.cmo.indicator([closes],[9], function(err, cmoResult) 
    {
      cmoResult = cmoResult[0];
      cmoResult.reverse();
      indicators.push({cmo:cmoResult[0]});
      
    });
  
  tulind.indicators.stoch.indicator([highers, lowers, closes], [14, 1, 3], function(err, stockResult) 
    {
      var stock = {K:stockResult[0],D:stockResult[1]};
      indicators.push({stock:stock});
      return callback(indicators);
    });

  });

 
  }); 
}  

function createTrade(accountId, instrument, units, confId)
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
   to:      "someone <rockscripts@gmail.com>",
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