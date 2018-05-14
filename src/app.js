window.$ = window.jQuery  = require( 'jquery' );

var Oanda = require('node-oanda');
var dt = require('datatables.net-responsive')( window, jQuery );
var fa = require("fontawesome");
var CronJob = require('cron').CronJob;

const remote = window.require('electron').remote;
var   configv2 = remote.getGlobal('configurationV2').conf;

var   api = new Oanda(configv2); 

/*ACCOUNTS CODE*/
var request = api.accounts.getAccountsForUser();
var dataSet = [];
// Here we handle a successful response from the server
request.success(function(data) { 
  console.log(data)     
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
            var row = [accountDetails.id,accountDetails.alias,accountDetails.currency+" "+accountDetails.balance,"<img src='../assets/images/056-profits-6.png' class='icons open-trading' id='"+accountDetails.id+"' />"]; ;
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
accountsList.fadeOut( "fast", function() {
tradingMain.fadeIn("slow");


var requestTrades = api.trades.getListOfOpenTrades(accountID,{instrument: "EUR_USD"});
requestTrades.success(function(dataTrades) 
{
  var dataSet = [];
  var tradesList = dataTrades.trades;
  var index = 0; 
  var tmpObject = Object.keys(tradesList);
  if(tmpObject.length==0)
  {var table = jQuery('#tableTrading').dataTable({data:dataSet});}
  Object.keys(tradesList).forEach(function(key) 
  {
    var tradeLine = tradesList[key];
    var row = [tradeLine.id,tradeLine.instrument,tradeLine.currentUnits,tradeLine.price,"<span class='current-price-"+tradeLine.instrument+"' trade-unit='"+tradeLine.currentUnits+"' trade-price='"+tradeLine.price+"' index='"+index+"'></span>","<span class='trade-profit-"+index+"'></span>",timeConverter(tradeLine.openTime),"<img src='../assets/images/056-profits-6.png' class='icons' id='"+tradeLine.id+"' />"]; ;
    console.log(tradeLine)
    dataSet[index] = row;
      
    if(index == tmpObject.length-1) 
    var table = jQuery('#tableTrading').dataTable({data:dataSet});
    index++;
  });
  updateLiveData();
});
requestTrades.go();
});    
});

jQuery(document).on("click",".goBackAccounts",function(){   
tradingMain.fadeOut( "slow", function() {
accountsList.fadeIn();
})
});

/*CODE UPDATE CURRENT PRICE FOR BID*/
function updateLiveData()
{
  new CronJob('3 * * * * *', function() {
  var accountId = jQuery("#accountId").val();
  var instruments =  ["EUR_USD"];
        var requestCurrentPrices = api.accounts.getCurrentPricesV2(accountId,instruments);
        requestCurrentPrices.success(function(dataPrices) 
        {
          var dataSet = [];
          var ratesprices = dataPrices.prices;
          var index = 0; 
          Object.keys(ratesprices).forEach(function(key) 
            {
              var rateLine = ratesprices[key];
              console.log(rateLine)
                               
              var requestInstrumentHistory = api.rates.retrieveInstrumentHistory(["EUR_USD"],{count:1});
              requestInstrumentHistory.success(function(dataInstrumentHistory) 
              {
                var candles = dataInstrumentHistory.candles;
                var index = 0; 
                var mid = null;
                Object.keys(candles).forEach(function(key) 
                  {
                    var candleLine = candles[key];
                    mid = candleLine.mid;
                    console.log(candleLine);                    
                  });

                  if(rateLine.instrument="EUR_USD")
                  {
                    jQuery(".current-price-EUR_USD").html(rateLine.bids[0].price);//update current price
                    jQuery(".current-price-EUR_USD").each(function( index ) 
                    {
                     var currentPrice = jQuery(this).text();
                     var tradeUnit = jQuery(this).attr("trade-unit");
                     var tradePrice = jQuery(this).attr("trade-price");
                     var currentIndex = jQuery(this).attr("index");
                     var openingRate = mid.o;
                     var closingRate = mid.c;//candles
                     openingRate = rateLine.closeoutBid;
                     closingRate = rateLine.closeoutAsk;
                     //console.log("("+closingRate+"-"+openingRate+")"+"* ("+tradePrice+")"+" * "+tradeUnit);
                     var profit = (currentPrice - tradePrice) * tradeUnit;
                     jQuery(".trade-profit-"+currentIndex).text(profit.toFixed(2));
                    });
                  }  
              });
              requestInstrumentHistory.error(function(err) {           
                console.log('ERROR[RATES LIST]: ', err);
              });
              requestInstrumentHistory.go();

            });
        });
        requestCurrentPrices.error(function(err) {           
          console.log('ERROR[RATES LIST]: ', err);
        });
        requestCurrentPrices.go();
      }, null, true, 'America/Bogota');
        
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