var express = require('express');
var router = express.Router();
var client = require('cheerio-httpcli');
var request = require('request');
var fs = require('fs');
var urlType = require('url');

var savedir = __dirname + '/img';
if(!fs.existsSync(savedir)){
    fs.mkdirSync(savedir);
}

//URL 지정
var url = 'https://ko.wikipedia.org/wiki/' + encodeURIComponent('강아지');
var param = {};

//html 파일 획득
client.fetch(url, param, function(err, $, res){
    if(err) {console.log(err); return;}
    //img 링크 추출 후 함수 실행
    $('img').each(function(idx){
        var src = $(this).attr('src');
        //상대 경로 -> 절대 경로
        src = urlType.resolve(url, src);

        //저장 파일 이름 설정
        var fname = urlType.parse(src).pathname;
        fname = savedir + '/' + fname.replace(/[^a-zA-Z0-9\.]+/g, '_');
        //다운로드
        request(src).pipe(fs.createWriteStream(fname));
    });
    console.log(res);
});
function getNewsbyPress(press){
    url = 'http://news.naver.com/main/main.nhn?mode=LSD&mid=shm&sid1=10' + press;
}



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

    const message = {
        "message": {
            "text": '',
        },
        "keyboard": {
            "type": "",
        }
    };

    switch(_obj.content) {
        case '뉴스 보기' :
            message.message.text = '뉴스보기 실행';
            message.keyboard.type = 'buttons';
            message.keyboard.buttons = [
                "장르",
                "언론사",
                "키워드 검색",
            ];
            break;
        case '저장 목록' :
            message.message.text = '저장목록 실행';
            break;
        case '즐겨 찾기' :
            message.message.text = '즐겨찾기 실행';
            break;

        case '장르' :
            message.message.text = '장르 선택';
            message.keyboard.type = 'buttons';
            message.keyboard.buttons = [
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
            message.message.text = '언론사 선택';
            message.keyboard.type = 'buttons';
            message.keyboard.buttons = [
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
        case '경향' :
            message.message.text = '테스트';
            break;
        case '키워드 검색' :
            message.message.text = '입력해 주세용';
            message.keyboard.type = 'text';
            break;
    }

res.set({'content-type': 'application/json'}).send(JSON.stringify(message));
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
