define(["qlik", "jquery", "./d3.min","./SPCArrayFunctions", "text!./style.css"], function (qlik, $, d3) {
    'use strict';
    return function ($element, layout) {

        var numMeasure = layout.qHyperCube.qMeasureInfo.length;
        var numRows = 0;
        var dataPageHeight = 1000;
        var totalRows = this.backendApi.getRowCount();
        var TempData = [];
        this.backendApi.setCacheOptions({
            enabled: false
        });
        while (numRows < totalRows) {
            var requestPage = [{
                    qTop: 0 + numRows,
                    qLeft: 0,
                    qWidth: 10, //should be # of columns
                    qHeight: dataPageHeight //this.backendApi.getRowCount()
                }
            ];
            TempData.push(this.backendApi.getData(requestPage));
            numRows = numRows + dataPageHeight;

        }
        Promise.all(TempData).then(function (t) {

            var fullData = [];
            t.forEach((arr) => {
                fullData = fullData.concat(arr[0].qMatrix);
            });

            //		var	fullData = $.map(t, function (obj) {
            //                      return $.extend(true, {}, obj);
            //                  		});

            var width = $element.width();
            var height = $element.height();
            var id = "container_" + layout.qInfo.qId;
            if (document.getElementById(id)) {
                $("#" + id).empty().width(width).height(height);

            } else {
                try {
                    $element.append($('<div />;').attr("id", id).width(width).height(height).addClass("qv-uhmb-ScoreCard"));
                } catch (err) {
                    console.log(err);
                }

            }

            var maincontainer = document.getElementById(id);
            var qMatrix = fullData;

            if (numMeasure == 7) {
                var data = qMatrix
                    .map(function (d) {
                        return {
                            "Metric": d[0].qText,
                            "Date": d[1].qNum,
                            "TargetValue": d[2].qNum,
                            "isHigherGood": d[3].qNum,
                            "calcpoints": d[4].qNum,
                            "HasTarget": d[5].qNum,
                            "ShowSPC": d[6].qNum,
                            "KPIOrder": d[7].qNum,
                            "value": d[8].qNum,
                            "formattedValue": d[8].qText,
                            "formattedTarget": d[2].qText,
                            "reCalcID": ''

                        }
                    });
            } else if (numMeasure == 8) {
                var data = qMatrix.map(function (d) {

                    return {
                        "Metric": d[0].qText,
                        "Date": d[1].qNum,
                        "TargetValue": d[2].qNum,
                        "isHigherGood": d[3].qNum,
                        "calcpoints": d[4].qNum,
                        "HasTarget": d[5].qNum,
                        "ShowSPC": d[6].qNum,
                        "KPIOrder": d[7].qNum,
                        "value": d[8].qNum,
                        "formattedValue": d[8].qText,
                        "formattedTarget": d[2].qText,
                        "reCalcID": d[9].qText,

                    }

                });

            }

            data.sort(function (a, b) {
                return a.KPIOrder - b.KPIOrder
            });
            var extName = "UHMB_Scorecard_Recalc";
            var app = qlik.currApp();

            var Title = layout.bigTitle;
            var subTitle = layout.subTitle;

            var font = 'font-family: "Source Sans Pro", sans-serif;';
            var fontsize = 'font-size: 14px;';
            var spcsize = '30px'

                if (!layout.DefFont) {
                    font = 'font-family: ' + layout.customFont + ';';
                    fontsize = 'font-size: ' + layout.customFontSize + ';';
                    spcsize = layout.customSPCSize;

                }

                var BGCol = layout.BGCol.color;
            var TitleCol = layout.TitleCol.color;

            var innerDiv = $("<div />;").addClass("innerSC");
            innerDiv.css('background-color', BGCol);

            var bigTitle = $(`<h1>${Title}</h1>`).addClass("bigTitleSC").css('color', TitleCol);
            var subTitle = $(`<h3>${subTitle}</h3>`).addClass("subTitleSC").css('color', TitleCol);
            bigTitle.appendTo(innerDiv);
            subTitle.appendTo(innerDiv);

            var splitArr = group(data);
            //		console.log(splitArr);

            var table = $(`<table style="${fontsize} ${font}"></table>`);
            var tableHeader = $(`<tr style="height:35px;"><th>Metric</th><th>Plan</th><th>Actual</th><th>Variation</th><th>Assurance</th></tr>`);
            tableHeader.appendTo(table);

            for (const [key, value] of Object.entries(splitArr)) {
                value.sort(function (a, b) {
                    return a.Date - b.Date
                });
                // 			console.log(`${key} latest: ${value[value.length-1].value}`);
                var $tableRow = $("<tr />");
                if (value[value.length - 1].value < value[value.length - 2].value) {
                    var direction = "&#9660;";

                } else if (value[value.length - 1].value > value[value.length - 2].value) {
                    var direction = "&#9650;";
                } else {
                    var direction = "&#9664;&#9654;";
                }
                var SPCIcons = getSPCSymbols(value);

                var taricon = `<img src = "/extensions/${extName}/${SPCIcons[1].filename}" width="${spcsize}">`;

                if (value[value.length - 1].HasTarget == 1) {
                    var targetentry = value[value.length - 1].formattedTarget;
                    //			var taricon = `<img src = "/extensions/${extName}/${SPCIcons[1].filename}" width="${spcsize}">`;

                } else {
                    var targetentry = 'N/A';
                    var taricon = '';
                }
                //	if(value[value.length-1].ShowSPC == 1)
                //	{
                var varicon = '<img src = "/extensions/' + extName + '/' + SPCIcons[0].filename + '" width="' + spcsize + '">';
                //	}
                //	else{
                //		var varicon = '';
                //		var taricon = '';
                //	}

                var targetCol = '';
                if (value[value.length - 1].HasTarget == 1) {
                    if (value[value.length - 1].TargetValue < value[value.length - 1].value && value[value.length - 1].isHigherGood == 1) {
                        targetCol = 'green';
                    } else if (value[value.length - 1].TargetValue > value[value.length - 1].value && value[value.length - 1].isHigherGood == 0) {
                        targetCol = 'green';
                    } else {
                        targetCol = 'red';
                    }
                }

                var $tableRowContent = $(`<td>${key}</td><td style="text-align:center;">${targetentry}</td><td style="color:${targetCol};text-align:center;">${value[value.length-1].formattedValue}</td><td style="text-align:center;">${varicon}</td><td style="text-align:center;">${taricon}</td>`);
                $tableRowContent.appendTo($tableRow);
                $tableRow.appendTo(table);

            }
            var tablecont = $(`<div />;`).addClass("tableCont");
            table.appendTo(tablecont);
            tablecont.appendTo(innerDiv);
            innerDiv.appendTo(maincontainer);

            return qlik.Promise.resolve(); //needed for export

        });

    }
    function group(arr) {
        return arr.reduce(function (res, obj) { // for each object obj in the array arr
            var key = obj.Metric; // let key be the Metric
            var newObj = obj; // create a new object based on the object obj
            if (res[key]) // if res has a sub-array for the current key then...
                res[key].push(newObj); // ... push newObj into that sub-array
            else // otherwise...
                res[key] = [newObj]; // ... create a new sub-array for this key that initially contain newObj
            return res;
        }, {});
    }
    function getSPCSymbols(data) {
        var targetvalue = data[data.length - 1].TargetValue;
        var higherbetter = ((data[data.length - 1].isHigherGood == 1) ? true : false);
        var calcPoints = data[data.length - 1].calcpoints;
        var showSPC = data[data.length - 1].ShowSPC;
        var runlength = 7;
        var trendlength = 7;
        var x = processDataArray(data,runlength,trendlength,true,calcPoints,15,true);
        // if (calcPoints > data.length) {
        //     calcPoints = data.length;
        // }

        // var initData = JSON.parse(JSON.stringify(data));
        // initData.length = calcPoints;

        // //calculate Moving range on trimmed dataset
        // initData.forEach(function (d, i) {
        //     d.value = d.value;
        //     if (i > 0) {
        //         d.MR = Math.abs(d.value - data[i - 1].value);
        //     }
        // });

        // var unique = [...new Set(data.map(item => item.reCalcID))];
        // var Holding = [];
        // unique.forEach((ID) => {
        //     var temp = data.filter(x => x.reCalcID == ID);
        //     Holding.push(temp);
        //     temp = null;
        // });

        // Holding.forEach((group) => {
        //     var trimmed = JSON.parse(JSON.stringify(group));
        //     if (trimmed.length >= calcPoints && calcPoints > 0) {
        //         trimmed.length = calcPoints;
        //     }

        //     trimmed.forEach(function (d, i) {
        //         //d.dim = dateFromQlikNumber(d.dim);
        //         //d.value = d.value;
        //         if (i > 0) {
        //             d.MR = Math.abs(d.value - trimmed[i - 1].value);
        //         }
        //     });
        //     var xAvg = d3.mean(getFields(trimmed, "value"));
        //     var xMR = d3.mean(getFields(trimmed, "MR"));
        //     var xUCL = (xMR / 1.128 * 3) + xAvg;
        //     var xLCL = xAvg - (xMR / 1.128 * 3);
        //     //				if (clunderzero == false){
        //     //					if(xLCL < 0){
        //     //						xLCL = 0;
        //     //					}
        //     //				}
        //     var xSigma = xMR / 1.128;

        //     group.forEach((row) => {
        //         row.currAvg = xAvg;
        //         row.currUCL = xUCL;
        //         row.currLCL = xLCL;
        //         row.currSigma = xSigma;
        //     });

        // });

        // try {
        //     var myAvg = d3.mean(getFields(initData, "value")); //i => i.value);
        // } catch (err) {
        //     console.log(err);
        // }

        // /*		var mySD = d3.deviation(getFields(initData,"value"));//i => i.value);
        // var myMR = d3.mean(getFields(initData,"MR"));//i => i.MR);
        // var myUCL = (myMR/1.128*3) + myAvg;
        // var myLCL = myAvg - (myMR/1.128*3);
        // var mySigma = myMR/1.128;
        //  */
        
        // var prevValue;
        // try {
        //     data.forEach(function (d, i) {
        //         d.dim = dateFromQlikNumber(d.dim);
        //         d.value = d.value;
        //         if (i > 0) {
        //             d.MR = d.value - data[i - 1].value;
        //         }
        //         var meansum = meanSumCheck(data, i, runlength);
        //         var revmeansum = revMeanSumCheck(data, i, runlength);
        //         var trendsum = trendSumCheck(data, i, trendlength - 1);
        //         var closetomean = closeToMean(data, i, 15);
        //         if (meansum == runlength || revmeansum == runlength || ((i > 0) && (data[i - 1].check == 1 && d.value > d.currAvg))) {
        //             d.check = 1;
        //         } else if (meansum == -runlength || revmeansum == -runlength || ((i > 0) && (data[i - 1].check == -1 && d.value < d.currAvg))) {
        //             d.check = -1;
        //         } else {
        //             d.check = 0;
        //         }
        //         if (trendsum >= (trendlength - 1) || ((i > 0) && (data[i - 1].asctrendcheck == 1 && d.value > data[i - 1].value))) {
        //             d.asctrendcheck = 1;
        //         } else {
        //             d.asctrendcheck = 0;
        //         }
        //         if (trendsum <= -1 * (trendlength - 1) || ((i > 0) && (data[i - 1].desctrendcheck == 1 && d.value < data[i - 1].value))) {
        //             d.desctrendcheck = 1;
        //         } else {
        //             d.desctrendcheck = 0;
        //         }
        //         if (closetomean == 15 || ((i > 0) && (data[i - 1].closetomean == 1 && data[i - 1].currSigma > Math.abs(data[i - 1].currAvg - d.value)))) {
        //             d.closetomean = 1;
        //         } else {
        //             d.closetomean = 0;
        //         }

        //         prevValue = d.value;

        //     });
        // } catch (err) {
        //     console.log(err);
        // }

        var specvaricon = [{
                filename: "speccausehighimp.png",
                description: "Special cause variation - improvement  (indicator where high is good)"
            }, {
                filename: "speccausehighconc.png",
                description: "Special cause variation - cause for concern (indicator where high is a concern)"
            }, {
                filename: "speccauselowconc.png",
                description: "Special cause variation - cause for concern (indicator where low is a concern)"
            }, {
                filename: "speccauselowimp.png",
                description: "Special cause variation - improvement  (indicator where low is good)"
            }, {
                filename: "comcause.png",
                description: "Common cause variation"
            }, {
                filename: "noSPC.png",
                description: "N/A"
            }
        ];

        var specindex;

        if (showSPC == 0) {
            specindex = 5;
        } else if ((data[data.length - 1].check == 1 && higherbetter == true) || (data[data.length - 1].value > data[data.length - 1].currUCL && higherbetter == true)) {
            specindex = 0;
        } else if ((data[data.length - 1].check == -1 && higherbetter == false) || (data[data.length - 1].value < data[data.length - 1].currLCL && higherbetter == false)) {
            specindex = 3;
        } else if ((data[data.length - 1].check == 1 && higherbetter == false) || (data[data.length - 1].value > data[data.length - 1].currUCL && higherbetter == false)) {
            specindex = 1;
        } else if ((data[data.length - 1].check == -1 && higherbetter == true) || (data[data.length - 1].value < data[data.length - 1].currLCL && higherbetter == true)) {
            specindex = 2;
        } else if (data[data.length - 1].asctrendcheck == 1 && higherbetter == true) {
            specindex = 0;
        } else if (data[data.length - 1].asctrendcheck == -1 && higherbetter == false) {
            specindex = 3;
        } else if (data[data.length - 1].asctrendcheck == 1 && higherbetter == false) {
            specindex = 1;
        } else if (data[data.length - 1].asctrendcheck == -1 && higherbetter == true) {
            specindex = 2;
        } else if (data[data.length - 1].nearUCLCheck == 1 && higherbetter == true) {
            specindex = 0;
        } else if (data[data.length - 1].nearLCLCheck == 1 && higherbetter == true) {
            specindex = 2;
        } else if (data[data.length - 1].nearLCLCheck == 1 && higherbetter == false) {
            specindex = 3;
        } else if (data[data.length - 1].nearUCLCheck == 1 && higherbetter == false) {
            specindex = 1;
        } else {
            specindex = 4;
        }

        var targeticon = [{
                filename: "consfail.png",
                description: "The system is expected to consistently fail the target"
            }, {
                filename: "conspass.png",
                description: "The system is expected to consistently pass the target"
            }, {
                filename: "randvar.png",
                description: "The system may achieve or fail the target subject to random variation"
            }, {
                filename: "noSPC.png",
                description: "N/A"
            }
        ];

        var targetindex;
        if (showSPC == 0) {
            targetindex = 3;
        } else if ((higherbetter == true && data[data.length - 1].currLCL > targetvalue) || (higherbetter == false && data[data.length - 1].currUCL < targetvalue)) {
            targetindex = 1;
        } else if ((higherbetter == true && data[data.length - 1].currUCL < targetvalue) || (higherbetter == false && data[data.length - 1].currLCL > targetvalue)) {
            targetindex = 0;
        } else {
            targetindex = 2;
        }

        var output = [specvaricon[specindex], targeticon[targetindex]];

        return output;

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
                var signal = ((curr <= next) ? 1 : -1);
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
        var output = 0
        if (start + num <= arr.length) {
            for (var i = 0; i < num; i++) {
                output = output + ((arr[start + i].value  >= 2*arr[start + i].currSigma + arr[start + i].currAvg ) ? 1 : 0);
            }
            if(output>=2){
                for (var i = 0; i < num; i++) {
                    if(arr[start + i].value>= (2*arr[start + i].currSigma + arr[start + i].currAvg)){
                        arr[start + i].nearUCLCheck = 1;
                    }
                    
                }  
            }
        
        }
        return output;
    }
    function nearLCLCheck(arr,start,num)
    {
        var output = 0
        if (start + num <= arr.length) {
            for (var i = 0; i < num; i++) {
                output = output + ((arr[start + i].value  <= -2*arr[start + i].currSigma + arr[start + i].currAvg ) ? 1 : 0);
            }
            if(output>=2){
                for (var i = 0; i < num; i++) {
                    if(arr[start + i].value<= (-2*arr[start + i].currSigma + arr[start + i].currAvg)){
                        arr[start + i].nearLCLCheck = 1;
                    }
                    
                }  
            }
        
        }
        return output;
    }

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
    function GetAllData(tr) {
        var numRows = 0;
        var dataPageHeight = 1000;
        var totalRows = tr;
        var TempData = [];
        while (numRows < totalRows) {
            var requestPage = [{
                    qTop: 1 + numRows,
                    qLeft: 0,
                    qWidth: 10, //should be # of columns
                    qHeight: dataPageHeight //this.backendApi.getRowCount()
                }
            ];
            this.backendApi.getData(requestPage).then(function (dataPages) {
                TempData.push(dataPages);
                console.log(dataPages);
            });
            numRows = numRows + dataPageHeight;

            console.log(numRows);
            console.log(TempData);
        }
        return Promise.all(TempData);
    }

});
