define(['./getMasterItems', './getAppSheets', './getDimensions', './d3.min'], function (getMasterItems, getAppSheets, getDimensions, d3) {
	return {
		type: "items",
		component: "accordion",
		items: {
			dimensions: {
				uses: "dimensions",
				min: 2,
				max: 2
			},
			measures: {
				uses: "measures",
				min: 7,
				max: 8
			},
			settings: {
				uses: "settings"
			},

			CustomProperties: {
				component: "expandable-items",
				label: "Scorecard Properties",
				items: {
					Formatting: {
						type: "items",
						label: "Options",
						items: {
							Title: {
								type: "string",
								label: "Title",
								ref: "bigTitle"


							},
							SubTitle: {
								type: "string",
								label: "Subtitle",
								ref: "subTitle"


							},
							TitleCol: {
								label: "Title Colour",
								component: "color-picker",
								ref: "TitleCol",
								type: "object",

								defaultValue: {
									color: "#ffffff",
									index: "-1"
								}
							},
							BGCol: {
								label: "BG Colour",
								component: "color-picker",
								ref: "BGCol",
								type: "object",

								defaultValue: {
									color: "#adff2f",
									index: "-1"
								}
							},
							DefFont: {
								type: "boolean",
								label: "Use Default Font/Size",
								ref: "DefFont",
								defaultValue: true
							},
							CustomFont: {
								type: "string",
								label: "Table Font",
								ref: "customFont",
								show: function (data) {
									return !data.DefFont;
								},


							},
							CustomFontSize: {
								type: "string",
								label: "Table Font Size",
								ref: "customFontSize",
								show: function (data) {
									return !data.DefFont;
								}


							},
							SPCIconSize: {
								type: "string",
								label: "SPCSize",
								ref: "customSPCSize",
								show: function (data) {
									return !data.DefFont;
								}

							},
							ShowPopup: {
								type: "boolean",
								label: "Enable Popup on Icon Click",
								ref: "ShowPopup",
								defaultValue: false
							},
							ExtraAssurance: {
								ref: "ExtraAssurance",
								type: "string",
								label: "Show Extra Assurance Icons (0/1)",
								expression: "optional",
								defaultValue: "0"
							},
							ShowUptoDate: {
								ref: "ShowUptoDate",
								type: "boolean",
								label: "Show Upto/Latest Date Column",
								defaultValue: false
							},
							UptoDateName: {
								type: "string",
								label: "Custom Upto column name",
								ref: "customUptoName",
								show: function (data) {
									return data.ShowUptoDate;
								}
							},
							MaxOrScroll: {
								type: "string",
								component: "dropdown",
								label: "Expand/Scroll",
								ref: "maxOrScroll",
								options: [{
									value: "Expand",
									label: "Expand"
								}, {
									value: "Grow",
									label: "Grow"
								}],
								defaultValue: "Expand"
							}
						}
					}

				}
			},
			abouttxt: {
				label: "About",
				type: "items",
				items: {
					abouttxt2: {
						label: "About",
						type: "items",
						items: {
							aboutt: {
								component: "text",
								label: "UHMB ScoreCard Extension developed by Dale Wright"
							},
							about2: {
								component: "text",
								label: "Dimension Order: KPI>Date"
							},
							about3: {
								component: "text",
								label: "Measure Order: Target>Is Higher Good (1/0)?>Number of Calculation Points for SPC>Use Target(1/0)>Show SPC Icons(1/0)>Order of KPI's> Value > Recalculation ID (optional) "
							},
							about4: {
								component: "link",
								label: "GitHub for Extension",
								url: "https://github.com/DizzleWizzle/UHMB_Qlik_XMr_Scorecard"
							}
						}
					}
				}
			}
		}
	};
});
