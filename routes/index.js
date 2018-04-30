var express = require('express');
var router = express.Router();

//db.dropDatabase();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/keyboard', (req, res) => {
    const menu = {
        type: 'buttons',
        buttons: ["뉴스 보기", "저장 목록", "즐겨찾기"]
    };
res.set({
    'content-type': 'application/json'
}).send(JSON.stringify(menu));
});


router.post('/message', (req, res) => {
    const _obj = {
        user_key: req.body.user_key,
        type: req.body.type,
        content: req.body.content
    };

    const massage = {
        "message": {
            "text": '',
        },
        "keyboard": {
            "type": "",
        }
    };

    switch(_obj.content) {
        case '뉴스 보기' :
            massage.message.text = '뉴스보기 실행';
            massage.keyboard.type = 'buttons';
            massage.keyboard.buttons = [
                "장르",
                "언론사",
                "키워드 검색",
            ];
            break;
        case '저장 목록' :
            massage.message.text = '저장목록 실행';
            break;
        case '즐겨 찾기' :
            massage.message.text = '즐겨찾기 실행';
            break;

        case '장르' :
            massage.message.text = '장르 선택';
            massage.keyboard.type = 'buttons';
            massage.keyboard.buttons = [
                "속보",
                "정치",
                "경제",
                "사회",
                "생활/문화",
                "세계",
                "IT/과학",
            ];
            break;
        case '언론사' :
            massage.message.text = '언론사 선택';
            massage.keyboard.type = 'buttons';
            massage.keyboard.buttons = [
                "경향",
                "국민",
                "동아",
                "문화",
                "서울",
                "세계",
                "조선",
                "중앙",
                "한겨레",
                "한국",
            ];
            break;
        case '키워드 검색' :
            massage.message.text = '입력해 주세용';
            massage.keyboard.type = 'text';
            break;
    }

res.set({'content-type': 'application/json'}).send(JSON.stringify(massage));
});



router.post('/friend', (req, res) => {
    const user_key = req.body.user_key;
    console.log(`${user_key}님이 쳇팅방에 참가했습니다.`);

    res.set({
        'content-type': 'application/json'
    }).send(JSON.stringify({success:true}));
});



router.delete('/friend', (req, res) => {
    const user_key = req.body.user_key;
    console.log(`${user_key}님이 쳇팅방을 차단했습니다.`);

    res.set({
        'content-type': 'application/json'
    }).send(JSON.stringify({success:true}));
});



router.delete('/chat_room/:user_key', (req, res) => {
    const user_key = req.params.user_key;
    console.log(`${user_key}님이 쳇팅방에서 나갔습니다.`);
    res.set({
        'content-type': 'application/json'
    }).send(JSON.stringify({success:true}));
});
module.exports = router;
