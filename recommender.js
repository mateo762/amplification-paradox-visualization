function startRecommender() {
    // Data - initialize the user-item matrix data
    const numRows = 10;
    const numCols = 10;
    let data = Array.from({ length: numRows }, () => Array.from({ length: numCols }, () => Math.random()));
    let consumed = Array.from({ length: numRows }, () => Array.from({ length: numCols }, () => 0));

    // Dimensions
    const cellSize = 50;
    const width = cellSize * numCols;
    const height = cellSize * numRows;
    const margin = { top: 80, right: 20, bottom: 20, left: 80 };

    // Color scale
    const colorScale = d3.scaleOrdinal([0, 1], ["#eee", "#2c7bb6"]);

    // Create SVG
    const svg = d3.select(".recommender-matrix")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const rowGroups = svg.selectAll(".row-group")
        .data(consumed)
        .join("g")
        .attr("class", "row-group")
        .attr("transform", (d, i) => `translate(${margin.left}, ${margin.top + i * cellSize})`);


    const cells = rowGroups.selectAll(".cell")
        .data(d => d)
        .join("rect")
        .attr("class", "cell")
        .attr("x", (d, i) => i * cellSize)
        .attr("y", 0)
        .attr("width", cellSize - 2) // Adjust cell width
        .attr("height", cellSize - 2) // Adjust cell height
        .attr("fill", d => colorScale(d))
        .attr("stroke", "#ccc")
        .attr("stroke-width", "3px")

    // Add labels
    svg.append("text")
        .attr("x", margin.left / 2)
        .attr("y", (height + margin.top) / 2)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr('font-size', '30px')
        .attr("transform", `rotate(-90, ${margin.left / 2}, ${(height + margin.top) / 2})`)
        .text("Users");

    svg.append("text")
        .attr("x", (width / 2) + margin.left)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .attr('font-size', '30px')
        .attr("alignment-baseline", "middle")
        .text("Items");


    let interactionCounter = 0;
    const interactionsPerUser = 4;
    const totalInteractions = numRows * interactionsPerUser;

    const users = Array.from({ length: numRows }, (_, i) => i);
    let shuffledUsers = shuffle(users.slice());

    function animate() {
        console.log(data);
        if (interactionCounter >= totalInteractions) {
            return;
        }

        const userInteraction = generateUserInteraction();
        if (userInteraction) {
            const { user, item } = userInteraction;

            const similarUsers = getMostSimilarUsers(user);

            rowGroups.filter((_, i) => i === user) // Select the user row
                .selectAll(".cell") // Select the cells within the user row
                .attr("stroke-width", "4px") // Set stroke width directly
                .transition()
                .duration(250)
                .attr("stroke", "red"); // Set stroke color directly

            setTimeout(() => {
                rowGroups.filter((_, i) => similarUsers.includes(i))
                .selectAll(".cell") // Select the cells within the group
                .attr("stroke-width", "4px") // Set stroke width directly
                .transition()
                .duration(250)
                .attr("stroke", "green")}, 500); // Set stroke color directly

            // Schedule the removal of highlighting after a delay
            setTimeout(() => {
                rowGroups.selectAll(".cell") // Select the cells within the group
                    .transition()
                    .duration(250)
                    .attr("stroke", "#ccc") // Remove stroke color
                    .attr("stroke-width", "2px"); // Reset stroke width to 0
            }, 1500); // Adjust the delay as needed

            // Update cell in the data matrix
            consumed[user][item] = 1;

            // Update the specific cell
            setTimeout(() => {
                rowGroups
                    .filter((_, i) => i === user)
                    .selectAll(".cell")
                    .filter((_, i) => i === item)
                    .transition()
                    .duration(200)
                    .attr("fill", () => colorScale(1))
            }, 1000);

            interactionCounter++;

            if (interactionCounter % numRows === 0) {
                shuffledUsers = shuffle(users.slice());
            }
        }

        // Schedule next update
        setTimeout(animate, 2000); // Adjust delay as needed
    }

    // Calculate cosine similarity
    function cosineSimilarity(a, b) {
        const dotProduct = a.reduce((sum, aVal, idx) => sum + aVal * b[idx], 0);
        const aMagnitude = Math.sqrt(a.reduce((sum, aVal) => sum + aVal * aVal, 0));
        const bMagnitude = Math.sqrt(b.reduce((sum, bVal) => sum + bVal * bVal, 0));
        return dotProduct / (aMagnitude * bMagnitude);
    }

    // Get the 2 most similar users
    function getMostSimilarUsers(userIndex, numSimilarUsers = 2) {
        const userSimilarities = data.map((otherUser, idx) => ({
            index: idx,
            similarity: idx === userIndex ? -1 : cosineSimilarity(data[userIndex], otherUser)
        }));

        userSimilarities.sort((a, b) => b.similarity - a.similarity);
        return userSimilarities.slice(0, numSimilarUsers).map(u => u.index);
    }

    // Select the video with the highest cosine similarity
    function selectHighestCosineSimilarityVideo(user, similarUsers) {
        const availableItems = consumed[user].map((val, idx) => val === 0 ? idx : -1).filter(val => val !== -1);
        let maxSimilarity = -1;
        let selectedItem = -1;

        availableItems.forEach(item => {
            const itemSimilarity = similarUsers.reduce(
                (sum, otherUser) => sum + cosineSimilarity(data[user], data[otherUser]) * data[otherUser][item],
                0
            );

            if (itemSimilarity > maxSimilarity) {
                maxSimilarity = itemSimilarity;
                selectedItem = item;
            }
        });

        return selectedItem;
    }


    // Generate user interaction
    function generateUserInteraction() {
        const user = shuffledUsers.shift();
        const similarUsers = getMostSimilarUsers(user);
        const selectedItem = selectHighestCosineSimilarityVideo(user, similarUsers);

        if (selectedItem !== -1) {
            return { user, item: selectedItem };
        } else {
            return null;
        }
    }




    // Shuffle array function
    function shuffle(array) {
        let currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (currentIndex !== 0) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    function reset() {
        interactionCounter = 0
        data = Array.from({ length: numRows }, () => Array.from({ length: numCols }, () => Math.random()));
        consumed = Array.from({ length: numRows }, () => Array.from({ length: numCols }, () => 0));
    }

    document.querySelector('.start-button-recommender').addEventListener('click', () => {
        reset()
        animate()
    })
}

startRecommender()