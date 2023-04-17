const plots = [['Start:L/Measure:L', 'Start:L/Measure:CL', 'Start:L/Measure:C',
    'Start:L/Measure:CR', 'Start:L/Measure:R'],
['Start:CL/Measure:L', 'Start:CL/Measure:CL', 'Start:CL/Measure:C',
    'Start:CL/Measure:CR', 'Start:CL/Measure:R'],
['Start:C/Measure:L', 'Start:C/Measure:CL', 'Start:C/Measure:C',
    'Start:C/Measure:CR', 'Start:C/Measure:R'],
['Start:CR/Measure:L', 'Start:CR/Measure:CL', 'Start:CR/Measure:C',
    'Start:CR/Measure:CR', 'Start:CR/Measure:R'],
['Start:R/Measure:L', 'Start:R/Measure:CL', 'Start:R/Measure:C',
    'Start:R/Measure:CR', 'Start:R/Measure:R']]


const namePlots = ['Start:L/', 'Start:CL/', 'Start:C/', 'Start:CR/', 'Start:R/']


const testValues = [4, 5, 4, 3, 2, 1, -1, -2, -3, -4, -5, 10, -10];
const otherValues = [2, -3, -4, -5, -6, -8, -2, 0, 4, 5, 8, 10, 10]
const testValuesArray = [
    testValues,
    testValues,
    otherValues,
    testValues,
    testValues
];

const colors = ['#1919e6', '#6060b1', '#808080', '#b34d4d', '#e61919']

const indexChoice = 4
const mode = 'choice'

// Set up SVG dimensions
const svgWidth = 700
const svgHeight = 500


const scaleFactor = 1e5
const exaggerationFactor = 1500

d3.csv("https://mateo762.github.io/data/plots.csv.txt").then((data) => {

    for (const dict of data) {
          dict.Value = parseFloat(dict.Value) * scaleFactor + 1;
    }
    console.log(data)
    const filterData = data.filter(function (d) {
        return d.Line === mode && d.Plot.startsWith(namePlots[indexChoice])
    })
    const parseData = convertData(filterData)
    console.log(parseData)
    setUp(parseData)
});



function setUp(testValuesArray) {

    // Set the initial reference point for the bar
    const referencePoint = svgHeight / 2;
    const exaggeratedReference = exaggerationFactor / 2;

    const svg = d3.select('svg');
    svg.attr('width', svgWidth)
        .attr('height', svgHeight)

    testValuesArray.forEach((testValues, index) => {

        const width = 60

        const posX = index * 160

        const firstValue = testValues[0];


        // Create the bar with initial height of 0

        // Create the bar first to place it behind the other elements
        const bar = svg.append('rect')
            .attr('width', (3 * width / 4))
            .attr('height', 0)
            .attr('y', referencePoint)
            .attr('x', (width / 4 / 2) + posX)
            .attr('fill', (_d, i) => colors[index])
            .attr('class', `bar-${index}`)

        // Create a horizontal line at the reference point
        svg.append('line')
            .attr('x1', posX)
            .attr('y1', referencePoint)
            .attr('x2', width + posX)
            .attr('y2', referencePoint)
            .attr('stroke', 'black')
            .attr('stroke-width', 1);

        // Create a small rectangle in the middle of the horizontal line
        const rectWidth = 30;
        const rectHeight = 20;
        svg.append('rect')
            .attr('x', ((width - rectWidth) / 2) + posX)
            .attr('y', referencePoint - rectHeight / 2)
            .attr('width', rectWidth)
            .attr('height', rectHeight)
            .attr('fill', 'white')
            .attr('stroke', 'black')
            .attr('stroke-width', 1);

        // Create a text element to display the current value inside the rectangle
        const valueText = svg.append('text')
            .attr('x', (width / 2) + posX)
            .attr('y', referencePoint + 5) // Adjust the vertical position to center the text within the rectangle
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text((firstValue/scaleFactor * 100).toFixed(2));


    })


    // Function to animate the bar
    function animateBar() {

        testValuesArray.forEach((testValues, index) => {
            let i = 0;
            const bar = d3.select(`.bar-${index}`)
            const firstValue = testValues[0]

            // Create a scale to map positive values to heights
            const scalePos = d3.scaleLog()
                .domain([firstValue, scaleFactor + 1])
                .range([0, exaggeratedReference]);

            // Create a scale to map negative values to heights
            const scaleNeg = d3.scaleLog()
                .domain([firstValue, 1])
                .range([0, exaggeratedReference]);

            function updateHeight() {
                if (i < testValues.length) {
                    const previousValue = i === 0 ? 0 : testValues[i - 1];
                    const currentValue = testValues[i];
                    const isCrossingZero = (previousValue < 0 && currentValue >= 0) || (previousValue >= 0 && currentValue < 0);

                    // Calculate the new height based on the testValues array
                    console.log(currentValue)
                    const newHeight = currentValue >= firstValue
                        ? scalePos(currentValue)
                        : scaleNeg(currentValue);

                    if (isCrossingZero) {
                        // Transition through zero
                        bar.transition()
                            .duration(125)
                            .attr('height', 0)
                            .attr('y', referencePoint)
                            .on('end', () => {
                                bar.transition()
                                    .duration(125)
                                    .attr('height', newHeight)
                                    .attr('y', currentValue >= firstValue ? referencePoint - newHeight : referencePoint);
                            });
                    } else {
                        // Update the height and position of the bar
                        bar.transition()
                            .duration(250)
                            .attr('height', newHeight)
                            .attr('y', currentValue >= firstValue ? referencePoint - newHeight : referencePoint);
                    }

                    i++;
                    // Call the function again with a delay
                    setTimeout(updateHeight, 300);
                }
            }

            updateHeight();
        })
    }

    // Add event listener to the button
    d3.select('#animateButton').on('click', animateBar);
}


function convertData(data) {
    const measures = ['L', 'CL', 'C', 'CR', 'R']
    let parseData = [
        [],
        [],
        [],
        [],
        []
    ]

    for (let i = 0; i < measures.length; ++i) {
        measureData = data.filter(d => d.Measure === measures[i])
        measureData.map(d => parseData[i].push(d.Value))
    }

    return parseData
}