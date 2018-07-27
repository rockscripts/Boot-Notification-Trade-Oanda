var mkdirp = require('mkdirp');
var fs = require('fs');
var csv = require('fast-csv');
var OANDAAdapter = require('oanda-adapter-v20');
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
var client = new OANDAAdapter(
{
    // 'live', 'practice' or 'sandbox'
    environment: 'practice',
    // Generate your API access in the 'Manage API Access' section of 'My Account' on OANDA's website
    accessToken: 'ef341f419fd90a61daea143902dfbea8-57c5975686db1479da10cc247075a93a',    
});
var tulind = require('tulind');
/*var accountId = "101-004-8382586-003";
var instrument = "XAU_USD";*/

var closes = [];
var times = []
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
              var clientCSVPath = __dirname+"/indicators-csv/"+accountId;
              getGlobalConfInstrumentsByAccount(accountId, function(instruments)
              {
                Object.keys(instruments).forEach(function(keyInstruments) 
                    {
                        var instrument = instruments[keyInstruments].instrument;
                        /*Get Candles*/
                        client.getInstruments(instrument,100,'H4',function(error, candles)
                        {    

                        Object.keys(candles).forEach(function(key) 
                        {
                            var candle = candles[key];
                            closes.push(candle.mid.c);
                            times.push(candle.time);
                        });
                        var originalCloses = closes;

                        tulind.indicators.macd.indicator([closes], [12,26,9], function(err, macdResult) 
                            {
                            var macd          = macdResult[0];
                            var macdSignal    = macdResult[1];
                            var macdHistogram = macdResult[2]; 
                            var fillSize = closes.length - macd.length;
                            for(i=0;i<fillSize;i++)
                            {
                                macdSignal.unshift("");
                                macdHistogram.unshift("");
                                macd.unshift("");
                            }                      
                            var csvInput = [["Time","Input","MACD","Signal","Histogram"]];
                            var signalOrder = null;
                            var signalBuy = false;
                            var signalSell = false;
                            var nearLastSignalValues = [];
                            Object.keys(times).forEach(function(key) 
                            {
                                var time  = times[key];
                                var close = originalCloses[key];
                                var macdV = macd[key];
                                var macdH = macdHistogram[key];
                                var macdS = macdSignal[key];
                                time = time.replace(".000000000Z","");
                                var row = [time,close,macdV,macdS,macdH];
                                csvInput.push(row); 

                                /*Collect best signal values*/
                                if(parseFloat(macdV)>parseFloat(macdS))
                                {
                                    signalOrder = "Buy";
                                    if(nearLastSignalValues.length==0)
                                    {
                                        nearLastSignalValues.push({signalOrder,time,macdV,macdS});
                                        signalBuy = true;
                                        signalSell = false;
                                    }
                                    else
                                    {
                                        if(!signalBuy)
                                        { 
                                        nearLastSignalValues.push({signalOrder,time,macdV,macdS});
                                        signalBuy = true;
                                        signalSell = false;
                                        }
                                    }
                                }
                                if(parseFloat(macdV)<parseFloat(macdS))
                                {
                                    signalOrder = "Sell";
                                    if(nearLastSignalValues.length==0)
                                    {
                                        nearLastSignalValues.push({signalOrder,time,macdV,macdS});
                                        signalSell = true;
                                        signalBuy = false;
                                    }
                                    else
                                    {
                                        if(!signalSell)
                                        { 
                                        nearLastSignalValues.push({signalOrder,time,macdV,macdS});
                                        signalSell = true;
                                        signalBuy = false;
                                        }
                                    }
                                }                       
                            });
                            nearLastSignalValues = nearLastSignalValues.reverse();
                            var recentSignal = nearLastSignalValues[0];

                            mkdirp(__dirname+"/indicators-csv/"+accountId, function(err) { 
                                var ws = fs.createWriteStream(clientCSVPath+"/MACD-macro-"+instrument+".csv")
                                    if(err==null)
                                    {
                                        csv.write(csvInput, {headers:true}).pipe(ws);  
                                    }
                                });
                                setGlobalConfByAccountAndInstrument(accountId, instrument,{macdMacro:JSON.stringify(recentSignal)}, function(){});
                            });
                        });
                    });
              });

              if(index == (accounts.length-1))
              {
                  setTimeout(function() {
                      process.exit();
                  }, 6000);
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

  function setGlobalConfByAccountAndInstrument(accountId, instrument,updateData, callback)
  {    
    DBPool.getConnection(function(err, connection) 
    {
      connection.query("UPDATE globalConfiguration SET ? WHERE accountId='"+accountId+"' AND instrument='"+instrument+"'", [updateData], function (error, results) 
      {
        connection.release(); 
        return callback(error, results)
      })
    });
  } 
  function getGlobalConfInstrumentsByAccount(accountId, callback)
  {  
    DBPool.getConnection(function(err, connection) 
    {    
      connection.query("SELECT DISTINCT instrument FROM globalConfiguration WHERE accountId='"+accountId+"'", function (error, results, fields) 
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
function sendNotification(subject,message)
{
   var email 	= require("emailjs");
   var server 	= email.server.connect({
   user:    "", 
   password:"", 
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
