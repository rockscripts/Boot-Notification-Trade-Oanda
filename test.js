var OANDAAdapter = require('oanda-adapter-v20');
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
      //setGlobalConf(confId,{alreadyInvested:1});
      }
    });
}

createTrade("EUR_USD", "1", 20);