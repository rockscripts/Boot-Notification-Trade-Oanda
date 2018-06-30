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


importAccountsPLTransactions();


function importAccountsPLTransactions()
{
    var toDate = new Date();
    toDate = RFCDateTime(toDate);

    var fromDate = new Date();
    var fromDate  = fromDate.setMonth(fromDate.getMonth()-1);
    var fromDate = new Date(fromDate);
    fromDate = RFCDateTime(fromDate);    
    var select = "?to="+toDate+"&from="+fromDate;
    client.getAccounts(function(error, accounts)
    {
        if(error==null)
        {
            Object.keys(accounts).forEach(function(key) 
            {
              var account = accounts[key];
              var accountID = account.id;
              client.getAccountTransactions(accountID,select,function(error,transactions){
                if(error==null)
                {
                  var pages = transactions.pages;
                  Object.keys(pages).forEach(function(keyPages) 
                   {
                    var pageUrl = pages[keyPages];
                    pageUrl = pageUrl.replace("from=","");
                    pageUrl = pageUrl.replace("to=","");
                    var pageUrl = pageUrl.split("?");
                    var params = pageUrl[1];
                    var paramsParts = params.split("&");
                    var idRangeFrom = paramsParts[0];
                    var idRangeTo = paramsParts[1];
                    var select = "/idrange?to="+idRangeTo+"&from="+idRangeFrom;
                    i =0;
                    client.getAccountTransactions(accountID,select,function(error,transactionsRange){
                        var transactionsList =  transactionsRange.transactions;
                        Object.keys(transactionsList).forEach(function(keyTransactionsPages) 
                                {
                                    var transaction = transactionsList[keyTransactionsPages];
                                    if(error==null)
                                    {
                                     if(transaction.reason=="TAKE_PROFIT_ORDER" || transaction.reason=="STOP_LOSS_ORDER")
                                     {
                                      var objectData = {orderID:transaction.orderID,instrument:transaction.instrument,units:transaction.units,pl:transaction.pl,reason:transaction.reason,time:transaction.time,accountID:accountID};
                                      addTransaction(objectData);
                                     } 
                                    } 
                                });
                         
                    });
                   });
                }  
            });
            });
        }                
    });    
}
function RFCDateTime(date)
{ 
    function pad(n){return n<10 ? '0'+n : n}
    return date.getUTCFullYear()+'-'
         + pad(date.getUTCMonth()+1)+'-'
         + pad(date.getUTCDate())+'T'
         + pad(date.getUTCHours())+':'
         + pad(date.getUTCMinutes())+':'
         + pad(date.getUTCSeconds())+'Z'   
}

function addTransaction(object)
{
    DBPool.getConnection(function(err, connection) 
    {
      
      connection.query('INSERT INTO transactionPL SET ?', object, function (error, results, fields) 
        {
            connection.release();
         // if (error) throw error;
        });  
    });
}

var event = new Date('2018-06-21T01:34:03.901179619Z');

console.log(event.toTimeString());