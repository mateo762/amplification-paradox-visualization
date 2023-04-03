const random_data = Array.from({ length: 5 }, () => ({ "Value": 0.2 }));


d3.csv("https://mateo762.github.io/data/relative_utility.csv.txt").then((data) => {
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


    const temp = (value) => {
        if (value <= 0.025) {
            return d3.scaleLinear()
                .domain([0, 0.025])
                .range([0, 1])(value);
        } else {
            return 0.2;
        }
    };

    const y = d3.scaleLinear()
        .domain([0, 1])
        .range([height_2, 0]);

    // Add the x-axis to the chart
    svg.append("g")
        .attr("transform", `translate(0, ${height_2})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "14px") // Increase the font size of the x-axis labels
        .attr("fill", "#333");

    // Add the y-axis to the chart
    svg.append("g")
        .call(d3.axisLeft(y).ticks(5).tickSize(-width_2)) // Add minor ticks and set their length to the width of the chart
        .selectAll("text")
        .style("font-size", "14px") // Increase the font size of the y-axis labels
        .attr("fill", "#333");

    // Remove the default path (outline) of the axis
    svg.selectAll(".axis path")
        .style("display", "none");

    // Add event listener to the 'Start animation' button
    // Add event listeners to the radio buttons
    document.querySelectorAll('input[name="radio-topic"]').forEach(radio => {
        radio.addEventListener('click', updateChart);
    });

    const checkboxMode = document.querySelector("#checkbox-mode")
    checkboxMode.addEventListener('click', updateChart)

    function updateChart() {
        // Get the checked radio button
        const checkedRadio = document.querySelector('input[name="radio-topic"]:checked');

        let selectedData;
        if (!checkboxMode.checked) {
            switch (checkedRadio.id) {
                case "far_left":
                    const far_left_data = data.filter(
                        (d) => d.Start === "L"
                    )
                    selectedData = far_left_data;
                    break;
                case "left":
                    const left_data = data.filter(
                        (d) => d.Start === "CL"
                    )
                    selectedData = left_data;
                    break;
                case "center":
                    const center_data = data.filter(
                        (d) => d.Start === "C"
                    )
                    selectedData = center_data;
                    break;
                case "right":
                    const right_data = data.filter(
                        (d) => d.Start === "CR"
                    )
                    selectedData = right_data;
                    break;
                case "far_right":
                    const far_right_data = data.filter(
                        (d) => d.Start === "R"
                    )
                    selectedData = far_right_data;
                    break;
                default:
                    return;
            }
        }
        else {
            selectedData = random_data
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
            .attr("y", d => y(temp(d.Value)))
            .attr("width", x.bandwidth())
            .attr("height", d => height_2 - y(temp(d.Value)))
            .attr("fill", (d, i) => colors[i]);

        // Enter new bars with transition
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => x(i))
            .attr("y", height_2)
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .attr("fill", (d, i) => colors[i])
            .transition()
            .duration(transitionDuration)
            .attr("y", d => y(temp(d.Value)))
            .attr("height", d => height_2 - y(temp(d.Value)));

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
});

