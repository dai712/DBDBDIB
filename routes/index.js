var express = require('express');
var router = express.Router();
var cheerio = require('cheerio');
var request = require('request');
//var fs = require('fs');
//var urlType = require('url');
var iconv = require('iconv-lite');

/*
var savedir = __dirname + '/img';
if(!fs.existsSync(savedir)){
    fs.mkdirSync(savedir);
}
*/

var client_id = 'uD_8GWD3pP_KXJJRKecZ';
var client_secret = '7OTLr047fX';
router.get('/search/news', function (req, res) {                                                            //네이버 뉴스 API
    var api_url = 'https://openapi.naver.com/v1/search/news?query=' + encodeURI('속보');
    var request = require('request');
    var options = {
        url: api_url,
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
    request.get(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
            res.end(body);
        } else {
            res.status(response.statusCode).end();
            console.log('error = ' + response.statusCode);
        }
    });
});
                                                                                            //크롤링
url_news = 'http://news.naver.com/main/main.nhn?mode=LSD&mid=shm&sid1=102';
request.get({
    url: url_news,
    headers: { "User-Agent": "Mozilla/5.0" } ,
    encoding: null
    },function(err, res, body){
   if(err) console.log(err);

    let titles = [];
    let urls = [];

    var strContents = new Buffer(body);
    var $ = cheerio.load(iconv.decode(strContents, 'EUC-KR').toString());


    for(i = 1 ; i < 6 ; i++) {
        var crawSelector = '#main_content > div > div._persist > div:nth-child(1) > div:nth-child('+ i +') > div.cluster_body > ul > li:nth-child(1) > div.cluster_text';
        $(crawSelector).each(function(index, value){
            var title = $(this).find('a').text();
            var url = $(value).find('a').attr('href');
            titles.push(title);
            urls.push(url);
        });

    }

/*
    console.log('titles 1: ', titles[0]);
    console.log('titles 2: ',titles[1]);
    console.log('titles 3: ',titles[2]);
    console.log('titles 4: ',titles[3]);
    console.log('titles 5: ',titles[4]);

    console.log('urls 1 : ', urls[0]);
    console.log('urls 2 : ', urls[1]);
    console.log('urls 3 : ', urls[2]);
    */

});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/keyboard', (req, res) => {
    const menu = {
        type: 'buttons',
        buttons: ["뉴스 보기", "저장 목록", "즐겨찾기", "테스트용"]
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
        case '테스트용' :
            res.sendFile(__dirname+'\\Test.html');
            break;
        case '뉴스 보기' :
            res.sendFile(__dirname+'\\Test.html');
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
