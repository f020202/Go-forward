let container = document.querySelector("#container");
let character = document.querySelector("#character");
let crystalball = document.querySelector("#crystalball");
let block = document.querySelector("#block");
let monster = document.querySelector("#monster");
let road = document.querySelector("#road");
let score = document.querySelector("#score");
let gameOver = document.querySelector("#gameOver");
let crystalballCount = 0; // Count crystalball appearances

let userID; // 사용자 ID를 저장할 변수
let crystalValue; // 어떤 방법으로든 crystalValue를 가져옵니다

// 사용자 ID 가져오기
fetch('/get-userID')
.then(response => response.json())
.then(data => {
    if (data.success) {
        userID = data.userID;
        localStorage.setItem('userID', userID);
    } else {
        console.error("Error getting the userID:", data.message);
    }
})
.catch(error => {
    console.error('Error while trying to fetch userID:', error);
});

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

let gameBlocked = false; // 게임이 차단되었는지 확인하는 플래그

function blockGame() {
    gameBlocked = true; // 게임 차단
    road.firstElementChild.style.animationPlayState = "paused";  // 도로 애니메이션 일시 중지
    block.classList.remove("blockActive");  // 블록 애니메이션 일시 중지
    crystalball.classList.remove("crystalballActive");  // 크리스탈볼 애니메이션 일시 중지
    monster.classList.remove("monsterActive");  // 몬스터 애니메이션 일시 중지
    // 이 부분에 게임을 중지하거나 사용자 입력을 차단하는 추가 코드를 넣을 수 있습니다.
}

function unblockGame() {
    gameBlocked = false;
    road.firstElementChild.style.animationPlayState = "running";  // 도로 애니메이션 재개
    block.classList.add("blockActive");  // 블록 애니메이션 시작
    crystalball.classList.add("crystalballActive");  // 크리스탈볼 애니메이션 시작
    monster.classList.add("monsterActive");  // 몬스터 애니메이션 시작
    // 이 부분에 게임 재시작 또는 다른 관련 동작을 수행하는 코드를 넣을 수 있습니다.
}

// start Game
window.addEventListener("keydown", async (start) => {
    if (gameBlocked) return;
    if (start.code == "Space" && !gameRunning && lives.length > 0) {  // Check if the game is not running
        crystalballCount = 0;
        if (lives.length <= 0) {
            // reset lives
            lives = [life1, life2, life3];  // Reset the lives
            lives.forEach(life => life.style.display = "block");
        }
        road.firstElementChild.style.animation = "roadAnimate 3.5s linear infinite";
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

        // Teachable Machine Pose Model 초기화
        await init();
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

async function init() {
    // 로딩 인디케이터 표시
    blockGame();
    showLoadingIndicator();

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const size = 200;
    const flip = true;
    webcam = new tmPose.Webcam(size, size, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    const canvas = document.getElementById("canvas");
    canvas.width = size; canvas.height = size;
    ctx = canvas.getContext("2d");
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    // 로딩 인디케이터 숨기기
    hideLoadingIndicator();
    unblockGame();
}

function showLoadingIndicator() {
    // 예: 로딩 인디케이터 DOM 요소를 화면에 표시
    document.getElementById("loadingIndicator").style.display = "block";
}

function hideLoadingIndicator() {
    // 로딩 인디케이터 DOM 요소를 화면에서 숨김
    document.getElementById("loadingIndicator").style.display = "none";
}

let isCounted = false; // new flag

// Flag to check if the score was already added
let scoreAdded = false;

let crystalballHitCount = 0; // 캐릭터가 수정구와 충돌한 횟수를 카운트

// Check game status
function checkGameStatus() {
    if (crystalballHitCount >= 5) {  // 캐릭터와 수정구가 5번 충돌했을 때
        block.classList.remove("blockActive");
        crystalball.classList.remove("crystalballActive");
        road.firstElementChild.style.animation = "none";
        clearInterval(result);
        gameRunning = false;
        if (playerScore >= 5) {
            document.getElementById("gameclear").style.display = "block";
        }
        block.style.animation = "";
        crystalball.style.animation = "";
        character.style.animation = "";
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
    var userID = localStorage.getItem('userID');  // 로컬 스토리지에서 userID 가져오기

    pauseGame();
    let exclamation = document.querySelector("#exclamation");
    exclamation.style.display = "block";
    setTimeout(() => {
        exclamation.style.display = "none";
        window.location.href = "../Event/teachable_machine_pose/index.html"; // 새 페이지로 이동
    }, 3000);

    fetch(`/get-username?id=${userID}`)
    .then(response => response.json())
    .then(data => {
        console.log("data.success:", data.success);
        if (data.success) {
            let userName = data.username;
            console.log("User Name:", userName);

            saveScoreToDB(playerScore);
            console.log("Attempting to update score in database for user:", userName, "with score:", playerScore);

            updateCrystalValue(playerScore); // 크리스탈 값을 playerScore로 업데이트
        } else {
            console.log('User not found');
        }
    })
    .catch(error => {
        console.error('Error fetching the user:', error);
    });
}


function updateCrystalValue(value) {
    fetch('/update-crystal-present', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userID, crystalValue: value })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log(data.message);
        } else {
            console.error("Error updating the crystal value:", data.message);
        }
    })
    .catch(error => {
        console.error('Error updating the crystal value:', error.message);
    });
}

function saveScoreToDB(score) {
    fetch('/save-score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ score: score })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Score successfully saved:', data.message);
        } else {
            console.error("Error saving the score:", data.message);
        }
    })
    .catch(error => {
        console.error('Error while trying to save score:', error);
    });
}

function showplus() {
    let plus = document.querySelector("#plus");
    plus.style.display = "block"; // 플러스 보이기
    setTimeout(() => {
        plus.style.display = "none"; // 플러스 숨기기
    }, 500); // 1초 후 실행
}

//생명저장함수
function saveLivesToDB(lives) {
    // API 엔드포인트 정의
    let url = "/save-lives";

    // 전송될 데이터
    let data = {
        lives: lives
    };

    // fetch API 호출
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log("생명 수가 성공적으로 저장되었습니다:", data);
    })
    .catch((error) => {
        console.error("생명 수 저장 오류:", error);
    });
}


//'Game Over' if 'Character' hit The 'Block' 
let result = setInterval(() => {
    let characterBottom = parseInt(getComputedStyle(character).getPropertyValue("bottom"));
    let blockLeft = parseInt(getComputedStyle(block).getPropertyValue("left"));
    let monsterLeft = parseInt(getComputedStyle(monster).getPropertyValue("left")); // monster의 left 위치

    let characterRect = character.getBoundingClientRect();
    let blockRect = block.getBoundingClientRect();
    let crystalballRect = crystalball.getBoundingClientRect();
    let monsterRect = monster.getBoundingClientRect();

    // 캐릭터와 다른 객체들의 위치 정보를 사용한 충돌 검사
    if (
        characterRect.left < monsterRect.right &&
        characterRect.right > monsterRect.left &&
        characterRect.top < monsterRect.bottom &&
        characterRect.bottom > monsterRect.top
    ) {
        // 캐릭터와 몬스터가 충돌한 경우의 로직
        if (monsterLeft < 50 && monsterLeft > 20 && characterBottom < 90) {
            showExclamationAndRedirect();
            saveLivesToDB(lives.length);
        }
    }

    if (
        characterRect.left < blockRect.right &&
        characterRect.right > blockRect.left &&
        characterRect.top < blockRect.bottom &&
        characterRect.bottom > blockRect.top
    ) {
        if (!collisionState && characterBottom <= 90 && blockLeft >= 20 && blockLeft <= 50) {
            character.classList.add('bounce', 'redFlash');
            let lastLife = lives.pop();
            lastLife.style.display = "none";
            collisionState = true;
            setTimeout(() => {
                character.classList.remove('bounce', 'redFlash');
                collisionState = false;
            }, 1000);
            if (lives.length <= 0) {
                gameOver.style.display = "block";
                saveLivesToDB(lives.length);
                block.classList.remove("blockActive");
                crystalball.classList.remove("crystalballActive");
                road.firstElementChild.style.animation = "none";
                clearInterval(interval);
                playerScore = 0;
                gameRunning = false;
                saveScoreToDB(playerScore);
                playerScore = 0;
            }
        }

    }

    if (
        characterRect.left < crystalballRect.right &&
        characterRect.right > crystalballRect.left &&
        characterRect.top < crystalballRect.bottom &&
        characterRect.bottom > crystalballRect.top
    ) {
        if (!scoreAdded) {
            playerScore += 1;
            score.innerHTML = `Score <b>${playerScore}</b>`;
            //updateCrystalValue(1); // 크리스탈볼과 캐릭터가 충돌할 때 크리스탈 값을 1로 업데이트
            saveScoreToDB(playerScore);
            console.log("Player score before sending:", playerScore);
            scoreAdded = true;
            // 캐릭터와 수정구가 충돌했을 때
            showplus();
            crystalballHitCount++;  // 충돌 횟수 증가
            if (crystalballHitCount >= 5) { // 충돌 횟수가 5회 이상이면 게임 상태 확인
                checkGameStatus();
                saveScoreToDB(playerScore);
            }
        }
    } else {
        scoreAdded = false;
    }
}, 10); 