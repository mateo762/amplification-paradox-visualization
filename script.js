// let link_csv = ""
// const button = document.querySelector('button');
// button.addEventListener('click', () => {
// 	const checkedRadio = document.querySelector('input[type="radio"]:checked');
// 	if (checkedRadio.id == 'far_left') {
// 		link_csv = "https://github.com/mateo762/mateo762.github.io/blob/main/data/L_user_482_sim_0_idy_0.csv.txt"
// 	} else if (checkedRadio.id == 'left') {
// 		link_csv = "https://github.com/mateo762/mateo762.github.io/blob/main/data/CL_user_424_sim_0_idy_0.csv.txt"
// 	} else if (checkedRadio.id == 'center') {
// 		link_csv = "https://github.com/mateo762/mateo762.github.io/blob/main/data/C_user_287_sim_0_idy_0.csv.txt"
// 	} else if (checkedRadio.id == 'right') {
// 		link_csv = "https://github.com/mateo762/mateo762.github.io/blob/main/data/CR_user_162_sim_0_idy_0.csv.txt"
// 	} else if (checkedRadio.id == 'far_right') {
// 		link_csv = "https://github.com/mateo762/mateo762.github.io/blob/main/data/R_user_594_sim_0_idy_0.csv.txt"
// 	}
// });

// function start() {
// 	d3.csv(link_csv, function (data) {...} // This doesn't work
// 	d3.csv("https://github.com/mateo762/mateo762.github.io/blob/main/data/R_user_594_sim_0_idy_0.csv.txt", function (data) {...} // this works
// }


// Define the dimensions of the SVG container
var width = 690,
	height = 230;


// Define the number of boxes
var numBoxes = 5;

// Define the radius of the circles
var radius = 30;


// Define number of recommendations

// Define the data for the circles
// var circleData = d3.range(iterations).map(function (d) {
// 	return {
// 		selected: Math.floor(Math.random() * 5), // Random value between 0 and 4
// 		circles: d3.range(5).map(function (d) {
// 			return {
// 				value: Math.floor(Math.random() * 5) + 1,
// 				radius: 10
// 			}
// 		})
// 	};
// });




// Define the x-coordinate of the first box
var boxX = 0;

// Define the x-coordinate increment for each box
var boxXIncrement = 150;

// Create a group for the boxes
var boxGroup = d3.select("#animation").append("g")
	.attr("class", "box-group")

// Create the boxes
boxes = boxGroup.selectAll(".box")
	.data(d3.range(numBoxes))
	.enter()
	.append("rect")
	.attr("class", function (_d, i) {
		return 'box-' + i
	})
	.attr("x", function (d, i) { return boxX + (boxXIncrement * i); })
	.attr("y", height - 100)
	.attr("width", radius * 3)
	.attr("height", 100)
	.attr("opacity", 0.3)

document.querySelector(".start-button").addEventListener("click", start)

function start() {
	
	let link_csv = ""
	const checkedRadio = document.querySelector('input[type="radio"]:checked');
	console.log("hola" + checkedRadio.id)
	if (checkedRadio.id == 'far_left') {
		link_csv = "https://mateo762.github.io/data/L_user_482_sim_0_idy_0.csv.txt"
	} else if (checkedRadio.id == 'left') {
		link_csv = "https://mateo762.github.io/data/CL_user_424_sim_0_idy_0.csv.txt"
	} else if (checkedRadio.id == 'center') {
		link_csv = "https://mateo762.github.io/data/C_user_287_sim_0_idy_0.csv.txt"
	} else if (checkedRadio.id == 'right') {
		link_csv = "https://mateo762.github.io/data/CR_user_162_sim_0_idy_0.csv.txt"
	} else if (checkedRadio.id == 'far_right') {
		link_csv = "https://mateo762.github.io/data/R_user_594_sim_0_idy_0.csv.txt"
	}

	var circleData = []
	var oneIteration = []
	let iteration = 0
	let selectedIteration = -1

	console.log(link_csv)

	d3.csv(link_csv, function (data) {
		if (iteration == 21) {
			circleData.push({
				selected: selectedIteration,
				circles: oneIteration
			})
			oneIteration = []
			iteration = 0
		}
		oneIteration.push({
			kind: data.kind,
			value: mapKindToValue(data.label),
			idx: data.idx,
			radius: 10
		})
		if (data.kind == 'choice') {
			selectedIteration = iteration
		}
		iteration++

	}).then(startAnimation);


	function mapKindToValue(kind) {
		if (kind == 'L') return 1
		else if (kind == 'CL') return 2
		else if (kind == 'C') return 3
		else if (kind == 'CR') return 4
		else if (kind == 'R') return 5
	}


	function startAnimation() {

		// Define number of iterations
		var iterations = 19

		var circleGroup = d3.select("#animation")
			.append("g")
			.attr("class", "circles-group");

		var circles = []
		var circlesSelected = []

		var num_group = [0, 0, 0, 0, 0]

		function updateData(iteration) {
			circles = circleGroup.selectAll(".circle")
				.data(circleData[iteration].circles)
				.enter()
				.append("circle")
				.attr("id", function (d, i) {
					if (i == circleData[iteration].selected) {
						num_group[d.value - 1]++
						return "selected"
					} else {
						return "non-selected"
					}
				})
				.transition()
				.duration(500)
				.delay(function (_d, i) {
					return i * 15
				})
				.attr("class", function (d) {
					return "circle-" + d.value
				})
				.attr("cx", function (d, i) {
					return 10 + (30 * i)
				})
				.attr("cy", 40)
				.attr("r", 10)

			circlesSelected.push(circleData[iteration].circles[circleData[iteration].selected])
		}

		function update() {
			d3.select("#selected")
				.transition(1000)
				.duration(600)
				.attr("r", 10)
				.attr('cx', function (d) {
					// Return the corresponding box center for each circle
					position = (num_group[d.value - 1] - 1) % 4
					var boxIndex = d.value - 1;
					var boxCenterX = boxX + (boxXIncrement * boxIndex) + (radius * 1.5);
					//return (boxCenterX - radius * 1.5 - d.radius)-(3*2*d.radius)/4
					return (boxCenterX + radius * 1.5 - d.radius) - position * 2 * d.radius - 5

				})
				.attr('cy', function (d) {
					position = num_group[d.value - 1] - 1 == 0 ? 0 : Math.floor((num_group[d.value - 1] - 1) / 4)
					return (height - d.radius) - position * 2 * d.radius
				})
				.attr('id', null)

			// Add a filter to select only the non-selected circles
			var nonSelected = circleGroup.selectAll("circle")
				.filter(function (d) {
					return d3.select(this).attr("id") == "non-selected";
				})
				.transition(1000)
				.duration(600)
				.attr('cx', 1000)

			// Remove the non-selected circles
			nonSelected.remove();
		}

		let iter = 0

		function updateAll() {
			updateData(iter)
			setTimeout(update, 1000)
			iter++
			if (iter == iterations) {
				clearInterval(interval)
			}
		}

		updateAll()

		var interval = setInterval(updateAll, 1500)
	}
}