let container = document.querySelector("#container");
let character = document.querySelector("#character");
let character_2 = document.querySelector("#character_2");
let block = document.querySelector("#block");
let road = document.querySelector("#road");
let cloud = document.querySelector("#cloud");
let score = document.querySelector("#score");
let gameOver = document.querySelector("#gameOver");

//declaring variable for score
let interval = null;
let playerScore = 0;


//function for score
let scoreCounter = () => {
    playerScore++;
    score.innerHTML = `Score <b>${playerScore}</b>`;
}


//start Game
window.addEventListener("keydown", (start) => {
    //    console.log(start);
    if (start.code == "Space") {
        road.firstElementChild.style.animation = "roadAnimate 1.5s linear infinite";
        gameOver.style.display = "none";
        block.classList.add("blockActive");
        //score
        let playerScore = 0;
        interval = setInterval(scoreCounter, 200);
    }
});


//jump Your Character
window.addEventListener("keydown", (e) => {
    //    console.log(e);

    if (e.key == "ArrowUp")
        if (character.classList != "characterActive") {
            character.classList.add("characterActive");

            //                remove class after 0.5 seconds
            setTimeout(() => {
                character.classList.remove("characterActive");
            }, 500);
        }
});


//'Game Over' if 'Character' hit The 'Block' 
let result = setInterval(() => {
    let characterBottom = parseInt(getComputedStyle(character).getPropertyValue("bottom"));
    //    console.log("characterBottom" + characterBottom);

    let blockLeft = parseInt(getComputedStyle(block).getPropertyValue("left"));
    //    console.log("BlockLeft" + blockLeft);

    if (characterBottom <= 90 && blockLeft >= 20 && blockLeft <= 80) {
        //        console.log("Game Over");

        gameOver.style.display = "block";
        block.classList.remove("blockActive");
        road.firstElementChild.style.animation = "none";
        clearInterval(interval);
        playerScore = 0;
    }
}, 10);
