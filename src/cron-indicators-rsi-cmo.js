var mkdirp = require('mkdirp');
var fs = require('fs');
var csv = require('fast-csv');
var tulind = require('tulind');
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

var closes = [];
var times = [];

client.getAccounts(function(error, accounts)
    {
        if(error==null)
        {
            Object.keys(accounts).forEach(function(key) 
            {
              var account = accounts[key];
              var accountId = account.id;
              getGlobalConfInstrumentsByAccount(accountId, function(instruments)
              {
                Object.keys(instruments).forEach(function(keyInstruments) 
                    {
                        var instrument = instruments[keyInstruments].instrument;
                        /*Get Candles*/
                        client.getInstruments(instrument,100,'H1',function(error, candles)
                        {    

                        Object.keys(candles).forEach(function(key) 
                        {
                            var candle = candles[key];
                            closes.push(candle.mid.c);
                            times.push(candle.time);
                        });

                        tulind.indicators.rsi.indicator([closes],[14], function(err, rsiResult) 
                            {
                             console.log(rsiResult);
                            });
                        tulind.indicators.cmo.indicator([closes],[9], function(err, cmoResult) 
                            {
                             console.log(cmoResult);
                            });
                        });
                    });
              });
            });
        }
        process.exit();
    });

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