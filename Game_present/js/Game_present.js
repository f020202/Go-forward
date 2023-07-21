let container = document.querySelector("#container");
let character = document.querySelector("#character");
let crystalball = document.querySelector("#crystalball");
let block = document.querySelector("#block");
let road = document.querySelector("#road");
let score = document.querySelector("#score");
let gameOver = document.querySelector("#gameOver");
let crystalballAppearances = 0; // count crystalball appearances

// Life elements
let life1 = document.querySelector("#life1");
let life2 = document.querySelector("#life2");
let life3 = document.querySelector("#life3");

let lives = [life1, life2, life3];  // array to keep track of lives

// declaring variable for score
let interval = null;
let playerScore = 0;

// // function for score
// let scoreCounter = () => {
//     playerScore++;
//     score.innerHTML = `Score <b>${playerScore}</b>`;
// }

// Collision state
let collisionState = false;

// Game state
let gameRunning = false;

// start Game
window.addEventListener("keydown", (start) => {
    if (start.code == "Space" && !gameRunning) {  // Check if the game is not running
        if (lives.length <= 0) {
            // reset lives
            lives = [life1, life2, life3];  // Reset the lives
            lives.forEach(life => life.style.display = "block");
        }
        road.firstElementChild.style.animation = "roadAnimate 3.5s linear infinite";
        gameOver.style.display = "none";
        block.classList.add("blockActive");
        crystalball.classList.add("crystalballActive");  

        // score
        playerScore = 0.00;
        score.innerHTML = `Score <b>${playerScore.toFixed(2)}</b>`;
        collisionState = false;
        gameRunning = true;
        crystalBallsRemaining = 15;
        //interval = setInterval(scoreCounter, 200);
    }
});

// jump Your Character
window.addEventListener("keydown", (e) => {
    if (e.key == "ArrowUp")
        if (character.classList != "characterActive") {
            character.classList.add("characterActive");
            //  remove class after 0.5 seconds
            setTimeout(() => {
                character.classList.remove("characterActive");
            }, 500);
        }
});

//'Game Over' if 'Character' hit The 'Block' 
let result = setInterval(() => {
    let characterBottom = parseInt(getComputedStyle(character).getPropertyValue("bottom"));
    let blockLeft = parseInt(getComputedStyle(block).getPropertyValue("left"));
    let crystalballLeft = parseInt(getComputedStyle(crystalball).getPropertyValue("left"));

    if (!collisionState && characterBottom <= 90 && blockLeft >= 20 && blockLeft <= 50) {
        // add 'bounce' and 'redFlash' classes to character
        character.classList.add('bounce', 'redFlash');  // modified line

        // remove a life
        let lastLife = lives.pop();
        lastLife.style.display = "none"; // hides the life
        collisionState = true;
        setTimeout(() => {
            // remove 'bounce' and 'redFlash' classes after 1 second
            character.classList.remove('bounce', 'redFlash');  // modified line
            collisionState = false;
        }, 1000);  // waits for 1s before allowing another collision
        if (lives.length <= 0) {  // When no more lives left
            gameOver.style.display = "block";
            block.classList.remove("blockActive");
            road.firstElementChild.style.animation = "none";
            clearInterval(interval);
            playerScore = 0.00;
            gameRunning = false;
        }
    }
}, 10);