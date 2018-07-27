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

var OANDAAdapter = require('oanda-adapter-v20');
var client = new OANDAAdapter(
{
    // 'live', 'practice' or 'sandbox'
    environment: 'practice',
    // Generate your API access in the 'Manage API Access' section of 'My Account' on OANDA's website
    accessToken: 'ef341f419fd90a61daea143902dfbea8-57c5975686db1479da10cc247075a93a',    
});

/*
 get bear and bull percent for getting an indicator 
*/

getGlobalConfInstruments(function(configurations){
  if(configurations=='null')
      {process.exit()}
      else
      {
        if(configurations.length > 0)
        {
          var index = 0;
          Object.keys(configurations).forEach(function(key) 
         {
            var configuration = configurations[key];
            bearBullCalculator(configuration.instrument,function(objectData){
            setGlobalConfByInstrument(configuration.instrument,objectData, function(){});
           }); 
           if(index == configurations.length-1)
                  {
                      setTimeout(function() {
                          process.exit();
                      }, 6000);
                  }
                  else{index++;}   
         });
        }
        else
        {
          process.exit();
        }        
      }  
});

function bearBullCalculator(instrument,callback)
{
  client.getInstruments(instrument,1000,'H1',function(error, candles)
  {
    var Bull = 0;
    var Bear = 0;
    var DOJI = 0;
    Object.keys(candles).forEach(function(key) 
         {
          var candle = candles[key];
          var closeCandle = candle.mid.c; 
          var openCandle  = candle.mid.o; 
          
          if(parseFloat(closeCandle) < parseFloat(openCandle))
          {
            Bear++;
          }
          else if(parseFloat(closeCandle) > parseFloat(openCandle))
          {
            Bull++;
          }
          else
          {
            DOJI++;
          }
         });
  
    var bu_beTotal = parseInt(Bull)+parseInt(Bear);
    var bearPercent =  (parseInt(Bear)/bu_beTotal) * 100;
    var bullPercent = (parseInt(Bull)/bu_beTotal) * 100;
    return callback({bear: bearPercent, bull: bullPercent}) ;
  });
}

function getGlobalConfInstruments(callback)
{  
  DBPool.getConnection(function(err, connection) 
  {    
    connection.query("SELECT DISTINCT instrument FROM globalConfiguration", function (error, results, fields) 
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

function setGlobalConfByInstrument(instrument,updateData, callback)
{    
  DBPool.getConnection(function(err, connection) 
  {
    connection.query('UPDATE globalConfiguration SET ? WHERE ?', [updateData, { instrument: instrument }], function (error, results) 
    {
      connection.release(); 
      return callback(error, results)
    })
  });
}