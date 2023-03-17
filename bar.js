// Define the data (Group 1)
const data = d3.range(5).map(function (d) {
    return d3.range(5).map(function (e) {
        return Math.floor(Math.random() * 101);
    });
});

// Define the dimensions of the chart
const width_2 = 500;
const height_2 = 300;
const margin = { top: 20, right: 20, bottom: 30, left: 40 };

// Colors array
const colors = ['#1919e6', '#6060b1', '#808080', '#b34d4d', '#e61919'];

// Create the SVG container for the chart
const svg = d3.select("#bar")
    .attr("width", width_2 + margin.left + margin.right)
    .attr("height", height_2 + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Define the x and y scales
const x = d3.scaleBand()
    .domain(['FL', 'L', 'C', 'R', 'FR'])
    .range([0, width_2])
    .padding(0.1);

const y = d3.scaleLinear()
    .domain([0, 100])
    .range([height_2, 0]);

// Add the x-axis to the chart
svg.append("g")
    .attr("transform", `translate(0, ${height_2})`)
    .call(d3.axisBottom(x));

// Add the y-axis to the chart
svg.append("g")
    .call(d3.axisLeft(y));

// Add event listener to the 'Start animation' button
// Add event listeners to the radio buttons
document.querySelectorAll('input[name="radioButton"]').forEach(radio => {
    radio.addEventListener('click', updateChart);
});
function updateChart() {
    // Get the checked radio button
    const checkedRadio = document.querySelector('input[name="radioButton"]:checked');
    let selectedData;

    switch (checkedRadio.id) {
        case "far_left":
            selectedData = data[0];
            break;
        case "left":
            selectedData = data[1];
            break;
        case "center":
            selectedData = data[2];
            break;
        case "right":
            selectedData = data[3];
            break;
        case "far_right":
            selectedData = data[4];
            break;
        default:
            return;
    }

    // Update the x-scale domain
    x.domain(selectedData.map((d, i) => i));

    // Update the bars with the new data
    const bars = svg.selectAll(".bar")
        .data(selectedData);

    // Define transition duration
    const transitionDuration = 750;

    // Update existing bars with transition
    bars
        .transition()
        .duration(transitionDuration)
        .attr("x", (d, i) => x(i))
        .attr("y", d => y(d))
        .attr("width", x.bandwidth())
        .attr("height", d => height_2 - y(d))
        .attr("fill", (d,i) => colors[i]);

    // Enter new bars with transition
    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d, i) => x(i))
        .attr("y", height_2)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", (d,i) => colors[i])
        .transition()
        .duration(transitionDuration)
        .attr("y", d => y(d))
        .attr("height", d => height_2 - y(d));

    // Remove old bars with transition
    bars.exit()
        .transition()
        .duration(transitionDuration)
        .attr("y", height_2)
        .attr("height", 0)
        .remove();
}

// Initial render
updateChart();