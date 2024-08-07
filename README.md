# UHMB Qlik XMr Summary Scorecard
A Summary table for XMr calculations of multiple metrics built in house at University Hospitals of Morecambe Bay by Dale Wright.

Works on SaaS and Enterprise for Windows (as of August 2022)

### How to use:
#### Dimensions:
1. Metric Name
2. Date to use for XMr calculations

#### Measures:
1. Target Value (formatting will be respected, if you have multiple formats within metrics ensure you have the ability to use Num() with an appropriate expression for the format and use the auto option)
2. Is a Higher Value a good thing or not? Use 0 (false),1 (true),2 (neither - purple icons in MDC)
3. Number of calculation points for the SPC baseline (if baselines not needed put a massive number in here)
4. Display Target? 0 (false) 1 (true) . This also controls whether the Assurance icons appear or not
5. Show SPC Icons? 0 (false) 1 (true) . This controls whether the SPC Variation Icon displays or not
6. Metric Order. Metrics are sorted by this value
7. Value (formatting will be respected, if you have multiple formats within metrics ensure you have the ability to use Num() with an appropriate expression for the format and use the auto option)
8. (optional) Identifier for recalculation periods.  If used must be contiguous within a metric and not repeated out of sequence.
  
#### Scorecard Properties
##### Options
* Title -  Text for Title
* Subtitle -  Text for Subtitle
* Title Colour - Text Colour for the Title
* BG Colour - Colour for the background
* use default font size - if left as default font is "Source Sans Pro", sans-serif; , font size is 14px; and SPC Icon size is 30px
  * Table Font - inject css into the font-family: css property
  * Table Font Size - inject css into font-size: css property
  * SPC Icon Size - set the size of the img of SPC icon
* Enable Popup on Icon click - clicking on the Variation icon will pop up a simplified XMr chart of the metric, click the popup to dismiss
* Show Extra Assurance Icons - Set this to show additional assurance icons where a target has been hit 6 times in a row but CL's havent yet moved far enough.
* Show Upto/Latest Column - adds a column for each row showing the latest date value for that Metric (format of date follows the format provided in Dimensions)
  *  Custom Column name - this appears if you want something other than 'Latest' as the column heading
* Expand/Scroll - if set to Expand the rows will auto expand to fill the available space,then start to scroll, if set to Grow, they will be at minimum extent and the height will grow dependant on number of metrics. 

![scorecard demo](https://user-images.githubusercontent.com/111445780/223478173-7938fe72-803d-44ee-87ac-193c6c9af935.gif)
