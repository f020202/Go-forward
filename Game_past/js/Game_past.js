let container = document.querySelector("#container");
let character = document.querySelector("#character");
let crystalball = document.querySelector("#crystalball");
let block = document.querySelector("#block");
let monster = document.querySelector("#monster");
let road = document.querySelector("#road");
let score = document.querySelector("#score");
let gameOver = document.querySelector("#gameOver");
let crystalballCount = 0; // Count crystalball appearances

// Life elements
let life1 = document.querySelector("#life1");
let life2 = document.querySelector("#life2");
let life3 = document.querySelector("#life3");

let lives = [life1, life2, life3];  // array to keep track of lives

// declaring variable for score
let interval = null;
let playerScore = 0;

// Collision state
let collisionState = false;

// Game state
let gameRunning = false;

// start Game
window.addEventListener("keydown", (start) => {
    if (start.code == "Space" && !gameRunning && lives.length > 0) {  // Check if the game is not running
        crystalballCount = 0;
        if (lives.length <= 0) {
            // reset lives
            lives = [life1, life2, life3];  // Reset the lives
            lives.forEach(life => life.style.display = "block");
        }
        road.firstElementChild.style.animation = "roadAnimate 2.5s linear infinite";
        gameOver.style.display = "none";
        block.classList.add("blockActive");
        monster.classList.add("monsterActive");
        crystalball.classList.add("crystalballActive");

        // score
        playerScore = 0;
        score.innerHTML = `Score <b>${playerScore}</b>`;
        collisionState = false;
        gameRunning = true;
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

let isCounted = false; // new flag

// Flag to check if the score was already added
let scoreAdded = false;

// Check game status
function checkGameStatus() {
    if (crystalballCount >= 5) {  // When all 10 crystalballs have appeared
        block.classList.remove("blockActive");
        crystalball.classList.remove("crystalballActive");  // Stop the crystalball
        road.firstElementChild.style.animation = "none";
        clearInterval(result);
        gameRunning = false;
        if (playerScore >= 5) {  // If score is 10 or more
            document.getElementById("gameclear").style.display = "block";

        } else {  // If score is less than 10
            document.getElementById("stage_success").style.display = "block";
        }
        // Reset block, crystalball and character animations
        block.style.animation = "";
        crystalball.style.animation = "";
        character.style.animation = "";

        // Set the game over flag
        gameRunning = true;
    }
}
function pauseGame() {
    road.firstElementChild.style.animation = "none"; // 도로 애니메이션 중지
    block.classList.remove("blockActive"); // 블록 애니메이션 중지
    crystalball.classList.remove("crystalballActive"); // 크리스탈볼 애니메이션 중지
    clearInterval(result); // 게임 로직 중지
    gameRunning = false; // 게임 상태를 중지로 설정
}

function showExclamationAndRedirect() {
    pauseGame(); // 게임을 일시 중지
    let exclamation = document.querySelector("#exclamation");
    exclamation.style.display = "block"; // 느낌표 보이기
    setTimeout(() => {
        exclamation.style.display = "none"; // 느낌표 숨기기
        window.location.href = "new_page.html"; // 새 페이지로 이동
    }, 3000); // 3초 후 실행
}


//'Game Over' if 'Character' hit The 'Block' 
let result = setInterval(() => {
    let characterBottom = parseInt(getComputedStyle(character).getPropertyValue("bottom"));
    let characterTop = parseInt(getComputedStyle(character).getPropertyValue("top"));
    let blockLeft = parseInt(getComputedStyle(block).getPropertyValue("left"));
    let crystalballLeft = parseInt(getComputedStyle(crystalball).getPropertyValue("left"));
    let monsterLeft = parseInt(getComputedStyle(monster).getPropertyValue("left")); // monster의 left 위치

    // Increase the crystalball count when it starts to appear from the right side
    if (crystalballLeft <= 0 && !isCounted && crystalballCount < 5) {
        crystalballCount++;
        console.log(crystalballCount);
        isCounted = true;
    }
    // 게임 중 느낌표를 보여줄 조건이 충족되면 위 함수를 호출
    // 예: 블록과 캐릭터가 충돌하는 경우
    // if (monsterLeft < 50 && monsterLeft > 20 && characterBottom < 90) {
    //     showExclamationAndRedirect();
    // }

    // Reset the flag when the next crystalball appears
    if (crystalballLeft > 0) {
        isCounted = false;
    }

    // Stop the crystalball when the count reaches 10
    if (crystalballCount >= 5) {
        checkGameStatus();  // Check the game status
    }

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
            crystalball.classList.remove("crystalballActive");  // Stop the crystalball
            road.firstElementChild.style.animation = "none";
            clearInterval(interval);
            playerScore = 0;
            gameRunning = false;
        }
    }

    // When character and crystalball collide, increase the score by 1
    if (characterTop <= 250 && crystalballLeft >= 80 && crystalballLeft <= 100) {
        if (!scoreAdded) {
            playerScore += 1; // increment score by 1
            score.innerHTML = `Score <b>${playerScore}</b>`; // Update the score on the screen
            scoreAdded = true;
        }
    } else {
        scoreAdded = false; // Reset the score added flag when not colliding
    }
}, 10);
