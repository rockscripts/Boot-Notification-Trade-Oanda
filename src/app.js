//developed by rockscripts
window.$ = window.jQuery  = require( 'jquery' );
var jui = require('jquery-ui-bundle');

var mysql = require('mysql');
var DBPool = mysql.createPool(
{
  host: "localhost",
  user: "oanda",
  password: "oanda123",
  database: "oanda",
  port: "3307",
  acquireTimeout:90000,
  waitForConnections:true
});

var Noty = require('noty');
var Oanda = require('node-oanda');
var dt = require('datatables.net-responsive')( window, jQuery );
var fa = require("fontawesome");
var serialize = require('dom-form-serializer').serialize
var currencyFormatter = require('currency-formatter');
var CronJob = require('cron').CronJob;

const remote = window.require('electron').remote;
var   configv2 = remote.getGlobal('configurationV2').conf;

var   api = new Oanda(configv2); 
/*added to replace trade or edit
  node oanda does not work
*/
var OANDAAdapter = require('oanda-adapter-v20');
var client = new OANDAAdapter({
    // 'live', 'practice' or 'sandbox'
    environment: 'practice',
    // Generate your API access in the 'Manage API Access' section of 'My Account' on OANDA's website
    accessToken: configv2.token,    
});

/*DATA TABLES*/
var tableGlobalConf = jQuery("#tableGlobalConf");

/*ACCOUNTS CODE*/
var request = api.accounts.getAccountsForUser();
var dataSet = [];
// Here we handle a successful response from the server
request.success(function(data) { 
     
     var accountsList = data.accounts;
     var index = 0; 
     var tmpObject = Object.keys(accountsList);
     if(tmpObject.length==0)
       {var table = jQuery('#tableTrading').dataTable({data:dataSet});}
     Object.keys(accountsList).forEach(function(key) {
        var accountLine = accountsList[key];        
        //jQuery("#accountsList").html(accountLine.id);
        var requestAccountDetails = api.accounts.getAccountInformation(accountLine.id);
        
        requestAccountDetails.success(function(dataAccount) 
        {              
            var accountDetails = dataAccount.account;   
            var row = [accountDetails.id,accountDetails.alias,currencyFormatter.format(accountDetails.balance, { code: accountDetails.currency }),"<img src='../assets/images/exchange.png' class='icons open-trading' id='"+accountDetails.id+"' />"]; ;
            dataSet[index] = row;
            
            if(index == tmpObject.length-1)
            var table = jQuery('#tableAccounts').dataTable({data:dataSet});
            index++;    
        });
        requestAccountDetails.error(function(err) {           
          console.log('ERROR[ACCOUNT DETAILS]: ', err);
        });
        requestAccountDetails.go();
    });    
});

request.error(function(err) { 
  console.log('ERROR[ACCOUNTS LIST]: ', err);
}); 

request.go();
  

var tradingMain  = jQuery("#traddingMain");
var accountsList  = jQuery("#accountsList");
var tradeConfiguration = jQuery("#tradeConfiguration");
var buttonAddBuyConf = jQuery(".addBuyRowGlobal");
var buttonEditGlobalConf = jQuery(".editGlobalConf");
var dataTableTrades = jQuery('#tableTrading');
jQuery("body").css("display","inline");
tradingMain.fadeOut();

jQuery(document).on("click",".open-trading",function(e)
{    
setAccountId = function (selector) {
  var accountID = selector.attr("id");
  jQuery("#accountId").val(accountID);
  return accountID;
};
var accountID = setAccountId($(this));
setGlobalConfAccount(accountID,{enabled:0},function(err,result)
    {
      if(result.affectedRows>0)
      {
        displayNotification("info","Configurations for instruments has been disabled.")  
      }
    }) ; 
accountsList.fadeOut( "fast", function() {
tradingMain.fadeIn("slow");


var requestTrades = api.trades.getListOfOpenTrades(accountID/*,{instrument: "EUR_USD"}*/);
requestTrades.success(function(dataTrades) 
{
  var dataSet = [];
  var tradesList = dataTrades.trades;
  var index = 0; 
  var tmpObject = Object.keys(tradesList);
  if(tmpObject.length==0)
  {
    dataTableTrades.DataTable().destroy();
    dataTableTrades.dataTable({data:dataSet});
  }
  Object.keys(tradesList).forEach(function(key) 
  {
    var tradeLine = tradesList[key];
    var row = [tradeLine.id,tradeLine.instrument,tradeLine.currentUnits,tradeLine.price,"<span class='current-price-"+tradeLine.instrument+"' trade-unit='"+tradeLine.currentUnits+"' trade-price='"+tradeLine.price+"' index='"+index+"' trade-id='"+tradeLine.id+"'></span>","<span class='trade-profit-"+index+"'></span>",timeConverter(tradeLine.openTime),"<img src='../assets/images/settings-row.png' class='icons' id='"+tradeLine.id+"' title='Configure this trade' />"]; ;
    
    dataSet[index] = row;
      
    if(index == tmpObject.length-1) 
    { 
      if ( ! $.fn.DataTable.isDataTable( '#tableTrading' ) ) {
        dataTableTrades.dataTable({data:dataSet});
      }   
      else{
        dataTableTrades.DataTable().destroy();
        dataTableTrades.dataTable({data:dataSet});
      }
       
    }
   
    index++;
  });
  updateLiveData();
});
requestTrades.go();
});    
});

jQuery(document).on("click",".goBackAccounts",function(){   
tradingMain.fadeOut( "slow", function() {
  jQuery("#tradeConfiguration").fadeIn();
accountsList.fadeIn();
jQuery("#goGlobalConfiguration").fadeIn();
tradeConfiguration.hide();

})
});

//goGlobalConfiguration

jQuery(document).on("click",".goGlobalConfiguration",function()
{ 
  var accountID = jQuery("#accountId").val();
  jQuery(".form-accountId").val(accountID);
  tradeConfiguration.dialog({
    modal: true,
    resizable: false,
    title: ' Add BUY configuration',
    open: function(){
      jQuery('.ui-dialog').css({
                                'width': $(window).width(),
                                'height': $(window).height(),
                                'left': '0px',
                                'top':'0px'
                              });
      jQuery("#goGlobalConfiguration").fadeOut();
      jQuery("#tradesList").fadeOut();
      buttonAddBuyConf.fadeIn();
                    },
    close: function(){
      jQuery(".goGlobalConfiguration").fadeIn();
      jQuery("#tradesList").fadeIn();
    }
 }); 
 jQuery("#addGlobalConfigurationBUYoportunity").addClass("hide");
 tradeConfiguration.dialog("open");
 fillTableGlobalConf();
});
jQuery(document).on("click",".addBuyRowGlobal",function()
{ 
  var instrumentsDropdown = jQuery("#instrumetns-dropdown");
  var accoundId = jQuery("#accountId").val();
  client.getInstrumentsList(accoundId,function(instruments){
  Object.keys(instruments).forEach(function(key) 
      {
        var instrumentLine = instruments[key];
        instrumentsDropdown.append(jQuery("<option />").val(instrumentLine.name).text(instrumentLine.displayName));                  
      });
      jQuery("#addGlobalConfigurationBUYoportunity").attr("action","add");
      //jQuery("#instrumetns-dropdown").attr("disabled",false);
      jQuery("#instrumetns-dropdown").val("EUR_USD");
      jQuery("#minPrice").val("");
      jQuery("#maxPrice").val("");
      jQuery("#takeProfit").val("");
      jQuery("#stopLoss").val("");
      jQuery("#maxUnits").val("");
      jQuery("#enabled").val(1);
      jQuery("#submit-global-conf").val("Submit");
      jQuery("#addGlobalConfigurationBUYoportunity").removeClass("hide");
      jQuery(".addBuyRowGlobal").fadeOut("fast");      
      });  
});

jQuery(document).on("click",".editGlobalConf",function()
{ 
  var instrumentsDropdown = jQuery("#instrumetns-dropdown");
  var accoundId = jQuery("#accountId").val();
  var confId = jQuery(this).attr("id");
  client.getInstrumentsList(accoundId,function(instruments){
  
      jQuery("#addGlobalConfigurationBUYoportunity").removeClass("hide");
      jQuery(".addBuyRowGlobal").fadeOut("fast"); 
      jQuery(".add-element").fadeOut("fast"); 
      jQuery(".edit-element").removeClass("hide");  
      jQuery("#addGlobalConfigurationBUYoportunity").attr("action","edit");
      jQuery("#addGlobalConfigurationBUYoportunity").attr("confId",confId);

     getGlobalConfById(confId,function(rowConf)
      {
        jQuery("#instrumetns-dropdown").find('option').remove();
        //jQuery("#instrumetns-dropdown").attr("disabled",true);
        Object.keys(instruments).forEach(function(key) 
          {
            var instrumentLine = instruments[key];
            if(rowConf.instrument == instrumentLine.name)
            {
              instrumentsDropdown.append(jQuery("<option />").val(instrumentLine.name).text(instrumentLine.displayName));
            }                              
          });

        jQuery("#instrumetns-dropdown").val(rowConf.instrument);
        jQuery("#minPrice").val(rowConf.minPrice);
        jQuery("#maxPrice").val(rowConf.maxPrice);
        jQuery("#takeProfit").val(rowConf.takeProfit);
        jQuery("#stopLoss").val(rowConf.stopLoss);
        jQuery("#maxUnits").val(rowConf.maxUnits);
        jQuery("#enabled").val(rowConf.enabled);
        jQuery("#submit-global-conf").val("Save");
      });
      
    }); 
});

jQuery(document).on("click",".closeForm-addGlobalConfigurationBUYoportunity",function()
{
  jQuery("#addGlobalConfigurationBUYoportunity").addClass("hide",function(){  buttonAddBuyConf.fadeIn(); });    
  if(jQuery("#addGlobalConfigurationBUYoportunity").attr("action")=="edit")
  {
    jQuery(".add-element").fadeIn("fast"); 
    jQuery(".edit-element").addClass("hide"); 
  }
});
jQuery(document).on("click",".updateTradesTable",function()
{
  updateDataTableTrades();
});
jQuery( "#addGlobalConfigurationBUYoportunity" ).submit(function( event ) 
{
  event.preventDefault();
  var object = serialize(document.querySelector('#addGlobalConfigurationBUYoportunity'));  
  var action = jQuery(this).attr("action");
  if(action=="add")
  {
    DBPool.getConnection(function(err, connection) 
    {
      connection.query('INSERT INTO globalConfiguration SET ?', object, function (error, results, fields) 
        {
          connection.release();
          if (error) throw error;
  
          if(results.insertId > 0)
          {
            jQuery("#addGlobalConfigurationBUYoportunity").addClass("hide",function(){  buttonAddBuyConf.fadeIn(); });          
            displayNotification("success",'Configuration saved');   
            fillTableGlobalConf();   
          } 
        });  
    });
  }
  if(action=="edit")
  {
    var confId = jQuery(this).attr("confId");
    setGlobalConf(confId,object,function(err,result)
    {
      if(result.affectedRows>0)
      {
        fillTableGlobalConf();  
        displayNotification("success","Configuration saved.");
        jQuery("#addGlobalConfigurationBUYoportunity").addClass("hide",function(){  buttonAddBuyConf.fadeIn(); });  
        jQuery(".add-element").fadeIn("fast"); 
        jQuery(".edit-element").addClass("hide");   
      }
    }) ;     
  }
  
});

function fillTableGlobalConf()
{
  tableGlobalConf.DataTable().destroy();
  var accountID = jQuery("#accountId").val();  
  var dataSet = [];    
  DBPool.getConnection(function(err, connection) 
  {  
    connection.query("SELECT * FROM globalConfiguration WHERE accountId='"+accountID+"'", function (error, results, fields) 
  {
    connection.release();
    if (error) throw error;
    var index = 0; 
    var iconStatus = null;
    results.forEach(function(confRow) 
    {

      if(confRow.enabled=="0")
      iconStatus = "<img src='../assets/images/switch-off.png' class='icons' title='This configuration is disabled' />";
      else
      var iconStatus = "<img src='../assets/images/switch-on.png' class='icons' title='This configuration is enabled' />";

      var row = [confRow.id,confRow.instrument,confRow.minPrice,confRow.maxPrice,confRow.takeProfit,confRow.stopLoss,confRow.maxUnits,iconStatus,"<img src='../assets/images/pen.png' class='icons-small editGlobalConf' id='"+confRow.id+"'/>"];
      dataSet[index] = row;
      index++;
    });
    tableGlobalConf.dataTable({data:dataSet});
    
  });
});
}

/*CODE UPDATE CURRENT PRICE FOR BID*/
function updateLiveData()
{
  x = 5;  // 5 Seconds
  new CronJob('* * * * * *', function() 
  {
  var accountId = jQuery("#accountId").val();
  var instruments =  "EUR_USD,XAU_USD";
  
        var requestCurrentPrices = api.accounts.getCurrentPricesV2(accountId,instruments);
        requestCurrentPrices.success(function(dataPrices) 
        {

          
          var dataSet = [];
          var ratesprices = dataPrices.prices;
          var index = 0; 
          Object.keys(ratesprices).forEach(function(key) 
            {
              var rateLine = ratesprices[key];
              console.log(rateLine);                 
              //var requestInstrumentHistory = api.rates.retrieveInstrumentHistory(["EUR_USD"],{count:1});
             // requestInstrumentHistory.success(function(dataInstrumentHistory) 
             // {
               // var candles = dataInstrumentHistory.candles;
                var index = 0; 
                var mid = null;
              /*  Object.keys(candles).forEach(function(key) 
                  {
                    var candleLine = candles[key];
                    mid = candleLine.mid;                   
                  });*/

                 // if(rateLine.instrument=="EUR_USD.")
                  {
                    jQuery(".current-price-"+rateLine.instrument).html(rateLine.bids[0].price);//update current price
                    jQuery(".current-price-"+rateLine.instrument).each(function( index ) 
                    {
                      
                     var currentPrice = rateLine.bids[0].price;
                     var tradeUnit = jQuery(this).attr("trade-unit");
                     var tradePrice = jQuery(this).attr("trade-price");
                     var tradeId = jQuery(this).attr("trade-id");
                     var currentIndex = jQuery(this).attr("index");
                     //var openingRate = mid.o;
                     //var closingRate = mid.c;//candles
                     openingRate = rateLine.closeoutBid;
                     closingRate = rateLine.closeoutAsk;
                     var profit = (parseFloat(currentPrice) - parseFloat(tradePrice)) * parseFloat(tradeUnit);
                     var nowDateTime = new Date();
                     nowDateTime = formatDate(nowDateTime, "dddd h:mmtt d MMM yyyy");

                     var base_currency = rateLine.instrument.split("_");
                     base_currency = base_currency[0];
                     jQuery(".trade-profit-"+currentIndex).text(currencyFormatter.format(profit, { code: base_currency }));

                     getGlobalConf("BUY",rateLine.instrument,function(globalConf)
                     {
                       console.log(globalConf)
                       //Take profit based on instrument configuration
                        if(globalConf!=null)
                        {
                          /*BEGIN TAKE PROFIT*/
                          if(rateLine.instrument=="XAU_USD")
                          var takeProfitPrice = sumeFloat(currentPrice,0.010);
                          else
                          var takeProfitPrice = sumeFloat(currentPrice,0.00008);

                          if(profit > globalConf.takeProfit)
                          {
                            if(globalConf.alreadyInvested == 1)
                            {
                              if(globalConf.enabled)
                              {
                                takeProfit(tradeId, takeProfitPrice, globalConf.id);
                              }
                              //require above current price   
                              //sendNotification("Take Profit Requested","Trade ID: "+tradeId +"\n"+"Taked at: "+takeProfitPrice+"\n"+"Date: "+nowDateTime);                          
                          //    displayNotification("success","taked profit "+tradeId)
                            }                            
                          } 

                          /*END TAKE PROFIT*/
                          //Stop loss based on instrument configuration     
                           /*BEGIN STOP LOSS*/
                          if(rateLine.instrument=="XAU_USD")
                          var stopLossPrice = restFloat(currentPrice,0.010);
                          else
                          var stopLossPrice = restFloat(currentPrice,0.00008);
                          
                          if(profit < (globalConf.stopLoss*(-1)))
                          {
                            if(globalConf.alreadyInvested == 1)
                            {
                              if(globalConf.enabled)
                              {
                              stopLoss(tradeId, stopLossPrice, globalConf.id);
                              }
                            }                            
                          }
                        }                      
                     });                     
                      
                    });
                  }
              //});
              //requestInstrumentHistory.error(function(err) {           
              //                                                console.log('ERROR[RATES LIST]: ', err);
              //                                              });
             // requestInstrumentHistory.go();
            
              getGlobalConf("BUY",rateLine.instrument,function(globalConf)
              {
                  /*IS TIME TO AUTO INVEST?*/
                  if(globalConf!=null)
                  {
                    if(parseFloat(rateLine.bids[0].price) > parseFloat(globalConf.minPrice) && parseFloat(rateLine.bids[0].price) < parseFloat(globalConf.maxPrice))                  
                    {
                      //displayNotification("info","current price between")
                      if(globalConf.enabled == 1)
                      {
                        if(globalConf.alreadyInvested == 0)
                        {                                               
                         createTrade(rateLine.instrument, globalConf.maxUnits, globalConf.id);
                        }
                      }
                    }  
                  }    
                             
              });
            
            });
            

            
        });
        requestCurrentPrices.error(function(err) {           
          console.log('ERROR[RATES LIST]: ', err);
        });
        requestCurrentPrices.go();
      }, null, true, 'America/Bogota');
      
      new CronJob('05 * * * * *', function() 
      {
        updateDataTableTrades();
      }, null, true, 'America/Bogota');  
}
function updateDataTableTrades()
{
var accountID = jQuery("#accountId").val();
var requestTrades = api.trades.getListOfOpenTrades(accountID);
requestTrades.success(function(dataTrades) 
{
  var dataSet = [];
  var tradesList = dataTrades.trades;
  var index = 0; 
  var tmpObject = Object.keys(tradesList);
  if(tmpObject.length==0)
  {
    dataTableTrades.DataTable().destroy();
    dataTableTrades.dataTable({data:dataSet});
  }
  Object.keys(tradesList).forEach(function(key) 
  {
    var tradeLine = tradesList[key];
    var row = [tradeLine.id,tradeLine.instrument,tradeLine.currentUnits,tradeLine.price,"<span class='current-price-"+tradeLine.instrument+"' trade-unit='"+tradeLine.currentUnits+"' trade-price='"+tradeLine.price+"' index='"+index+"' trade-id='"+tradeLine.id+"'></span>","<span class='trade-profit-"+index+"'></span>",timeConverter(tradeLine.openTime),"<img src='../assets/images/settings-row.png' class='icons' id='"+tradeLine.id+"' title='Configure this trade' />"]; ;
    
    dataSet[index] = row;
      
    if(index == tmpObject.length-1) 
    { 
      if ( ! $.fn.DataTable.isDataTable( '#tableTrading' ) ) {
        dataTableTrades.dataTable({data:dataSet});
      }   
      else{
        dataTableTrades.DataTable().destroy();
        dataTableTrades.dataTable({data:dataSet});
      }
       
    }
   
    index++;
  });
  updateLiveData();
});
requestTrades.go(); 
}
function createTrade(instrument, units, confId)
{
  var accountID = jQuery("#accountId").val(); 
  if(jQuery(".current-price-"+instrument).length==0)
  {
    setGlobalConf(confId,{alreadyInvested:1},function(err, result)
    {
      if(result.affectedRows>0)
      {
        client.createOrder(accountID,{"order":{"units":units, "instrument": instrument, "timeInForce":"FOK", "type": "MARKET", "positionFill": "DEFAULT"}},function(result)
        {
            //displayNotification("success","# Create trade was requested 1");
            displayNotification("success","# Create trade was requested");
            updateDataTableTrades();       
        });
      }
    }); 
  }    
}

function takeProfit(tradeId, currentPrice, confId)
{
  var accountId = jQuery("#accountId").val();
  console.log({"takeProfit":{"price":currentPrice,"timeInForce": "GTC",}})
  setGlobalConf(confId,{alreadyInvested:0},function(err, result)
  {
    if(result.affectedRows>0)
    {
      client.replaceTrade(accountId,tradeId,{"takeProfit":{"price":currentPrice,"timeInForce": "GTC",}},function(data)
      {
        displayNotification("success","#"+tradeId+" Take Profit was requested.");
        updateDataTableTrades();
      });
    }  
  });
}

function stopLoss(tradeId, currentPrice, confId)
{
  var accountId = jQuery("#accountId").val();
  setGlobalConf(confId,{alreadyInvested:0},function(err, result)
  {
    if(result.affectedRows>0)
    {
      client.replaceTrade(accountId,tradeId,{"stopLoss":{"price":currentPrice,"timeInForce": "GTC",}},function(data)
      {
        displayNotification("success","#"+tradeId+" Stop Loss was requested.");
        updateDataTableTrades();
      });
    }  
  });
}

function getGlobalConf(type,instrument,callback)
{
  var accountID = jQuery("#accountId").val();   
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
function getGlobalConfById(id,callback)
{
  var accountID = jQuery("#accountId").val();   
  DBPool.getConnection(function(err, connection) 
  {
    console.log("SELECT * FROM globalConfiguration WHERE id='"+id+"'")
    connection.query("SELECT * FROM globalConfiguration WHERE id='"+id+"'", function (error, results, fields) 
      {
        console.log(results)
        console.log(error)
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
