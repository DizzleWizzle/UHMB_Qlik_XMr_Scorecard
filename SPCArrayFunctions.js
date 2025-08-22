function processDataArray(data,runlength ,trendlength,clunderzero,calcpoints,within1sigma,useBaseline){
    var optSD = 3; //number of Sigma for CL's
    //var runlength = opt.runlength;
    //var trendlength = opt.trendlength;
    // var showtarget = ((opt.showtarget == 1) ? true : false);
    //var targetvalue = parseFloat(opt.targetvalue);
    //var higherbetter = ((opt.higherbetter == 1) ? true : false);
    //var showlabels = opt.showlabels;
    //var clunderzero = ((opt.clunderzero == 1) ? true : false);
    //var showRecalc = opt.showRecalc;
    //var higherbetternum = opt.higherbetter;
    //var numMeasures = opt.numMeasures;
    //var HideXAxis = opt.HideXAxis;

    var unique = [...new Set(data.map(item => item.reCalcID))];
    var Holding =  new Array();
    unique.forEach((ID) => {
        var temp = data.filter(x => x.reCalcID == ID);
        Holding.push(temp);
        temp = null;
    });

    Holding.forEach((group) => {
        var trimmed = JSON.parse(JSON.stringify(group));
        if (trimmed.length >= calcpoints && calcpoints > 0 && useBaseline == true) {
            trimmed.length = calcpoints;
        }

        trimmed.forEach(function (d, i) {

            if (i > 0) {
                d.MR = Math.abs(d.value - trimmed[i - 1].value);
            }
        });
        var xAvg = d3.mean(getFields(trimmed, "value"));
        var xMR = d3.mean(getFields(trimmed, "MR"));
        var xUCL = (xMR / 1.128 * optSD) + xAvg;
        var xLCL = xAvg - (xMR / 1.128 * optSD);
        if (clunderzero == false) {
            if (xLCL < 0) {
                xLCL = 0;
            }
        }
        var xSigma = xMR / 1.128;

        group.forEach((row) => {
            row.currAvg = xAvg;
            row.currUCL = xUCL;
            row.currLCL = xLCL;
            row.currSigma = xSigma;
        });

    });

    data.forEach(function (d, i) {
        d.dim = dateFromQlikNumber(d.dim);
        // d.value = d.value;
        if (i > 0) {
            d.MR = d.value - data[i - 1].value;
        }
        var meansum = meanSumCheck(data, i, runlength);
        var revmeansum = revMeanSumCheck(data, i, runlength);
        var trendsum = trendSumCheck(data, i, trendlength - 1);
        var closetomean = closeToMean(data, i, within1sigma);
        var nearUCL = nearUCLCheck(data, i, 3);
        var nearLCL = nearLCLCheck(data,i,3);
        if (meansum == runlength || revmeansum == runlength || ((i > 0) && (data[i - 1].check == 1 && d.value > d.currAvg))) {
            d.check = 1;
        } else if (meansum == -runlength || revmeansum == -runlength || ((i > 0) && (data[i - 1].check == -1 && d.value < d.currAvg))) {
            d.check = -1;
        } else {
            d.check = 0;
        }
        if (trendsum >= (trendlength - 1) || ((i > 0) && (data[i - 1].asctrendcheck == 1 && d.value > data[i - 1].value))) {
            d.asctrendcheck = 1;
        } else {
            d.asctrendcheck = 0;
        }
        if (trendsum <= -1 * (trendlength - 1) || ((i > 0) && (data[i - 1].desctrendcheck == 1 && d.value < data[i - 1].value))) {
            d.desctrendcheck = 1;
        } else {
            d.desctrendcheck = 0;
        }
        if (closetomean == within1sigma || ((i > 0) && (data[i - 1].closetomean == 1 && data[i - 1].currSigma > Math.abs(data[i - 1].currAvg - d.value)))) {
            d.closetomean = 1;
        } else {
            d.closetomean = 0;
        }

        prevValue = d.value;

    });
    console.log(data);
    return Holding;
}

function meanSumCheck(arr, start, num) {
    var output = 0;
    if (start + num <= arr.length) {
        for (var i = 0; i < num; i++) {
            output = output + ((arr[start + i].value > arr[start + i].currAvg) ? 1 : -1);
        }
    }
    return output;
}
function revMeanSumCheck(arr, start, num) {
    var output = 0;
    if (start - num >= 0) {
        for (var i = 0; i < num; i++) {
            output = output + ((arr[start - i].value > arr[start - i].currAvg) ? 1 : -1);
        }
    }
    return output;
}
function trendSumCheck(arr, start, num) {
    var output = 0;
    if (start + num < arr.length) {
        for (var i = 0; i < num; i++) {
            var curr = arr[start + i].value;
            var next = arr[start + i + 1].value;
            var signal = 0;
            if(curr < next){
                signal = 1;
            }
            else if(curr > next){
                signal = -1;
            }

            output = output + signal;
        }
    }
    return output;
}
function revTrendSumCheck(arr, start, num) {
    var output = 0;
    if (start + num < arr.length) {
        for (var i = 0; i < num; i++) {
            output = output + ((arr[start - i].value <= arr[start - i - 1].value) ? 1 : -1);
        }
    }
    return output;
}

function closeToMean(arr, start, num) {
    var output = 0;
    if (start + num < arr.length) {
        for (var i = 0; i < num; i++) {
            output = output + ((Math.abs(arr[start + i].value - arr[start + i].currAvg) <= arr[start + i].currSigma) ? 1 : -1);
        }
    }
    return output;

}
function nearUCLCheck(arr,start,num)
{
    var output = 0;
    var abovemean = 0;
    if (start + num <= arr.length) {
        for (var i = 0; i < num; i++) {
            output = output + ((arr[start + i].value >= 2 * arr[start + i].currSigma + arr[start + i].currAvg ) ? 1 : 0);
            abovemean = abovemean + ((arr[start + i].value >= arr[start + i].currAvg) ? 1 : 0);
        }
        if (output >= 2 && abovemean == 3) {
            for (var i = 0; i < num; i++) {
                if (arr[start + i].value >= (2 * arr[start + i].currSigma + arr[start + i].currAvg) ) {
                    arr[start + i].nearUCLCheck = 1;
                }

            }
        }

    }
    return output;
}
function nearLCLCheck(arr,start,num)
{
    var output = 0;
    var belowmean = 0;
    if (start + num <= arr.length) {
        for (var i = 0; i < num; i++) {
            output = output + ((arr[start + i].value <= -2 * arr[start + i].currSigma + arr[start + i].currAvg ) ? 1 : 0);
            belowmean = belowmean + ((arr[start + i].value <= arr[start + i].currAvg) ? 1 : 0);
        }
        if (output >= 2 && belowmean == 3) {
            for (var i = 0; i < num; i++) {
                if (arr[start + i].value <= (-2 * arr[start + i].currSigma + arr[start + i].currAvg) ) {
                    arr[start + i].nearLCLCheck = 1;
                }

            }
        }

    }
    return output;
}



//from Brian Boden's d3 stacked area
function dateFromQlikNumber(n) {
    var d = new Date((n - 25569) * 86400 * 1000);
    // since date was created in UTC shift it to the local timezone
    d.setTime(d.getTime() + d.getTimezoneOffset() * 60 * 1000);
    return d;
}

function getFields(input, field) {
    var output = [];
    for (var i = 0; i < input.length; ++i)
        output.push(input[i][field]);
    return output;
}
function posiCheck(higherbetter, d) {
    if ((d.asctrendcheck == 1 && higherbetter == true) || (d.desctrendcheck == 1 && higherbetter == false)) {
        return "Positive";

    }
    if ((d.asctrendcheck == 1 && higherbetter == false) || (d.desctrendcheck == 1 && higherbetter == true)) {
        return "Negative";

    }
    if ((d.check == 1 && higherbetter == true) || (d.check == -1 && higherbetter == false) || (d.value > d.currUCL && higherbetter == true) || (d.value < d.currLCL && higherbetter == false)) {
        return "Positive";

    }
    if ((d.check == 1 && higherbetter == false) || (d.check == -1 && higherbetter == true) || (d.value > d.currUCL && higherbetter == false) || (d.value < d.currLCL && higherbetter == true)) {
        return "Negative";

    }

    if ((d.check == 1 && higherbetter == 2) || (d.check == -1 && higherbetter == 2) || (d.value > d.currUCL && higherbetter == 2) || (d.value < d.currLCL && higherbetter == 2) || (d.asctrendcheck == 1 && higherbetter == 2) || (d.desctrendcheck == 1 && higherbetter == 2) || (d.nearLCLCheck == 1 && higherbetter == 2) || (d.nearUCLCheck == 1 && higherbetter == 2)) {
        return "Purple";

    }
    if ((d.nearLCLCheck == 1 && higherbetter == false) || d.nearUCLCheck == 1 && higherbetter == true) {
        return "Positive";
    }
    if ((d.nearLCLCheck == 1 && higherbetter == true) || d.nearUCLCheck == 1 && higherbetter == false) {
        return "Negative";
    }
    if ( (d.value > d.currUCL && higherbetter == true) || (d.value < d.currLCL && higherbetter == false)) {
        return "Positive";

    }
    if ( (d.value > d.currUCL && higherbetter == false) || (d.value < d.currLCL && higherbetter == true)) {
        return "Negative";

    }
    return "None";

}
