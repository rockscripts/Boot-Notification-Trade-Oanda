/*var OANDAAdapter = require('oanda-adapter-v20');
var client = new OANDAAdapter({
    // 'live', 'practice' or 'sandbox'
    environment: 'practice',
    // Generate your API access in the 'Manage API Access' section of 'My Account' on OANDA's website
    accessToken: 'ef341f419fd90a61daea143902dfbea8-57c5975686db1479da10cc247075a93a',    
});

var mysql = require('mysql');
var DBconnection = mysql.createConnection({
  host: "localhost",
  user: "oanda",
  password: "oanda123",
  database: "oanda",
  port: "3307"
});

function takeProfit()
{
  client.replaceTrade("101-004-8382586-001",75,{"takeProfit":{"price":"1.17664","timeInForce": "GTC",}},function(result)
    {
      if(typeof(result.takeProfitOrderTransaction.id) !== 'undefined')
      {
        setGlobalConf(20,{alreadyInvested:0});
      }      
    });
}
//takeProfit();

function setGlobalConf(id,updateData)
{    
  DBconnection.query('UPDATE globalConfiguration SET ? WHERE ?', [updateData, { id: id }], function (error, results, fields) 
  {
    console.log(results.OkPacket)
  });
}

function createTrade(instrument, units, confId)
{
  client.createOrder("101-004-8382586-001",{"order":{"units":units, "instrument": instrument, "timeInForce":"FOK", "type": "MARKET", "positionFill": "DEFAULT"}},function(result)
    {
      console.log(result);
      if(typeof(result.takeProfitOrderTransaction.id) !== 'undefined')
      {
      setGlobalConf(confId,{alreadyInvested:1});
      }
    });
}

var Oanda = require('node-oanda');
var config = {
  token: 'ef341f419fd90a61daea143902dfbea8-57c5975686db1479da10cc247075a93a',
  type: 'practice',
  dateFormat: 'unix',
  version:"v20"
};
var   api = new Oanda(config); 
var accountID = "101-004-8382586-001";
//createTrade("EUR_USD", "1", 20);
var requestTrades = api.trades.getListOfOpenTrades(accountID);
requestTrades.success(function(dataTrades) 
{
  var tradesList = dataTrades.trades;
  Object.keys(tradesList).forEach(function(key) 
  {
    var tradeLine = tradesList[key];
    
    var requestTrades1 = client.closeTrade(accountID,tradeLine.id,null,function(result,s){
//console.log(result)
//console.log(tradeLine.id)
requestTrades1 = client.closeTrade(accountID,tradeLine.id,null,function(result,s){
  //console.log(result)
  console.log(tradeLine.id)

      });
    });

  });
})
requestTrades.go();*/
/*var requestTrades1 = client.closeTrade(accountID,2059,null,function(result,s){
  //console.log(result)
  console.log(s)
      });*/

      var mysql = require('mysql');
var DBPool  = mysql.createPool({
  host: "localhost",
  user: "oanda",
  password: "oanda123",
  database: "oanda",
  port: "3307"
});
 /*
pool.getConnection(function(err, connection) {
  // Use the connection
  connection.query('SELECT * FROM globalConfiguration', function (error, results, fields) {
    // And done with the connection.
    connection.release();
 console.log("results: "+results)
 console.log("error: "+error)
    // Handle error after the release.
    if (error) throw error;
 
    // Don't use the connection here, it has been returned to the pool.
  });
});*//*
for(i=0;i<7;i++)
{
  getGlobalConf("BUY","XAU_USD",function(result)
  {
  console.log(result)
  })
}
function getGlobalConf(type,instrument,callback)
{
  var accountID = "101-004-8382586-001";   
  console.log("SELECT * FROM globalConfiguration WHERE accountId='"+accountID+"' AND type='"+type+"' AND instrument='"+instrument+"'") 
  DBPool.getConnection(function(err, connection) 
  {
    connection.query("SELECT * FROM globalConfiguration WHERE accountId='"+accountID+"' AND type='"+type+"' AND instrument='"+instrument+"'", function (error, results, fields) 
      {
        connection.release();
        console.log("error: "+ error)
        console.log("results: "+results)
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
}*/
var OANDAAdapter = require('oanda-adapter-v20');
var client = new OANDAAdapter({
    // 'live', 'practice' or 'sandbox'
    environment: 'practice',
    // Generate your API access in the 'Manage API Access' section of 'My Account' on OANDA's website
    accessToken: 'ef341f419fd90a61daea143902dfbea8-57c5975686db1479da10cc247075a93a',    
});
function takeProfit(tradeId, currentPrice, confId)
{
  var accountId = "101-004-8382586-001";
  console.log({"takeProfit":{"price":currentPrice,"timeInForce": "GTC",}})
  client.replaceTrade(accountId,tradeId,{"takeProfit":{"price":currentPrice,"timeInForce": "GTC",}},function(data)
    {
      console.log(data);
      //setGlobalConf(confId,{alreadyInvested:0});
     // displayNotification("success","#"+tradeId+" Profit taked");
    });
}

takeProfit(5210, "1290.912", 5);