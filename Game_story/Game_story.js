
"use strict";

const content = "지금은 2283년. 과거, 현재, 미래라는 세 시대는 각각 서로 다른 환경과 문화를 가지고 있다. 시간을 넘나드는 수정구를 통해 캐시는 세 시대 간의 연결고리를 발견하고. 각 시대에서 마주치는 몬스터를 물리치며 세계를 구한다.";
const text = document.querySelector(".text");
let sentenceIndex = 0;
let charIndex = 0;

function sleep(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
}


async function typing() {
    const sentence = content.split('. ')[sentenceIndex]; // 문장별로 나눔
    const char = sentence[charIndex];

    text.textContent += char;

    charIndex++;

    if (charIndex < sentence.length) {
        await sleep(50); // 문자 간의 간격
        typing();
    } else {
        await sleep(700); // 문장이 모두 출력된 후 딜레이
        charIndex = 0;
        sentenceIndex++;

        if (sentenceIndex >= content.split('. ').length) {
            sentenceIndex = 0;
            text.textContent = "";
            await sleep(3000);
        } else {
            await sleep(500);
            text.textContent = "";
            typing();
        }
    }
}

typing();