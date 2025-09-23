define(["qlik", "jquery", "./d3.min", "./SPCArrayFunctions", "text!./style.css"], function (qlik, $, d3) {
    //'use strict';
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
            var modal = d3.select("#" + id).append("div")
                .attr('id', 'ScorecardModal')
                .attr("class", "ScorecardModal")
                ;
            var qMatrix = fullData.filter(function (f) {
                return f[1].qNum != 'NaN' && f[8].qNum != 'NaN';
            });

            if (numMeasure == 7) {
                var data = qMatrix
                    .map(function (d) {
                        return {
                            "Metric": d[0].qText,
                            "Date": d[1].qNum,
                            "dim": d[1].qNum,
                            "TargetValue": d[2].qNum,
                            "isHigherGood": d[3].qNum,
                            "calcpoints": d[4].qNum,
                            "HasTarget": d[5].qNum,
                            "ShowSPC": d[6].qNum,
                            "KPIOrder": d[7].qNum,
                            "value": d[8].qNum,
                            "formattedValue": d[8].qText,
                            "formattedTarget": d[2].qText,
                            "reCalcID": '',
                            "DateText": d[1].qText

                        }
                    });
            } else if (numMeasure == 8) {
                var data = qMatrix.map(function (d) {

                    return {
                        "Metric": d[0].qText,
                        "Date": d[1].qNum,
                        "dim": d[1].qNum,
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
                        "DateText": d[1].qText

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
            var ShowPopup = layout.ShowPopup;
            var maxOrScroll = ((NullEmptyUndefCheck(layout.maxOrScroll)) ? 'Expand' : layout.maxOrScroll);
            var showDate = ((NullEmptyUndefCheck(layout.ShowUptoDate)) ? false : layout.ShowUptoDate);
            var dateName = ((NullEmptyUndefCheck(layout.customUptoName)) ? 'Latest' : layout.customUptoName);
            var UHMBSorting = ((NullEmptyUndefCheck(layout.sortbyicon)) ? 'No' : layout.sortbyicon);
            // console.log(maxOrScroll);
            // console.log(showDate);
            // console.log(dateName);


            var innerDiv = $("<div />;").addClass("innerSC");
            innerDiv.css('background-color', BGCol);
            var topflex = $("<div />;").addClass("TopFlex");
            var bigTitle = $(`<h1>${Title}</h1>`).addClass("bigTitleSC").css('color', TitleCol);
            var subTitle = $(`<h3>${subTitle}</h3>`).addClass("subTitleSC").css('color', TitleCol);
            bigTitle.appendTo(topflex);
            subTitle.appendTo(topflex);
            topflex.appendTo(innerDiv);

            var splitArr = group(data);
            //		console.log(splitArr);

            var table = $(`<table style="${fontsize} ${font}"></table>`);
            if (maxOrScroll == 'Expand') {
                table.addClass('expandmax');
            }
            var thDateCol = '';
            if (showDate == true) {
                thDateCol = `<th>${dateName}</th>`;
            }
            var tableHeader = $(`<thead><tr style="height:35px;"><th>Metric</th>${thDateCol}<th>Target</th><th>Actual</th><th>Variation</th><th>Assurance</th></tr></thead>`);
            tableHeader.appendTo(table);
            var tableBody = $(`<tbody></tbody>`);
            var arrayIterator = 0;
            for (const [key, value] of Object.entries(splitArr)) {
                value.sort(function (a, b) {
                    return a.Date - b.Date
                });
                // 			console.log(`${key} latest: ${value[value.length-1].value}`);
                var $tableRow = $("<tr />");

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
                if (value[value.length - 1].HasTarget == 1) {
                    var targetentry = value[value.length - 1].formattedTarget;
                    //			var taricon = `<img src = "/extensions/${extName}/${SPCIcons[1].filename}" width="${spcsize}">`;

                } else {
                    var targetentry = 'N/A';
                    var taricon = '';
                }
                //add in section to check length of split data array
                var tdDateCol = '';
                if (showDate == true) {
                    tdDateCol = `<td>${value[value.length - 1].DateText}</td>`;
                }
                if (value.length >= 15) {


                    if (value[value.length - 1].value < value[value.length - 2].value) {
                        var direction = "&#9660;";

                    } else if (value[value.length - 1].value > value[value.length - 2].value) {
                        var direction = "&#9650;";
                    } else {
                        var direction = "&#9664;&#9654;";
                    }
                    var SPCIcons = getSPCSymbols(value, layout.ExtraAssurance);

                    var taricon = `<img src = "/extensions/${extName}/${SPCIcons[1].filename}" width="${spcsize}" title= "${SPCIcons[1].description}">`;



                    var imgclick = '';
                    if (value[value.length - 1].ShowSPC != 1) {
                        imgclick = '_null';
                    }

                    var varicon = `<img id="${id}_${arrayIterator}" src = "/extensions/${extName}/${SPCIcons[0].filename}" width="${spcsize}" title= "${SPCIcons[0].description}" class="VarIcon${imgclick}" iterno = "${arrayIterator}">`;
                    //	}
                    //	else{
                    //		var varicon = '';
                    //		var taricon = '';
                    //	}



                    var $tableRowContent = $(`<td>${key}</td>${tdDateCol}<td style="text-align:center;">${targetentry}</td><td style="color:${targetCol};text-align:center;">${value[value.length - 1].formattedValue}</td><td style="text-align:center;">${varicon}</td><td style="text-align:center;">${taricon}</td>`);
                    if (ShowPopup == true) {
                        var SVGheight = Math.min(300, height * 0.8);
                        var chartSVG = modal
                            .append("div")
                            .attr("class", "svgcontainer")
                            .style("width", "100%")
                            .attr("id", `svgc_${arrayIterator}`)
                            .append("svg")
                            .attr("width", "100%")
                            .attr("height", SVGheight)
                            ;


                        BuildXMR(value, width, SVGheight - 50, chartSVG);
                    }

                } else {
                    var $tableRowContent = $(`<td>${key}</td>${tdDateCol}<td style="text-align:center;">${targetentry}</td><td style="color:${targetCol};text-align:center;">${value[value.length - 1].formattedValue}</td><td colspan="2" style="text-align:center;">Not Enough Data for SPC</td>`);
                }
                var rowSort;
                if (value.length < 15) {
                    rowSort = 0;
                } else if (SPCIcons[0].colour == 'orange' && SPCIcons[1].colour == 'orange') {
                    rowSort = 12;
                }
                else if (SPCIcons[0].colour == 'orange' || SPCIcons[1].colour == 'orange') {
                    rowSort = 10;
                } else if (SPCIcons[0].colour == 'grey' && SPCIcons[1].colour == 'grey') {
                    rowSort = 5;
                } else if (SPCIcons[0].colour == 'blue' && SPCIcons[1].colour == 'blue') {
                    rowSort = 2;
                }
                else if (SPCIcons[0].colour == 'blue' || SPCIcons[1].colour == 'blue') {
                    rowSort = 3;
                } else if (SPCIcons[0].colour == 'white' || SPCIcons[1].colour == 'white') {
                    rowSort = 1;
                }
                $tableRow.attr("data-UHMBsorting", rowSort);
                $tableRowContent.appendTo($tableRow);
                $tableRow.appendTo(tableBody);



                arrayIterator = arrayIterator + 1;

            }
            tableBody.appendTo(table);
            if (UHMBSorting == 'Yes') {
                //convert the jquery object to text for the function to convert to DOM object
                var tableString = table[0].outerHTML;
                tableString = sortTableHtmlStringByDataAttribute(tableString, 'uhmbsorting', false);
                //recreate the jquery object with the outputted html string
                table = $(`${tableString}`);

            }


            var tablecont = $(`<div />;`).addClass("tableCont");
            table.appendTo(tablecont);
            tablecont.appendTo(innerDiv);
            innerDiv.prependTo(maincontainer);

            if (ShowPopup == true) {


                $(`#${id} .VarIcon`).click(function () {
                    // modal.transition()
                    // .duration(500)
                    // .style("opacity", 0.95);
                    $(`#${id} .ScorecardModal`).show();

                    $(`#${id} .svgcontainer`).hide();
                    //console.log($(this).attr('iterno'));
                    $(`#${id} #svgc_${$(this).attr('iterno')}`).show();
                });

                $(`#${id} .ScorecardModal`).children().click(function () {
                    // modal.transition()
                    // .duration(500)
                    // .style("opacity", 0);
                    $(`#${id} .ScorecardModal`).hide();
                });
            }

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
    function getSPCSymbols(data, extraAssurance) {
        var targetvalue = data[data.length - 1].TargetValue;
        var higherbetter = ((data[data.length - 1].isHigherGood == 1) ? true : false);
        var calcPoints = data[data.length - 1].calcpoints;
        var showSPC = data[data.length - 1].ShowSPC;
        var runlength = 7;
        var trendlength = 7;
        var x = processDataArray(data, runlength, trendlength, true, calcPoints, 15, true);


        var specvaricon = [{
            filename: "speccausehighimp.png",
            description: "Special cause variation - improvement  (indicator where high is good)",
            colour: 'blue'
        }, {
            filename: "speccausehighconc.png",
            description: "Special cause variation - cause for concern (indicator where high is a concern)",
            colour: 'orange'
        }, {
            filename: "speccauselowconc.png",
            description: "Special cause variation - cause for concern (indicator where low is a concern)",
            colour: 'orange'
        }, {
            filename: "speccauselowimp.png",
            description: "Special cause variation - improvement  (indicator where low is good)",
            colour: 'blue'
        }, {
            filename: "comcause.png",
            description: "Common cause variation",
            colour: 'grey'
        }, {
            filename: "noSPC.png",
            description: "N/A",
            colour: 'white'
        }
        ];

        var specindex;
        if (showSPC == 0) {
            specindex = 5;
        } else if (data[data.length - 1].asctrendcheck == 1 && higherbetter == true) {
            specindex = 0;
        } else if (data[data.length - 1].desctrendcheck == 1 && higherbetter == false) {
            specindex = 3;
        } else if (data[data.length - 1].asctrendcheck == 1 && higherbetter == false) {
            specindex = 1;
        } else if (data[data.length - 1].desctrendcheck == 1 && higherbetter == true) {
            specindex = 2;
        } else if ((data[data.length - 1].check == 1 && higherbetter == true)) {
            specindex = 0;
        } else if ((data[data.length - 1].check == -1 && higherbetter == false)) {
            specindex = 3;
        } else if ((data[data.length - 1].check == 1 && higherbetter == false)) {
            specindex = 1;
        } else if ((data[data.length - 1].check == -1 && higherbetter == true)) {
            specindex = 2;
        } else if (data[data.length - 1].nearUCLCheck == 1 && higherbetter == true) {
            specindex = 0;
        } else if (data[data.length - 1].nearLCLCheck == 1 && higherbetter == true) {
            specindex = 2;
        } else if (data[data.length - 1].nearLCLCheck == 1 && higherbetter == false) {
            specindex = 3;
        } else if (data[data.length - 1].nearUCLCheck == 1 && higherbetter == false) {
            specindex = 1;
        } else if ((data[data.length - 1].value > data[data.length - 1].currUCL && higherbetter == true)) {
            specindex = 0;
        } else if ((data[data.length - 1].value < data[data.length - 1].currLCL && higherbetter == false)) {
            specindex = 3;
        } else if ((data[data.length - 1].value > data[data.length - 1].currUCL && higherbetter == false)) {
            specindex = 1;
        } else if ((data[data.length - 1].value < data[data.length - 1].currLCL && higherbetter == true)) {
            specindex = 2;
        }

        else {
            specindex = 4;
        }
        //console.log(specindex);
        //console.log(data[data.length - 1]);

        // if (showSPC == 0) {
        //     specindex = 5;
        // } else if ((data[data.length - 1].check == 1 && higherbetter == true) || (data[data.length - 1].value > data[data.length - 1].currUCL && higherbetter == true)) {
        //     specindex = 0;
        // } else if ((data[data.length - 1].check == -1 && higherbetter == false) || (data[data.length - 1].value < data[data.length - 1].currLCL && higherbetter == false)) {
        //     specindex = 3;
        // } else if ((data[data.length - 1].check == 1 && higherbetter == false) || (data[data.length - 1].value > data[data.length - 1].currUCL && higherbetter == false)) {
        //     specindex = 1;
        // } else if ((data[data.length - 1].check == -1 && higherbetter == true) || (data[data.length - 1].value < data[data.length - 1].currLCL && higherbetter == true)) {
        //     specindex = 2;
        // } else if (data[data.length - 1].asctrendcheck == 1 && higherbetter == true) {
        //     specindex = 0;
        // } else if (data[data.length - 1].asctrendcheck == -1 && higherbetter == false) {
        //     specindex = 3;
        // } else if (data[data.length - 1].asctrendcheck == 1 && higherbetter == false) {
        //     specindex = 1;
        // } else if (data[data.length - 1].asctrendcheck == -1 && higherbetter == true) {
        //     specindex = 2;
        // } else if (data[data.length - 1].nearUCLCheck == 1 && higherbetter == true) {
        //     specindex = 0;
        // } else if (data[data.length - 1].nearLCLCheck == 1 && higherbetter == true) {
        //     specindex = 2;
        // } else if (data[data.length - 1].nearLCLCheck == 1 && higherbetter == false) {
        //     specindex = 3;
        // } else if (data[data.length - 1].nearUCLCheck == 1 && higherbetter == false) {
        //     specindex = 1;
        // } else {
        //     specindex = 4;
        // }

        var targeticon = [{
            filename: "consfail.png",
            description: "The system is expected to consistently fail the target",
            colour: 'orange'
        }, {
            filename: "conspass.png",
            description: "The system is expected to consistently pass the target",
            colour: 'blue'
        }, {
            filename: "randvar.png",
            description: "The system may achieve or fail the target subject to random variation",
            colour: 'grey'
        }, {
            filename: "noSPC.png",
            description: "N/A",
            colour: 'white'
        }, {
            filename: "recentpass.png",
            description: "Metric has (P)assed the target for the last 6 (or more) data points, but the control limits have not moved above/below the target",
            colour: 'blue'
        }, {
            filename: "recentfail.png",
            description: "Metric has (F)ailed the target for the last 6 (or more) data points, but the control limits have not moved above/below the target",
            colour: 'orange'
        }
        ];

        var recentCount = 0;
        for (var q = 1; q <= 6; q++) {
            if ((higherbetter == true && data[data.length - q].value >= targetvalue) || (higherbetter == false && data[data.length - q].value <= targetvalue)) {
                recentCount++;
            } else if ((higherbetter == true && data[data.length - q].value < targetvalue) || (higherbetter == false && data[data.length - q].value > targetvalue)) {
                recentCount--;
            }
        }

        var targetindex;
        if (showSPC == 0) {
            targetindex = 3;
        } else if ((higherbetter == true && data[data.length - 1].currLCL >= targetvalue) || (higherbetter == false && data[data.length - 1].currUCL <= targetvalue)) {
            targetindex = 1;
        } else if ((higherbetter == true && data[data.length - 1].currUCL < targetvalue) || (higherbetter == false && data[data.length - 1].currLCL > targetvalue)) {
            targetindex = 0;
        } else if (recentCount == 6 && extraAssurance == 1) {
            targetindex = 4;
        } else if (recentCount == -6 && extraAssurance == 1) {
            targetindex = 5;
        }

        else {
            targetindex = 2;
        }

        var output = [specvaricon[specindex], targeticon[targetindex]];

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

            // console.log(numRows);
            // console.log(TempData);
        }
        return Promise.all(TempData);
    }
    function NullEmptyUndefCheck(value) {
        return value === undefined || value === null || value === '';
    }

    function BuildXMR(data, w, h, svg) {


        var higherbetternum = data[0].isHigherGood;
        var higherbetter;
        if (higherbetternum == 0) {
            higherbetter = false;
        }
        else if (higherbetternum == 1) {
            higherbetter = true;
        }
        else {
            higherbetter = higherbetternum;
        }
        var width = w - 70, height = h - 10;
        var x = d3.scaleTime().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);

        var limitpadding = (d3.max(data, function (d) {
            return d.currUCL;
        }) - d3.min(data, function (d) {
            return d.currAvg;
        })) * 0.1; // figure to pad the limits of the y-axis

        var uppery = Math.max(d3.max(data, function (d) {
            return d.currUCL;
        }), d3.max(data, function (d) {
            return d.value;
        })
        ) + limitpadding;
        var lowery = Math.min(d3.min(data, function (d) {
            return d.currLCL;
        }), d3.min(data, function (d) {
            return d.value;
        })) - limitpadding;

        if (data[0].HasTarget == 1) {
            uppery = Math.max(uppery, data[0].TargetValue);
            lowery = Math.min(lowery, data[0].TargetValue);
        }

        var valueline = d3.line()
            .x(function (d) {
                return x(d.dim);
            })
            .y(function (d) {
                return y(d.value);
            });
        var avgline = d3.line()
            .x(function (d) {
                return x(d.dim);
            })
            .y(function (d) {
                return y(d.currAvg);
            });
        var UCLline = d3.line()
            .x(function (d) {
                return x(d.dim);
            })
            .y(function (d) {
                return y(d.currUCL);
            });
        var LCLline = d3.line()
            .x(function (d) {
                return x(d.dim);
            })
            .y(function (d) {
                return y(d.currLCL);
            });
        var targetline = d3.line()
            .x(function (d) {
                return x(d.dim);
            })
            .y(function (d) {
                return y(d.TargetValue);
            });

        x.domain(d3.extent(data, function (d) {
            return d.dim;
        }));
        y.domain([Math.min(lowery, d3.min(data, function (d) {
            return d.value;
        })), Math.max(d3.max(data, function (d) {
            return d.value;
        }), uppery)]);

        //horrible hacky way to truncate title lengths
        var svgtitle = data[0].Metric;
        if (svgtitle.length * 6.5 > width) {
            svgtitle = svgtitle.substring(0, Math.floor(width / 6.5)) + '...';
        }

        svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .style("fill", "white");
        svg.append("text").text(`${svgtitle}`)
            .style("fill", "black")
            .attr("x", 10).attr("y", 20);
        var g = svg.append("g")
            .attr("alignment-baseline", "central")
            .attr("transform", "translate(30,30)")
            ;

        g.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", valueline)
            ;
        g.append("path")
            .data([data])
            .attr("class", "CLline")
            .attr("d", UCLline);
        g.append("path")
            .data([data])
            .attr("class", "CLline")
            .attr("d", LCLline);
        g.append("path")
            .data([data])
            .attr("class", "avgline")
            .attr("d", avgline);
        if (data[0].HasTarget == 1) {
            g.append("path")
                .data([data])
                .attr("class", "targetline")
                .attr("d", targetline);
        }

        g.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .classed("positive", function (d) {
                if (posiCheck(higherbetternum, d) == "Positive" && higherbetternum < 2) {
                    return true;
                }
                return false;
            })
            .classed("negative", function (d) {
                if (posiCheck(higherbetternum, d) == "Negative" && higherbetternum < 2) {
                    return true;
                }
                return false;
            })
            .classed("purple", function (d) {
                if (posiCheck(higherbetternum, d) == "Purple" && higherbetternum > 1) {
                    return true;
                }
                return false;
            })
            .attr("cx", valueline.x())
            .attr("cy", valueline.y())
            .attr("r", 3.5)
            ;


    }

});


function sortTableHtmlStringByDataAttribute(htmlString, dataAttribute, ascending = true) {
    //probably a better way of doing this but not looked at most of this since it was written
    // Create a template and parse the HTML string
    const template = document.createElement('template');
    template.innerHTML = htmlString.trim();

    // Find the first table element anywhere in the fragment
    const table = template.content.querySelector('table');
    if (!table) throw new Error('No <table> found in the HTML string.');

    // Use the first <tbody> if present, otherwise the table itself
    const tbody = table.querySelector('tbody') || table;
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        const aValue = a.dataset[dataAttribute];
        const bValue = b.dataset[dataAttribute];
        const aParsed = isNaN(aValue) ? aValue : parseFloat(aValue);
        const bParsed = isNaN(bValue) ? bValue : parseFloat(bValue);

        if (aParsed < bParsed) return ascending ? -1 : 1;
        if (aParsed > bParsed) return ascending ? 1 : -1;
        return 0;
    });

    // Remove old rows and append sorted rows
    rows.forEach(row => tbody.appendChild(row));

    // Return the sorted table as a string
    return table.outerHTML;
}

