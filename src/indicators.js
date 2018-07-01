var mkdirp = require('mkdirp');
var fs = require('fs');
var csv = require('fast-csv');





var OANDAAdapter = require('oanda-adapter-v20');
var client = new OANDAAdapter(
{
    // 'live', 'practice' or 'sandbox'
    environment: 'practice',
    // Generate your API access in the 'Manage API Access' section of 'My Account' on OANDA's website
    accessToken: 'ef341f419fd90a61daea143902dfbea8-57c5975686db1479da10cc247075a93a',    
});
var tulind = require('tulind');





var accountId = "101-004-8382586-003";
var clientCSVPath = __dirname+"/indicators-csv/"+accountId;

var closes = [];
var times = []
client.getInstruments("XAU_USD",100,'M1',function(error, candles)
  {
    
    Object.keys(candles).forEach(function(key) 
    {
        var candle = candles[key];
        closes.push(candle.mid.c);
        times.push(candle.time);
    });
    var originalCloses = closes;
    closes = closes.reverse();
    //times = times.reverse();
    tulind.indicators.macd.indicator([closes], [2,5,9], function(err, macdResult) 
      {
        var macd          = macdResult[0];
        var macdSignal    = macdResult[1];
        var macdHistogram = macdResult[2];       
        macdSignal.unshift("","","","");
        macdHistogram.unshift("","","","");
        macd.unshift("","","","");
        var csvInput = [["Time","Input","MACD","Signal","Histogram"]];
        Object.keys(times).forEach(function(key) 
        {
            var time  = times[key];
            var close = originalCloses[key];
            var macdV = macd[key];
            var macdH = macdHistogram[key];
            var macdS = macdSignal[key];
            var row = [time,close,macdV,macdS,macdH];
            csvInput.push(row);
        });
        mkdirp(__dirname+"/indicators-csv/"+accountId, function(err) { 
            var ws = fs.createWriteStream(clientCSVPath+"/MACD-XAU_USD.csv")
                if(err==null)
                {
                    csv.write(csvInput, {headers:true}).pipe(ws);  
                }
            });
      });
  });

  
        