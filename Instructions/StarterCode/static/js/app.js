// Function to insert metadata
function buildMetadata(sample) {
    d3.json("samples.json").then((data) => {
        var metadata = data.metadata;
        // Filter the data for the object with the desired sample number
        var resultArray = metadata.filter(sampleObject => sampleObject.id == sample);
        var result = resultArray[0];
        // Use d3 to select the panel with id of 'inputID'
        var PANEL = d3.select("#sample-metadata");

        // Use '.html("") to clear any existing metadata
        PANEL.html("");
        
        // Use 'Object.entries' to add each key and value pair to the panel
        Object.entries(result).forEach(([key, value]) => {
            PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
        });

        // BONUS: Build the Gauge Chart
        buildGauge(result.wfreq);
    });
}

// Function to plot charts
function buildCharts(sample) {
    d3.json("samples.json").then((data) => {
        // Metadata
        var samples = data.samples;
        var resultArray = samples.filter(sampleObject => sampleObject.id == sample);
        var result = resultArray[0];
        
        var otuIds = result.otu_ids;
        var otuLabels = result.otu_labels;
        var sampleData = result.sample_values;
        
        // Build a Bubble Chart
        var bubbleLayout = {
            title: "Bacteria Cultures Per Sample",
            margin: {t:0},
            hovermode: "closest",
            xaxis: {title: "OTU ID"},
            margin: {t:30}
        };
        var trace2 = [
            {
                x: otuIds,
                y: sampleData,
                text: otuLabels,
                mode: 'markers',
                marker: {
                    size: sampleData,
                    color: otuIds,
                    colorscale: [
                        [0, 'rgb(0,180,255)'],
                        [0.5, 'rgb(0,255,50)'],
                        [1, 'rgb(255, 50, 0)']]
                }
            }
        ];

        Plotly.newPlot("bubble", trace2, bubbleLayout);

        // Bar Chart
        var yticks = otuIds.slice(0, 10).map(otuID => `OTU ${otuID}`).reverse();
        var trace1 = [
            {
                y: yticks,
                x: sampleData.slice(0, 10).reverse(),
                text: otuLabels.slice(0,10).reverse(),
                type: "bar",
                orientation: "h"
            }
        ];
        var barLayout = {
            title: "Top 10 Bacteria Cultures Found",
            margin: {t:30, l:150}
        };

        Plotly.newPlot("bar", trace1, barLayout);
    });
}

function init() {
    // Grab a reference to the dropdown select element
    var selection = d3.select("#selDataset");
    // Use the list of sample names to populate the select options
    d3.json("samples.json").then((data) => {
        var dropItems = data.names;
        
        console.log(dropItems);
        dropItems.forEach((item) => {
        selection.append('option').text(item).property("value", item);
        });

    // Use the first sample from the list to build the initial plots
    var firstSample = dropItems[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
    });
}

function optionChanged(newSample) {
    // Fetch new data each time a new sample is selected
    buildCharts(newSample);
    buildMetadata(newSample);
}

function buildGauge(wfreq) {
    // Enter the washing frequency between 0 and 180
    var level = parseFloat(wfreq) * 20;

    var trace3 = [
        {
            domain: {x:[0,1], y:[0,1]},
            value: wfreq,
            title: "Scrubs per Week",
            type: 'indicator',
            mode: 'gauge+number',
            gauge: {
                axis: {range: [null, 9], tickwidth: 2, tickmode: "linear"},
                bar: {color: 'darkblue'},
                steps: 
                    [
                        {range:[0,1], color:'rgb(105,255,200)'},
                        {range:[1,2], color:'rgb(120,255,180)'},
                        {range:[2,3], color:'rgb(127,255,160)'},
                        {range:[3,4], color:'rgb(154,255,140)'},
                        {range:[4,5], color:'rgb(202,255,120)'},
                        {range:[5,6], color:'rgb(209,255,100)'},
                        {range:[6,7], color:'rgb(206,255,80)'},
                        {range:[7,8], color:'rgb(226,255,60)'},
                        {range:[8,9], color:'rgb(230,255,40)'},
                    ],
                threshold: {
                    line: {color: 'red', width: 6},
                    thickness: 0.8,
                    value: wfreq
                }
            }
        }
    ];
    
    var layout = { width: 500, height: 500, margin: { t: 0, b: 0 } };
    var GAUGE = document.getElementById("gauge");
    Plotly.newPlot(GAUGE, trace3, layout);
}

// Initialize the dashboard
init();