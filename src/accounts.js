window.$ = window.jQuery  = require( 'jquery' );
var Oanda = require('node-oanda');
var dt = require('datatables.net-responsive')( window, jQuery );

var fa = require("fontawesome");

const remote = window.require('electron').remote;
var config = remote.getGlobal('configuration').conf;

/*console.log(config)
var config = {
  token: 'ef341f419fd90a61daea143902dfbea8-57c5975686db1479da10cc247075a93a',
  type: 'practice',
  dateFormat: 'unix',
  version:"v20"
};*/
var api = new Oanda(config); 
// This only creates a request object, the request is not yet sent
var request = api.accounts.getAccountsForUser();
var dataSet = [];
// Here we handle a successful response from the server
request.success(function(data) {
  
     var accountsList = data.accounts;
     var index = 0; 
     var tmpObject = Object.keys(accountsList);
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

// Here we handle an error returned from the server
request.error(function(err) { 
  console.log('ERROR[ACCOUNTS LIST]: ', err);
}); 

// Execute the request.
request.go();
  

    var tradingMain  = jQuery("#traddingMain");
    var accountsList  = jQuery("#accountsList");

    jQuery("body").css("display","inline");
    tradingMain.fadeOut();

  jQuery(document).on("click",".open-trading",function(e)
  {    
    accountsList.fadeOut( "fast", function() {
      tradingMain.fadeIn("slow");
    });
    
  });

  jQuery(document).on("click",".goBackAccounts",function(){   
    tradingMain.fadeOut( "slow", function() {
      accountsList.fadeIn();
    })
  });