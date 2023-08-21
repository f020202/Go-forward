let container = document.querySelector("#container");
let character = document.querySelector("#character");
let crystalball = document.querySelector("#crystalball");
let block = document.querySelector("#block");
let monster = document.querySelector("#monster");
let road = document.querySelector("#road");
let score = document.getElementById('score');
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
let dblife = 0; // dblife 변수 초기화

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

// UI 업데이트 함수 정의
async function updateUI() {
    const lifeValue = await getLifeFromDB();
    dblife = lifeValue;
    updateLives();

    if (lives.length <= 0) {
        lives = [life1, life2, life3];
        lives.forEach(life => life.style.display = "block");
    }

    road.firstElementChild.style.animation = "roadAnimate 3.5s linear infinite";
    gameOver.style.display = "none";
    block.classList.add("blockActive");
    monster.classList.add("monsterActive");
    crystalball.classList.add("crystalballActive");
    
}

// 웹 페이지 로딩 시 UI 업데이트
updateUI();

// start Game
// window.addEventListener("keydown", async (start) => {
//     if (gameBlocked) return;
//     if (start.code == "Space" && !gameRunning && lives.length > 0) {  // Check if the game is not running
//         crystalballCount = 0;

//         collisionState = false;
//         gameRunning = true;

//         // Get the life value from the database
//         const lifeValue = await getLifeFromDB();

//         // Update lives array and the UI based on the life value
//         dblife = lifeValue;
//         updateLives();

//         if (lives.length <= 0) {
//             lives = [life1, life2, life3];
//             lives.forEach(life => life.style.display = "block");
//         }

//         road.firstElementChild.style.animation = "roadAnimate 3.5s linear infinite";
//         gameOver.style.display = "none";
//         block.classList.add("blockActive");
//         monster.classList.add("monsterActive");
//         crystalball.classList.add("crystalballActive");

//         // Load the player score from data and display it
//         playerScore = data.score;
//         saveScoreToDB(playerScore);
//         score.innerHTML = `Score <b>${playerScore}</b>`;

    

//         // Teachable Machine Pose Model 초기화
//         await init();

//     }
// });

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

// 사용자 ID 가져오기 후에 점수를 가져옵니다
fetch('/get-userID')
    .then(response => response.json())
    .then(async data => {
        if (data.success) {
            userID = data.userID;
            localStorage.setItem('userID', userID);

            // 사용자 ID가 성공적으로 가져온 후에 점수를 가져옵니다
            await getScoreFromDB();
        } else {
            console.error("Error getting the userID:", data.message);
        }
    })
    .catch(error => {
        console.error('Error while trying to fetch userID:', error);
    });

// 사용자 ID 가져오기 후에 life 값을 가져오고 lives 배열 업데이트
fetch('/get-userID')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            userID = data.userID;
            localStorage.setItem('userID', userID);

            // 사용자 ID가 성공적으로 가져온 후에 life 값을 가져옵니다
            getLifeFromDB()
                .then(lifeValue => {
                    dblife = lifeValue; // 가져온 life 값을 업데이트
                    console.log(dblife); // 가져온 life 값을 출력해보기 위한 로그

                    // dblife 값에 따라 lives 배열 업데이트
                    updateLives();
                })
                .catch(error => {
                    console.error('Error while getting life from DB:', error);
                });
        } else {
            console.error("Error getting the userID:", data.message);
        }
    })
    .catch(error => {
        console.error('Error while trying to fetch userID:', error);
    });


function updateLives() {
    // Reset lives
    lives = [life1, life2, life3];
    lives.forEach(life => life.style.display = "block");

    // Hide lives based on dblife value
    for (let i = lives.length - 1; i >= lives.length - (3 - dblife); i--) {
        let currentLife = lives[i];
        currentLife.style.display = "none";
    }
}

async function getLifeFromDB() {
    try {
        let response = await fetch('/get-life');

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        let data = await response.json();

        if (data.success) {
            console.log("User's life:", data.life);

            // 받아온 life 값을 반환합니다.
            return data.life;
        } else {
            console.error(data.message);
            return 0; // 실패 시 기본 값 또는 적절한 값으로 설정합니다.
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error.message);
        return 0; // 오류 시 기본 값 또는 적절한 값으로 설정합니다.
    }
}

async function decreaseLife() {
    let url = "/update-life";
    try {
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });      
        
        if (!response.ok) {
            throw new Error("Failed to update life in DB");
        }
        
        let data = await response.json();

        if (data.success) {
            console.log(data.message);
            updateLives(); // 화면에 표시된 생명 수를 업데이트합니다.
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error("Error updating life in database:", error);
    }
    await updateLives();
}

async function getScoreFromDB() {
    // 점수를 표시할 DOM 요소 참조
    const score = document.getElementById('score');

    try {
        let response = await fetch('/get-score');

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        let data = await response.json();

        if (data.success) {
            console.log("User's score:", data.score);

            // 받아온 점수를 웹 페이지에 표시합니다.
            let playerScore = data.score;
            score.innerHTML = `Score <b>${playerScore}</b>`;
            return playerScore;  // 필요한 경우 값을 반환할 수 있습니다.
        } else {
            console.error(data.message);
            return null;  // 오류 시 null 값을 반환하거나 다른 오류 처리 방식을 선택할 수 있습니다.
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error.message);
        return null;  // 오류 시 null 값을 반환합니다.
    }
}



async function checkGameStatus() {
    let scoreFromDB = await getScoreFromDB();
    if (scoreFromDB >= 5) {  // 데이터베이스로부터 가져온 점수가 5 이상일 때
        block.classList.remove("blockActive");
        crystalball.classList.remove("crystalballActive");
        monster.classList.remove("monsterActive");  // 몬스터 애니메이션 일시 중지
        road.firstElementChild.style.animation = "none";
        clearInterval(result);
        gameRunning = false;
    
        // 게임 클리어 메시지를 표시합니다
        document.getElementById("gameclear").style.display = "block";
        
        // menu2 요소를 표시합니다
        document.getElementById("menu2").style.display = "block";
        
        // 애니메이션을 초기화합니다
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
    monster.classList.remove("monsterActive");  // 몬스터 애니메이션 일시 중지
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
    fetch('/update-crystal-past', {
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

function OnlysaveScoreToDB(score) {
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

function saveScoreToDB(score) {
    fetch('/save-score-history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score: score }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(data.message);
            } else {
                console.error('Error:', data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}


function showplus() {
    let plus = document.querySelector("#plus");
    plus.style.display = "block"; // 플러스 보이기
    setTimeout(() => {
        plus.style.display = "none"; // 플러스 숨기기
    }, 500); // 1초 후 실행
}

// lives 배열 초기화 부분
function initializeLives() {
    for (let i = 0; i < 3; i++) {
        if (i < dblife) {
            lives[i].style.display = "block";
        } else {
            lives[i].style.display = "none";
        }
    }
}



document.addEventListener('DOMContentLoaded', getScoreFromDB);

//'Game Over' if 'Character' hit The 'Block' 
let result = setInterval(async () => {
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
        // 캐릭터와 투명블록과 충돌한 경우의 로직
        if (monsterLeft < 50 && monsterLeft > 20 && characterBottom < 90) {
            showExclamationAndRedirect();
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
    
            if (dblife > 0) {
                decreaseLife();
                dblife--;
                if (dblife >= 0) { // dblife가 0 이상인 경우에만 UI 숨기기를 수행
                    lives[dblife].style.display = "none"; // dblife 값을 기반으로 해당 생명 UI 숨기기
                }
            }
    
            collisionState = true;
            setTimeout(() => {
                character.classList.remove('bounce', 'redFlash');
                collisionState = false;
            }, 1000);
            
            if (dblife <= 0) {
                gameOver.style.display = "block";
                block.classList.remove("blockActive");
                crystalball.classList.remove("crystalballActive");
                monster.classList.remove("monster");
                road.firstElementChild.style.animation = "none";
                clearInterval(interval);
                playerScore = 0;
                gameRunning = false;
                saveScoreToDB(playerScore);
                playerScore = 0;
                // "gameOver" div와 함께 "menu" div를 표시합니다
                menu.style.display = "block";
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
            scoreAdded = true;
            let fetchedScore = await getScoreFromDB();
            if (fetchedScore !== null) {  // DB에서 값 가져오기에 실패하면 계속 진행하지 않습니다.
                fetchedScore++;
                console.log("Player score before sending:", fetchedScore);
                score.innerHTML = `Score <b>${fetchedScore}</b>`;
                OnlysaveScoreToDB(fetchedScore);
                scoreAdded = true;

                // 캐릭터와 수정구가 충돌했을 때
                showplus();
                if (fetchedScore >= 5) { // 충돌 횟수가 5회 이상이면 게임 상태 확인
                    checkGameStatus();
                }
            }
        }
    } else {
        scoreAdded = false;
    }
}, 10);