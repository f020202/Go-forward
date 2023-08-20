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
app.use('/Game_future_level', express.static(path.join(__dirname, 'Game_future_level')));
app.use('/Game_past', express.static(path.join(__dirname, 'Game_past')));
app.use('/Game_past_2', express.static(path.join(__dirname, 'Game_past_2')));
app.use('/Game_past_level', express.static(path.join(__dirname, 'Game_past_level')));
app.use('/Game_present', express.static(path.join(__dirname, 'Game_present')));
app.use('/Game_present_level', express.static(path.join(__dirname, 'Game_present_level')));
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

app.post('/save-score-history', (req, res) => {
  const userID = req.session.userID; // 로그인된 사용자의 ID를 세션에서 가져옵니다.
  
  // 현재 점수 값을 불러옵니다.
  var fetchSql = `SELECT crystal_past FROM userTable WHERE id = ?`;
  db.query(fetchSql, [userID], function(error, results) {
      if (error) {
          console.error("Error fetching the current score:", error);
          return res.status(500).json({ success: false, message: 'Server error' });
      }

      // 현재 점수 값에 +1을 합니다.
      const currentScore = results[0].crystal_past;
      const newScore = currentScore + 1;

      // 업데이트 쿼리
      var updateSql = `UPDATE userTable SET crystal_past = ? WHERE id = ?`;
      db.query(updateSql, [newScore, userID], function(error, results) {
          if (error) {
              console.error("Error saving the score:", error);
              return res.status(500).json({ success: false, message: 'Server error' });
          }
          console.log("Score updated:", newScore);
          return res.json({ success: true, message: 'Score updated successfully.' });
      });
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

app.get('/get-score', (req, res) => {
  if (!authCheck.isOwner(req, res)) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const currentUser = req.session.nickname;
  const sql = `SELECT crystal_past FROM usertable WHERE username = ?`;
  
  db.query(sql, [currentUser], function(error, results) {
    if (error) {
        console.error('Error fetching the score:', error);
        return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length > 0) {
        const score = results[0].crystal_past;
        res.json({ success: true, score });
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
  });
});

app.get('/get-life', (req, res) => {
  if (!authCheck.isOwner(req, res)) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const currentUser = req.session.nickname;
  const sql = `SELECT life FROM usertable WHERE username = ?`;

  db.query(sql, [currentUser], function(error, results) {
    if (error) {
      console.error('Error fetching the life value:', error);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length > 0) {
      const life = results[0].life;
      res.json({ success: true, life });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  });
});

app.post('/save-lives', (req, res) => {
  const lives = req.body.lives;
  const userID = req.session.userID; // 로그인된 사용자의 ID를 세션에서 가져옵니다.
  
  var sql = `UPDATE userTable SET life = ? WHERE id = ?`; // 테이블의 컬럼명은 'life'로 변경
  db.query(sql, [lives, userID], function(error, results) { // 변수명을 'lives'로 통일
      if (error) {
          console.error("Error saving the lives:", error);
          return res.status(500).json({ success: false, message: 'Server error' });
      }
      console.log("Lives saved:", lives);
      return res.json({ success: true, message: 'Lives saved successfully.' });
  });
});

app.post('/update-life', async (req, res) => {
  const userID = req.session.userID; // 로그인된 사용자의 ID를 세션에서 가져옵니다.

  // 먼저 현재의 life 값을 불러옵니다.
  var fetchSql = `SELECT life FROM userTable WHERE id = ?`;
  db.query(fetchSql, [userID], function(error, results) {
      if (error) {
          console.error("Error fetching the current life:", error);
          return res.status(500).json({ success: false, message: 'Server error' });
      }

      // 현재 life 값에서 1을 뺍니다.
      const currentLife = results[0].life;
      const newLife = currentLife - 1;

      // 업데이트 쿼리를 실행하여 life 값을 갱신합니다.
      var updateSql = `UPDATE userTable SET life = ? WHERE id = ?`;
      db.query(updateSql, [newLife, userID], function(error, results) {
          if (error) {
              console.error("Error updating the life:", error);
              return res.status(500).json({ success: false, message: 'Server error' });
          }
          console.log("Life updated:", newLife);
          return res.json({ success: true, message: 'Life updated successfully.' });
      });
  });
});




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})