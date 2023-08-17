const player = document.getElementById("player");
const lock1 = document.getElementById("lock1");
const lock2 = document.getElementById("lock2");
const lock3 = document.getElementById("lock3");
let currentPosition = 0;
const maxPosition = 310 * 3; // 오른쪽으로 3칸
const minPosition = 0; // 초기 위치

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" && currentPosition < maxPosition) {
        currentPosition += 310;
        player.style.transform = `translateX(${currentPosition}px)`;
    } else if (event.key === "ArrowLeft" && currentPosition > minPosition) {
        currentPosition -= 310;
        player.style.transform = `translateX(${currentPosition}px)`;
    } else if (event.key === " ") {
        // 스페이스바를 눌렀을 때의 처리
        if ((currentPosition === 310 && window.getComputedStyle(lock1).visibility === 'visible') ||
            (currentPosition === 620 && window.getComputedStyle(lock2).visibility === 'visible') ||
            (currentPosition === 930 && window.getComputedStyle(lock3).visibility === 'visible')) {
            // Do nothing since the lock is visible
        } else {
            window.location.href = "../Game_future/Game_future.html";
        }
    }
});
