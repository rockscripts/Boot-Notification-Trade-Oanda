
var Oanda = require('node-oanda');

var config = {
  token: 'ef341f419fd90a61daea143902dfbea8-57c5975686db1479da10cc247075a93a',
  type: 'practice',
  dateFormat: 'unix',
  version:"v20"
};
var api = new Oanda(config);

var requestAccountDetails = api.accounts.getAccountInformation("101-004-8382586-001");
requestAccountDetails.success(function(dataAccount) 
        {
          console.log(dataAccount);
          //$("#accountsList").html(dataAccount);
            /*var accountDetails = dataAccount.account;
           Object.keys(accountDetails).forEach(function(key1) 
           {
           var accountLineDetails = accountDetails[key1];
            $("#accountsList").html(key1);
           });*/
        });
        requestAccountDetails.error(function(err) {           
          console.log('ERROR[ACCOUNTS LIST]: ', err);
        });
        requestAccountDetails.go();
