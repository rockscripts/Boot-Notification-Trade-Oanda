/*var OANDAAdapter = require('oanda-adapter-v20');
var client = new OANDAAdapter({
    // 'live', 'practice' or 'sandbox'
    environment: 'practice',
    // Generate your API access in the 'Manage API Access' section of 'My Account' on OANDA's website
    accessToken: 'ef341f419fd90a61daea143902dfbea8-57c5975686db1479da10cc247075a93a',    
});

client.getInstrumentsList("101-004-8382586-001",function(instruments){
Object.keys(instruments).forEach(function(key) 
                  {
                    var instrumentLine = instruments[key];
                    name = instrumentLine.name;                   
                  });
});*/
var mysql = require('mysql');
var DBconnection = mysql.createConnection({
  host: "localhost",
  user: "oanda",
  password: "oanda123",
  database: "oanda",
  port: "3307"
});


DBconnection.connect(function(err) 
{});
DBconnection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});

DBconnection.query('INSERT INTO globalConfiguration SET ?', 
                       {
                         accountId: '101-004-8382586-001',
                         type: 'BUY',
                         instrument: 'EUR_USD',
                         minPrice: '1.18014',
                         maxPrice: '1.19014',
                         takeProfit: '0.10',
                         stopLoss: '0.20',
                         maxUnits: '100',
                         enabled: 'true'
                       }
, function (error, results, fields) {
  if (error) throw error;
  console.log(results.insertId);
});