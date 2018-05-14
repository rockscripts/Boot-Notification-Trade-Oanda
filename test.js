
var Oanda = require('node-oanda');

     var config = {
      token: 'ef341f419fd90a61daea143902dfbea8-57c5975686db1479da10cc247075a93a',
      type: 'practice',
      dateFormat: 'unix',
      version:"v1"
    };
        var apiV1 = new Oanda(config);
        var instruments =  new Array();
        var requestCurrentPrices = apiV1.rates.getCurrentPrices(["EUR_USD"]);
        requestCurrentPrices.success(function(dataPrices) 
        {
          var dataSet = [];
          var ratesprices = dataPrices.prices;
          var index = 0; 
          Object.keys(ratesprices).forEach(function(key) 
            {
              var rateLine = ratesprices[key];
              console.log(rateLine);
            });
        });
        requestCurrentPrices.error(function(err) {           
          console.log('ERROR[RATES LIST]: ', err);
        });
        requestCurrentPrices.go();
        
        
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
        console.log(timeConverter('1526072385.000000000'));