// Define the dimensions of the SVG container
const width = 690,
	height = 230;


// Define the number of boxes
const numBoxes = 5;
const boxWidth = 90
const boxHeight = 100;
const boxOpacity = 0.3
// Define the x-coordinate of the first box
const boxX = 0;
// Define the x-coordinate increment for each box
const boxXIncrement = 150;


const circlesSeparation = 30
const circleRadius = 10

// Create a group for the boxes
const boxGroup = d3.select("#animation").append("g")
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
	.attr("y", height - boxHeight)
	.attr("width", boxWidth)
	.attr("height", boxHeight)
	.attr("opacity", boxOpacity)

const startButton = document.querySelector(".start-button")
startButton.addEventListener("click", start)

let intervalId;

function start() {
	setStartButtonDisabled(true)
	clearInterval(intervalId)

	let speed;
	let link_csv = ""
	const checkedRadioTopic = document.querySelector('input[name="radio-topic"]:checked');
	if (checkedRadioTopic.id == 'far_left') {
		link_csv = "https://mateo762.github.io/data/L_user_482_sim_0_idy_0.csv.txt"
	} else if (checkedRadioTopic.id == 'left') {
		link_csv = "https://mateo762.github.io/data/CL_user_424_sim_0_idy_0.csv.txt"
	} else if (checkedRadioTopic.id == 'center') {
		link_csv = "https://mateo762.github.io/data/C_user_287_sim_0_idy_0.csv.txt"
	} else if (checkedRadioTopic.id == 'right') {
		link_csv = "https://mateo762.github.io/data/CR_user_162_sim_0_idy_0.csv.txt"
	} else if (checkedRadioTopic.id == 'far_right') {
		link_csv = "https://mateo762.github.io/data/R_user_594_sim_0_idy_0.csv.txt"
	}

	const checkedRadioSpeed = document.querySelector('input[name="radio-speed"]:checked');
	if (checkedRadioSpeed.id == 'slow') {
		speed = 0
	} else if (checkedRadioSpeed.id == 'medium') {
		speed = 1
	} else if (checkedRadioSpeed.id == 'fast') {
		speed = 2
	}

	const circleData = []
	let oneIteration = []
	let iteration = 0
	let selectedIteration = -1
	const numCircles = 20

	d3.csv(link_csv, function (data) {
		if (iteration == numCircles + 1) {
			shuffledOneIteration = shuffle(oneIteration)
			for(let i=0; i<numCircles+1; ++i){
				if(shuffledOneIteration[i].kind == 'choice'){
					selectedIteration = i
				}
			}
			circleData.push({
				selected: selectedIteration,
				circles: shuffledOneIteration
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

		console.log(circleData)
		d3.selectAll(".circles-group").remove()

		const iterationDuration = [2000, 1500, 1000]
		const betweenIterationDuration = [2700, 2000, 1500]

		const circlesAppearDuration = [1500, 900, 600]
		const circlesAppearDelay = [40, 35, 25]
		const circlesRemoveDuration = [1500, 900, 600]


		const iterations = circleData.length
		const countTopics = [0, 0, 0, 0, 0]
		const circleLastCx = circleRadius + (circlesSeparation * numCircles - 1)

		const circleGroup = d3.select("#animation")
			.append("g")
			.attr("class", "circles-group");

		function updateData(iteration) {
			circleGroup.selectAll(".circle")
				.data(circleData[iteration].circles)
				.enter()
				.append("circle")
				.attr("id", function (d, i) {
					if (i == circleData[iteration].selected) {
						countTopics[d.value - 1]++
						return "selected"
					} else {
						return "non-selected"
					}
				})
				.transition()
				.duration(circlesAppearDuration[speed])
				.delay(function (_d, i) {
					return (numCircles - i) * circlesAppearDelay[speed]
				})
				.attr("class", function (d) {
					return "circle-" + d.value
				})
				.attr("cx", function (d, i) {
					return ((width - circleLastCx) - circleRadius) / 2 + circleRadius + (circlesSeparation * i)
				})
				.attr("cy", 40)
				.attr("r", circleRadius)
		}

		function update() {
			d3.select("#selected")
				.transition()
				.duration(circlesRemoveDuration[speed])
				.attr("r", 10)
				.attr('cx', function (d) {
					// Return the corresponding box center for each circle
					position = (countTopics[d.value - 1] - 1) % 4
					const boxIndex = d.value - 1;
					const boxCenterX = boxX + (boxXIncrement * boxIndex) + ((boxWidth / 3) * 1.5);
					return (boxCenterX + (boxWidth / 3) * 1.5 - d.radius) - position * 2 * d.radius - 5

				})
				.attr('cy', function (d) {
					position = countTopics[d.value - 1] - 1 == 0 ? 0 : Math.floor((countTopics[d.value - 1] - 1) / 4)
					return (height - d.radius) - position * 2 * d.radius
				})
				.attr('id', "inside")

			// Add a filter to select only the non-selected circles
			const nonSelectedCircles = circleGroup.selectAll("circle")
				.filter(function (d) {
					return d3.select(this).attr("id") == "non-selected";
				})
				.transition()
				.duration(circlesRemoveDuration[speed])
				.attr('cx', 1000)

			// Remove the non-selected circles
			nonSelectedCircles.remove();
		}

		let iter = 0

		function updateAll() {
			updateData(iter)
			setTimeout(update, iterationDuration[speed])
			iter++
			if (iter == iterations) {
				clearInterval(intervalId)
				setStartButtonDisabled(false)
			}
		}

		updateAll()

		intervalId = setInterval(updateAll, betweenIterationDuration[speed])
	}
}


function stop() {
	clearInterval(intervalId);
	setStartButtonDisabled(false)
	d3.selectAll(".circles-group").selectAll(".inside").remove();
}

document.querySelector(".stop-button").addEventListener("click", stop);


function setStartButtonDisabled(isDisabled) {
	startButton.disabled = isDisabled
	if (isDisabled) {
		startButton.classList.add("disabled")
	} else {
		startButton.classList.remove("disabled")
	}
}

function shuffle(array) {
	let currentIndex = array.length, randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {

		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex], array[currentIndex]];
	}

	return array;
}
