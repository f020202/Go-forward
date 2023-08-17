const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const FileStore = require('session-file-store')(session);
const path = require('path');
const db = require('./db.js');
const authRouter = require('./auth');
const authCheck = require('./authCheck.js');
const template = require('./template.js');

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: false }));

// 정적 파일 제공 설정
app.use('/Event', express.static(path.join(__dirname, 'Event')));
app.use('/Game_future', express.static(path.join(__dirname, 'Game_future')));
app.use('/Game_past', express.static(path.join(__dirname, 'Game_past')));
app.use('/Game_present', express.static(path.join(__dirname, 'Game_present')));
app.use('/Main', express.static(path.join(__dirname, 'Main')));
app.use('/Map', express.static(path.join(__dirname, 'Map')));


app.use(session({
  secret: '~~~',  // 원하는 문자 입력
  resave: false,
  saveUninitialized: true,
  store:new FileStore(),
}));

app.use(express.json());

app.get('/', (req, res) => {
  if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
    res.redirect('/auth/login');
    return false;
  } else {  // 로그인 되어있으면 메인 페이지로 이동시킴
    res.redirect('../Main/Main.html');
    return false;
  }
})

// 인증 라우터
app.use('/auth', authRouter);

// 메인 페이지
app.get('/main', (req, res) => {
  if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
    res.redirect('/auth/login');
    return false;
  }

  var currentUser = req.session.nickname;  // 현재 로그인한 사용자의 이름
  var sql = `SELECT crystal_past FROM usertable WHERE username = ?`;
  
  db.query(sql, [currentUser], function(error, results) {
    if (error) {
        console.error('Error fetching the score:', error);
        res.status(500).send('Database error');
        return;
    }

    if (results.length > 0) {
        var score = results[0].crystal_past;
        var scoreDisplay = `<div>Your Score: ${score}</div>`;
        var html = template.HTML('Welcome',
          `<hr>
            <h2>메인 페이지에 오신 것을 환영합니다</h2>
            <p>로그인에 성공하셨습니다.</p>
            ${scoreDisplay}`,
          authCheck.statusUI(req, res)
        );
        res.send(html);
    } else {
        res.status(404).send('User not found');
    }
  });
})

app.post('/save-score', (req, res) => {
  const score = req.body.score;
  const userID = req.session.userID; // 로그인된 사용자의 ID를 세션에서 가져옵니다.
  
  var sql = `UPDATE userTable SET crystal_past = ? WHERE id = ?`;
  db.query(sql, [score, userID], function(error, results) {
      if (error) {
          console.error("Error saving the score:", error);
          return res.status(500).json({ success: false, message: 'Server error' });
      }
      console.log("Score saved:", score);
      return res.json({ success: true, message: 'Score saved successfully.' });
  });
});

app.post('/update-crystal-past', (req, res) => {
  const userID = req.session.userID; // 로그인된 사용자의 ID를 세션에서 가져옵니다.
  const { crystalValue } = req.body;

  var sql = `UPDATE userTable SET crystal_past = ? WHERE id = ?`;
  db.query(sql, [crystalValue, userID], function(error, results) {
      if (error) {
          console.error("Error updating the crystal value:", error);
          return res.status(500).json({ success: false, message: 'Server error' });
      }
      return res.json({ success: true, message: 'Value updated successfully!' });
  });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})