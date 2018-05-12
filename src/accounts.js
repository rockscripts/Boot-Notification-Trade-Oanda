var $ = require( 'jquery' );
var dt = require('datatables.net-responsive')( window, $ );
var Oanda = require('node-oanda');
var fa = require("fontawesome");
//var datatable      = require( 'datatables.net' )( window, $ );
var config = {
  token: 'ef341f419fd90a61daea143902dfbea8-57c5975686db1479da10cc247075a93a',
  type: 'practice',
  dateFormat: 'unix',
  version:"v20"
};
var Oanda = require('node-oanda');
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
        
        //$("#accountsList").html(accountLine.id);
        var requestAccountDetails = api.accounts.getAccountInformation(accountLine.id);
        
        requestAccountDetails.success(function(dataAccount) 
        {              
            var accountDetails = dataAccount.account;   
            //row = [accountDetails.id,accountDetails.alias,accountDetails.currency,accountDetails.balance,"<img src='../assets/images/056-profits-6.png' class='icons'/>"]; 
            var row = [accountDetails.id,accountDetails.alias,accountDetails.currency+" "+accountDetails.balance,"<img src='../assets/images/056-profits-6.png' class='icons' id='"+accountDetails.id+" class='open-rading'/>"]; ;
            dataSet[index] = row;
            
            if(index == tmpObject.length-1)
            var table = $('#tableAccounts').dataTable({data:dataSet});
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

$(document).ready(function(){
  var selectorId =  $(this).attr("id")
  $(document).on("click",".open-rading",function(){
     
  })
})