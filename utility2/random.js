const plotsRandom = ['Start:L/', 'Start:CL/', 'Start:C/', 'Start:CR/', 'Start:R/']

const plotsUtility = ['User:L/', 'User:CL/', 'User:C/', 'User:CR/', 'User:R/']

const names = ['L', 'CL', 'C', 'CR', 'R']

const colors = ['#1919e6', '#6060b1', '#808080', '#b34d4d', '#e61919']

const indexChoice = 4
const mode = 'choice'

// Set up SVG dimensions
const svgWidth = 700
const svgHeight = 500


const width = 70
const separationBar = 157


const scaleFactor = 1e3
const exaggerationFactor = {'random': 1500, 'utility': 500}


const referencePoint = svgHeight / 2;
const groundPosition = {'random': svgHeight/2, 'utility': 3 * svgHeight / 4}
const exaggeratedReference = {'random': exaggerationFactor.random / 2, 'utility': exaggerationFactor.utility / 2}


const useUtility = true


document.querySelectorAll('input[name="position-1"]').forEach(radioButton => {
    radioButton.addEventListener('click', (event) => {
        let orientation;
        if (event.target.value === 'Far Left') {
            orientation = 0
        } else if (event.target.value === 'Left') {
            orientation = 1
        } else if (event.target.value === 'Center') {
            orientation = 2
        } else if (event.target.value === 'Right') {
            orientation = 3
        } else if (event.target.value === 'Far Right') {
            orientation = 4
        }
        console.log(orientation)
        updateOrientation(orientation, useUtility)
    });
});



function updateOrientation(orientation, useUtility) {
    d3.csv("https://mateo762.github.io/data/plots.csv.txt").then((data) => {
        d3.csv("https://mateo762.github.io/data/relative_utility.csv.txt").then((dataUtility) => {
            const plots = useUtility? plotsUtility : plotsRandom
            console.log(plots)
            for (const dict of data) {
                dict.Value = parseFloat(dict.Value) * scaleFactor + 1;
            }
            const filterData = data.filter(function (d) {
                return d.Line === mode && d.Plot.startsWith(plots[orientation])
            })
            console.log(filterData)
            for (const dict of dataUtility) {
                dict.Value = parseFloat(dict.Value) * scaleFactor + 1;
            }
            const utilityData = convertUtilityData(dataUtility.filter(d => d.Start === names[orientation]))
            const parseData = convertData(filterData)
            console.log(parseData)
            if (useUtility) {
                drawUtilityBars(parseData, utilityData)
            }
            setUp(parseData, useUtility)
        })
    });

    function drawUtilityBars(valuesArray, utilityArray) {
        console.log(valuesArray)
        console.log(utilityArray)

        for (let i = 0; i < 5; ++i) {
            const firstValue = valuesArray[i][0]

            console.log(names[i], firstValue, utilityArray[i])
            // Create a scale to map positive values to heights
            const scalePos = d3.scaleLog()
                .domain([firstValue, scaleFactor + 1])
                .range([0, exaggeratedReference.utility]);

            // Create a scale to map negative values to heights
            const scaleNeg = d3.scaleLog()
                .domain([firstValue, 1])
                .range([0, exaggeratedReference.utility]);


            const newHeight = utilityArray[i] >= firstValue
                ? scalePos(utilityArray[i])
                : scaleNeg(utilityArray[i]);

            const posX = i * separationBar
            const borderBar = d3.select(`.utility-bar-border-${i}`)
                .attr('width', (3 * width / 4))
                .attr('height', newHeight)
                .attr('y', utilityArray[i] >= firstValue ? groundPosition.utility - newHeight : groundPosition.utility)
                .attr('x', (width / 4 / 2) + posX)
                .attr('fill', 'none')
                .attr('stroke', 'black')
                .attr('stroke-width', 1);
        }
    }


    function setUp(testValuesArray, useUtility) {

        const suffix = useUtility? 'utility':'random'

        const groundPositionTemp = useUtility? groundPosition.random : groundPosition.utility

        d3.selectAll('.text-percentage').remove()

        // Set the initial reference point for the bar

        const svg = d3.select('svg');
        svg.attr('width', svgWidth)
            .attr('height', svgHeight)

        testValuesArray.forEach((testValues, index) => {

            const posX = index * separationBar

            const firstValue = testValues[0];


            // Create the bar with initial height of 0

            // Create the bar first to place it behind the other elements
            const bar = d3.select(`.${suffix}-bar-${index}`)
                .attr('width', (3 * width / 4))
                .attr('height', 0)
                .attr('y', groundPosition)
                .attr('x', (width / 4 / 2) + posX)
                .attr('fill', (_d, i) => colors[index])


            // Create a horizontal line at the reference point
            const floorLine = d3.select(`.${suffix}-line-${index}`)
                .attr('x1', posX)
                .attr('y1', groundPosition)
                .attr('x2', width + posX)
                .attr('y2', groundPosition)
                .attr('stroke', 'black')
                .attr('stroke-width', 1);

            // Create a small rectangle in the middle of the horizontal line
            const rectWidth = 40;
            const rectHeight = 20;
        
            const rectangleText = d3.select(`.${suffix}-rect-${index}`)
                .attr('x', ((width - rectWidth) / 2) + posX)
                .attr('y', groundPosition - rectHeight / 2)
                .attr('width', rectWidth)
                .attr('height', rectHeight)
                .attr('fill', 'white')
                .attr('stroke', 'black')
                .attr('stroke-width', 1);

            // Create a text element to display the current value inside the rectangle
            const valueText = d3.select(`.${suffix}-text-value-${index}`)
                .attr('opacity', 0)
                .attr('x', (width / 2) + posX)
                .attr('y', groundPosition + 5) // Adjust the vertical position to center the text within the rectangle
                .attr('text-anchor', 'middle')
                .attr('font-size', '12px')
                .text(((firstValue - 1) / scaleFactor * 100).toFixed(2))
                .attr('fill', 'black')
                .transition()
                .duration(500)
                .attr('opacity', 1)


        })


        // Function to animate the bar
        function animateBar(testValuesArray) {

            const exaggeratedReferenceTemp = useUtility? exaggeratedReference.utility : exaggeratedReference.random

            testValuesArray.forEach((testValues, index) => {
                let i = 0;
                const bar = d3.select(`.bar-${index}`)
                const firstValue = testValues[0]

                const lastValue = testValues[testValues.length - 1]

                const originalFirstValue = ((firstValue - 1) / scaleFactor) * 100
                const originalLastValue = ((lastValue - 1) / scaleFactor) * 100

                let percentageChange;

                if (originalLastValue > originalLastValue) {
                    percentageChange = (originalLastValue - originalFirstValue) / originalFirstValue * 100;
                } else {
                    percentageChange = (originalFirstValue - originalLastValue) / originalFirstValue * -100;
                }
                // if (percentageChange < 0) {
                //     percentageChange = -percentageChange;
                // }

                const posX = index * separationBar


                // Create a scale to map positive values to heights
                const scalePos = d3.scaleLog()
                    .domain([firstValue, scaleFactor + 1])
                    .range([0, exaggeratedReferenceTemp]);

                // Create a scale to map negative values to heights
                const scaleNeg = d3.scaleLog()
                    .domain([firstValue, 1])
                    .range([0, exaggeratedReferenceTemp]);

                function updateHeight() {
                    if (i < testValues.length) {
                        const previousValue = i === 0 ? 0 : testValues[i - 1];
                        const currentValue = testValues[i];
                        const isCrossingZero = (previousValue < 0 && currentValue >= 0) || (previousValue >= 0 && currentValue < 0);

                        // Calculate the new height based on the testValues array
                        const newHeight = currentValue >= firstValue
                            ? scalePos(currentValue)
                            : scaleNeg(currentValue);

                        if (isCrossingZero) {
                            // Transition through zero
                            bar.transition()
                                .duration(125)
                                .attr('height', 0)
                                .attr('y', groundPositionTemp)
                                .on('end', () => {
                                    bar.transition()
                                        .duration(125)
                                        .attr('height', newHeight)
                                        .attr('y', currentValue >= firstValue ? groundPositionTemp - newHeight : groundPositionTemp);
                                });
                        } else {
                            // Update the height and position of the bar
                            bar.transition()
                                .duration(250)
                                .attr('height', newHeight)
                                .attr('y', currentValue >= firstValue ? groundPositionTemp - newHeight : groundPositionTemp);
                        }

                        if (i == testValues.length - 1) {
                            // Create a text element with an initial opacity of 0
                            const percentageText = svg.append('text')
                                .attr('x', (width / 2) + posX - 5)
                                .attr('y', groundPositionTemp + 100) // Set the vertical position for the percentage change text
                                .attr('text-anchor', 'middle')
                                .attr('font-size', '12px')
                                .attr('fill', percentageChange > 0 ? 'green' : 'red') // Set the color based on the percentage change
                                .attr('opacity', 0)
                                .text((percentageChange > 0 ? '+' : '') + percentageChange.toFixed(2) + '%') // Add the correct sign based on the percentage change
                                .attr('class', `text-percentage`)

                            // Transition the opacity from 0 to 1
                            percentageText.transition()
                                .duration(1000)
                                .attr('opacity', 1);

                            console.log(`.text-value-${index}`, originalLastValue)
                            d3.select(`.text-value-${index}`)
                                .attr('opacity', 0)
                                .text(originalLastValue.toFixed(2))
                                .attr('fill', percentageChange > 0 ? 'green' : 'red') // Set the color based on the percentage change
                                .transition()
                                .duration(500)
                                .attr('opacity', 1)

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

function convertUtilityData(data) {
    let parseData = []
    data.map(d => parseData.push(d.Value))
    return parseData
}

updateOrientation(4, useUtility)