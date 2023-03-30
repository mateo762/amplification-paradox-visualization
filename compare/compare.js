const plotNames = ['Start:C/Measure:L', 'Start:CR/Measure:L', 'Start:R/Measure:L',
    'User:C/Measure:L', 'User:CR/Measure:L', 'User:R/Measure:L',
    'Start:C/Measure:CL', 'Start:CR/Measure:CL', 'Start:R/Measure:CL',
    'User:C/Measure:CL', 'User:CR/Measure:CL', 'User:R/Measure:CL',
    'Start:C/Measure:C', 'Start:CR/Measure:C', 'Start:R/Measure:C',
    'User:C/Measure:C', 'User:CR/Measure:C', 'User:R/Measure:C',
    'Start:C/Measure:CR', 'Start:CR/Measure:CR', 'Start:R/Measure:CR',
    'User:C/Measure:CR', 'User:CR/Measure:CR', 'User:R/Measure:CR',
    'Start:C/Measure:R', 'Start:CR/Measure:R', 'Start:R/Measure:R',
    'User:C/Measure:R', 'User:CR/Measure:R', 'User:R/Measure:R']

const namePlots = ['User:L', 'User:CL', 'User:C', 'User:CR', 'User:R']

const plots = [['User:L/Measure:L', 'User:L/Measure:CL', 'User:L/Measure:C',
    'User:L/Measure:CR', 'User:L/Measure:R'],
    ['User:CL/Measure:L', 'User:CL/Measure:CL', 'User:CL/Measure:C',
    'User:CL/Measure:CR', 'User:CL/Measure:R'],
    ['User:C/Measure:L', 'User:C/Measure:CL', 'User:C/Measure:C',
    'User:C/Measure:CR', 'User:C/Measure:R'],
    ['User:CR/Measure:L', 'User:CR/Measure:CL', 'User:CR/Measure:C',
    'User:CR/Measure:CR', 'User:CR/Measure:R'],
    ['User:R/Measure:L', 'User:R/Measure:CL', 'User:R/Measure:C',
    'User:R/Measure:CR', 'User:R/Measure:R']]

const colors = ['#1919e6', '#6060b1', '#808080', '#b34d4d', '#e61919']

const mode = "choice" // It can be 'choice' or 'recomendation'

document.querySelector(".start-button").addEventListener("click", startAnimation)

const svg = d3.select('svg');
const width = parseFloat(svg.attr('width'));
const height = parseFloat(svg.attr('height'));

d3.csv("https://mateo762.github.io/data/plots.csv.txt").then((data) => {
    const plotDataCircle = examplePlots.map(plotName => {
        return data.filter(d => d.Plot === plotName && d.Line === mode);
    });
    const plotDataRectangle = data.filter(d => d.Plot.startsWith(exampleName) && d.Line === mode);
    animateCircles = createAnimationRectangles(plotDataCircle);
    animateRectangle = createRectangleCompare(plotDataRectangle);
});

function startAnimation() {
    if (animateCircles && animateRectangle) {
        animateCircles(0, 0)
        animateRectangle(0)
    }
}

function createRectangleCompare(plotData) {
    totalHeight = height / 1.25
    console.log(plotData)
    L = plotData.filter(d => d.Plot.endsWith(":L")).map(d => d.Value);
    CL = plotData.filter(d => d.Plot.endsWith(":CL")).map(d => d.Value);
    C = plotData.filter(d => d.Plot.endsWith(":C")).map(d => d.Value);
    CR = plotData.filter(d => d.Plot.endsWith(":CR")).map(d => d.Value);
    R = plotData.filter(d => d.Plot.endsWith(":R")).map(d => d.Value);
    console.log(L)

    const numIterations = L.length;
    const transitionDuration = 600;
    const delayBetweenIterations = 0;

    const scale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, totalHeight]);

    const rectangle = d3.select('#rectangle-compare')
        .append('div')
        .classed('rectangle', true)
        .style('height', `${totalHeight}px`)
        .style('width', '50px')
        .style('border', '1px solid black');

    const segments = rectangle.selectAll('.segment')
        .data(Array(5).fill(0))
        .enter()
        .append('div')
        .classed('segment', true)
        .style('background-color', (d, i) => colors[i])
        .style('height', d => `${scale(d)}px`)
        .style('width', '100%');

    const firstValues = [L[0], CL[0], C[0], CR[0], R[0]];
    segments.data(firstValues)
        .transition()
        .duration(transitionDuration)
        .style('height', d => `${scale(d)}px`);

    function update(iteration) {
        const currentValues = [L[iteration], CL[iteration], C[iteration], CR[iteration], R[iteration]];
        console.log(currentValues)
        segments.data(currentValues)
            .transition()
            .duration(transitionDuration)
            .style('height', d => `${scale(d)}px`);

        if (iteration + 1 < numIterations) {
            setTimeout(() => update(iteration + 1), transitionDuration + delayBetweenIterations);
        }
    }

    return update;
}


function createAnimationRectangles(dataArray) {

    const maxRadius = 50;
    const squareSize = maxRadius * 2;
    const squareSpacing = (width - 2 * 50 - dataArray.length * squareSize) / (dataArray.length - 1);

    const squares = dataArray.map((data, i) => {
        const maxValue = d3.max(data, d => parseFloat(d.Value));
        const scale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([0, squareSize]);

        const initialSize = scale(parseFloat(data[0].Value));

        return {
            square: svg
                .append('rect')
                .attr('x', 50 + i * (squareSize + squareSpacing) - initialSize / 2) // Set initial 'x' attribute
                .attr('y', height / 2 - 40 - initialSize / 2) // Set initial 'y' attribute
                .attr('width', initialSize)
                .attr('height', initialSize)
                .attr('fill', () => colors[i]),
            scale: scale
        };
    });

    const progressBar = svg.append('rect')
        .attr('x', 50 + maxRadius + 50) // Add 50 to the x attribute
        .attr('y', height - 50)
        .attr('width', 0)
        .attr('height', 20)
        .attr('fill', 'black');

    const progressScale = d3.scaleLinear()
        .domain([0, 20])
        .range([0, width - 100 - maxRadius - maxRadius - 100]); // Adjust the range calculation

    const progressBarBorder = svg.append('rect')
        .attr('x', 50 + maxRadius + 50) // Same x as the progress bar
        .attr('y', height - 50) // Same y as the progress bar
        .attr('width', progressScale(20)) // Same width as the progress bar when it's fully transitioned
        .attr('height', 20) // Same height as the progress bar
        .attr('fill', 'none') // No fill color
        .attr('stroke', 'black') // Add a stroke (border) color
        .attr('stroke-width', 1); // Set the stroke (border) width

    function animateSquares(i) {
        if (i >= dataArray[0].length) return;

        squares.forEach((squareObj, plotIndex) => {
            const data = dataArray[plotIndex];
            const square = squareObj.square;
            const scale = squareObj.scale;

            const newSize = scale(parseFloat(data[i].Value));

            square.transition()
                .duration(600)
                .attr('x', 50 + plotIndex * (squareSize + squareSpacing) - newSize / 2) // Update 'x' attribute
                .attr('y', height / 2 - 40 - newSize / 2) // Update 'y' attribute
                .attr('width', newSize)
                .attr('height', newSize)
                .on('end', () => {
                    if (plotIndex === dataArray.length - 1) {
                        animateSquares(i + 1);
                    }
                });
        });

        if (i === 0) {
            progressBar.transition()
                .duration(600 * dataArray[0].length)
                .ease(d3.easeLinear)
                .attr('width', progressScale(20));
        }

        setTimeout(() => animateCircles(i + 1), 600);
    }

    // animateSquares(0, 0);
    return animateSquares
}



function createAnimationCircles(dataArray) {

    const maxRadius = 50;
    const circleSpacing = (width - 2 * (50 + maxRadius) - 100) / (dataArray.length - 1); // Adjust the circleSpacing calculation

    const circles = dataArray.map((data, i) => {
        const maxValue = d3.max(data, d => parseFloat(d.Value));
        const scale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([0, maxRadius]);

        return {
            circle: svg.append('circle')
                .attr('cx', 50 + maxRadius + 50 + i * circleSpacing) // Add 50 to the cx attribute
                .attr('cy', height / 2 - 40)
                .attr('r', scale(parseFloat(data[0].Value)))
                .attr('fill', () => colors[i]),
            scale: scale
        };
    });

    const progressBar = svg.append('rect')
        .attr('x', 50 + maxRadius + 50) // Add 50 to the x attribute
        .attr('y', height - 50)
        .attr('width', 0)
        .attr('height', 20)
        .attr('fill', 'black');

    const progressScale = d3.scaleLinear()
        .domain([0, 20])
        .range([0, width - 100 - maxRadius - maxRadius - 100]); // Adjust the range calculation

    const progressBarBorder = svg.append('rect')
        .attr('x', 50 + maxRadius + 50) // Same x as the progress bar
        .attr('y', height - 50) // Same y as the progress bar
        .attr('width', progressScale(20)) // Same width as the progress bar when it's fully transitioned
        .attr('height', 20) // Same height as the progress bar
        .attr('fill', 'none') // No fill color
        .attr('stroke', 'black') // Add a stroke (border) color
        .attr('stroke-width', 1); // Set the stroke (border) width


    function animateCircles(i) {
        if (i >= dataArray[0].length) return;

        circles.forEach((circleObj, plotIndex) => {
            const data = dataArray[plotIndex];
            const circle = circleObj.circle;
            const scale = circleObj.scale;

            circle.transition()
                .duration(600)
                .attr('r', scale(parseFloat(data[i].Value)))
                .on('end', () => {
                    if (plotIndex === dataArray.length - 1) {
                        animateCircles(i + 1);
                    }
                });
        });
        if (i === 0) {
            progressBar.transition()
                .duration(600 * dataArray[0].length)
                .ease(d3.easeLinear)
                .attr('width', progressScale(20));
        }

        setTimeout(() => animateCircles(i + 1), 600);
    }


    //animateCircles(0, 0);
    return animateCircles
}