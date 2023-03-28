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

const exampleName = 'User:R/Measure:R'

const examplePlots = ['User:R/Measure:L', 'User:R/Measure:CL', 'User:R/Measure:C',
    'User:R/Measure:CR', 'User:R/Measure:R']

const colors = ['#1919e6','#6060b1','#808080','#b34d4d','#e61919']

const mode = "choice" // It can be 'choice' or 'recomendation'

d3.csv("https://mateo762.github.io/data/plots.csv.txt").then((data) => {
    const plotData = examplePlots.map(plotName => {
        return data.filter(d => d.Plot === plotName && d.Line === mode);
    });
    createAnimationCircles(plotData);
    console.log(plotData)
});

function createAnimationCircles(dataArray) {
    const svg = d3.select('svg');
    const width = parseFloat(svg.attr('width'));
    const height = parseFloat(svg.attr('height'));

    const maxRadius = 50;
    const circleSpacing = (width - 2 * (50 + maxRadius)) / (dataArray.length - 1);

    const circles = dataArray.map((data, i) => {
        const maxValue = d3.max(data, d => parseFloat(d.Value));
        const scale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([0, maxRadius]);

        return {
            circle: svg.append('circle')
                .attr('cx', 50 + maxRadius + i * circleSpacing)
                .attr('cy', height / 2 - 40)
                .attr('r', scale(parseFloat(data[0].Value)))
                .attr('fill', () => colors[i]),
            scale: scale
        };
    });

    const progressBar = svg.append('rect')
        .attr('x', 50)
        .attr('y', height - 50)
        .attr('width', 0)
        .attr('height', 20)
        .attr('fill', 'steelblue');

    const progressScale = d3.scaleLinear()
        .domain([0, 20])
        .range([0, width - 100]);


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
        progressBar.transition()
            .duration(600)
            .attr('width', progressScale(i + 1));
        });

    }


    animateCircles(0, 0);
}


function createAnimationRectangles(dataArray) {
    const svg = d3.select('svg');
    const width = parseFloat(svg.attr('width'));
    const height = parseFloat(svg.attr('height'));

    const maxRadius = 50;
    const squareSize = maxRadius * 2;
    const squareSpacing = (width - 2 * 50 - dataArray.length * squareSize) / (dataArray.length - 1);

    const squares = dataArray.map((data, i) => {
        const maxValue = d3.max(data, d => parseFloat(d.Value));
        const scale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([0, squareSize]);

        return {
            square: svg.append('rect')
                .attr('x', 50 + i * (squareSize + squareSpacing))
                .attr('y', height / 2 - 40 - maxRadius)
                .attr('width', 0)
                .attr('height', 0)
                .attr('fill', () => colors[i]),
            scale: scale
        };
    });

    const progressBar = svg.append('rect')
        .attr('x', 50)
        .attr('y', height - 50)
        .attr('width', 0)
        .attr('height', 20)
        .attr('fill', 'steelblue');

    const progressScale = d3.scaleLinear()
        .domain([0, 20])
        .range([0, width - 100]);

    function animateSquares(i) {
        if (i >= dataArray[0].length) return;

        squares.forEach((squareObj, plotIndex) => {
            const data = dataArray[plotIndex];
            const square = squareObj.square;
            const scale = squareObj.scale;

            square.transition()
                .duration(600)
                .attr('width', scale(parseFloat(data[i].Value)))
                .attr('height', scale(parseFloat(data[i].Value)))
                .on('end', () => {
                    if (plotIndex === dataArray.length - 1) {
                        animateSquares(i + 1);
                    }
                });
            progressBar.transition()
                .duration(600)
                .attr('width', progressScale(i + 1));
        });

    }

    animateSquares(0, 0);
}





