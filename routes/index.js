var express = require('express');
var router = express.Router();
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

const fieldSelector1 = '#main_content > div > div._persist > div:nth-child(1) > div:nth-child(';
const fieldSelector2 = ') > div.cluster_body > ul > li:nth-child(1) > div.cluster_text';
const fieldImgSelector1 = '#main_content > div > div._persist > div:nth-child(1) > div:nth-child(';
const fieldImgSelector2 = ') > div.cluster_body > ul > li:nth-child(1) > div.cluster_thumb > div > a';
const breakingSelector1 = '#main_content > div.list_body.newsflash_body > ul.type06_headline > li:nth-child(';
const breakingSelector2 = ') > dl > dt:nth-child(2)';
const breakingImgSelector1 = '#main_content > div.list_body.newsflash_body > ul.type06_headline > li:nth-child(';
const breakingImgSelector2 = ') > dl > dt.photo > a';
const pressSelector1 = '#main_content > div.list_body.newsflash_body > ul.type06_headline > li:nth-child(';
const pressSelector2 = ') > dl';
const pressImgSelector1 = '#main_content > div.list_body.newsflash_body > ul.type06_headline > li:nth-child(';
const pressImgSelector2 = ') > dl';
let fieldURLs = [
    'http://news.naver.com/main/list.nhn?mode=LSD&mid=sec&sid1=001',                //속보
    'http://news.naver.com/main/main.nhn?mode=LSD&mid=shm&sid1=100',                //정치
    'http://news.naver.com/main/main.nhn?mode=LSD&mid=shm&sid1=101',                //경제
    'http://news.naver.com/main/main.nhn?mode=LSD&mid=shm&sid1=102',                //사회
    'http://news.naver.com/main/main.nhn?mode=LSD&mid=shm&sid1=103',                //생활/문화
    'http://news.naver.com/main/main.nhn?mode=LSD&mid=shm&sid1=104',                //세계
    'http://news.naver.com/main/main.nhn?mode=LSD&mid=shm&sid1=105',                //IT/과학
];
let pressURLS = [
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=032',                //경향
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=005',                //국민
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=020',                //동아
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=021',                //문화
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=081',                //서울
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=022',                //세계
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=023',                //조선
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=025',                //중앙
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=028',                //한겨레
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=469',                //한국
];
/*
var client_id = 'uD_8GWD3pP_KXJJRKecZ';
var client_secret = '7OTLr047fX';

router.get('/search/news', function (req, res) {                                                            //네이버 뉴스 API
    var api_url = 'https://openapi.naver.com/v1/search/news.json?query=' + encodeURI('속보');
    var request = require('request');
    var options = {
        url: api_url,
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
    request.get(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
            res.end(body);
            console.log(body.items);
        } else {
            res.status(response.statusCode).end();
            console.log('error = ' + response.statusCode);
        }
    });
});
*/
var titles = [];            //제목
var urls = [];              //url
var imgUrls = [];           //img url

function crawlingNews(targetURL, selector1, selector2, imgSelector1, imgSelector2 ){
        var request = require('request');
        request.get({
            url: targetURL,
            headers: { "User-Agent": "Mozilla/5.0" } ,
            encoding: null
        },function(err, res, body){
            if(err) console.log(err);

            var strContents = new Buffer(body);
            var $ = cheerio.load(iconv.decode(strContents, 'EUC-KR').toString());

            for(i = 1 ; i < 6 ; i++) {
                var crawSelector = selector1 + i + selector2;
                var crawImgSelector = imgSelector1 + i + imgSelector2;
                $(crawSelector).each(function(index, value){
                    if(targetURL === fieldURLs[0]){
                        var title = $(this).find('a').text().replace( /(\s*)/g, "");
                    } else {
                        var title = $(this).find('a').text();
                    }
                    var url = $(value).find('a').attr('href');
                    titles.push(title);
                    urls.push(url);
                });
                    $(crawImgSelector).each(function(index, value){
                        var img = $(value).find('img').attr('src');
                        imgUrls.push(img);
                    });

            }
        });
}

function clearArrays() {
    titles = [];
    urls = [];
    imgUrls = [];
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

    const message1 = {
        "message": {
            "text": '',
        },
        "keyboard": {
            "type": "",
        }
    };
    const message2 = {
        "message": {
            "text": '',
            "photo": {
                "url": "",
                "width": 640,
                "height": 480
            },
            "message_button": {
                "label": "",
                "url": ""
            }
        },
        "keyboard": {
            "type": "",
        }
    };
    const message3 = {
        "message": {
            "text": '',
            "message_button": {
                "label": "",
                "url": ""
            }
        },
        "keyboard": {
            "type": "",
        }
    };

    switch(_obj.content) {
        case '뉴스 보기' :
            message1.message.text = '뉴스보기 실행';
            message1.keyboard.type = 'buttons';
            message1.keyboard.buttons = [
                "장르",
                "언론사",
                "키워드 검색",
            ];
            res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
            break;
        case '저장 목록' :
            message1.message.text = '저장목록 실행';
            res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
            break;
        case '즐겨 찾기' :
            message1.message.text = '즐겨찾기 실행';
            res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
            break;

        case '장르' :
            message1.message.text = '장르 선택';
            message1.keyboard.type = 'buttons';
            message1.keyboard.buttons = [
                "속보",
                "정치",
                "경제",
                "사회",
                "생활/문화",
                "세계",
                "IT/과학",
            ];
            res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
            break;
        case '언론사' :
            message1.message.text = '언론사 선택';
            message1.keyboard.type = 'buttons';
            message1.keyboard.buttons = [
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
            res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
            break;

        case '키워드 검색' :
            message1.message.text = '입력해 주세요';
            message1.keyboard.type = 'text';
            res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
            break;

        case '돌아가기' :
            clearArrays();
            message1.message.text = '돌아가기';
            message1.keyboard.type = 'buttons';
            message1.keyboard.buttons = [
                "뉴스 보기",
                "저장 목록",
                "즐겨찾기"
            ];
            res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
            break;

        default:
            let fields = ["속보", "정치", "경제", "사회", "생활/문화", "세계", "IT/과학"];
            let presses = ["경향", "국민", "동아", "문화", "서울", "세계", "조선", "중앙", "한겨레", "한국"];
            for(i=0 ; i< 7 ; i++) {
                if (_obj.content === fields[i]) {
                    if(i === 0) {
                        crawlingNews(fieldURLs[i], breakingSelector1, breakingSelector2, breakingImgSelector1, breakingImgSelector2);
                    } else {
                        crawlingNews(fieldURLs[i], fieldSelector1, fieldSelector2, fieldImgSelector1, fieldImgSelector2);
                    }

                    let field = fields[i];

                    setTimeout(function () {
                            message1.message.text = '보고싶은 뉴스를 선택해 주세요.';
                            message1.keyboard.type = 'buttons';

                            if (field === "IT/과학") {
                                message1.keyboard.buttons = [
                                    "(" + field + ")" + titles[0],
                                    "(" + field + ")" + titles[1],
                                    "(" + field + ")" + titles[2],
                                    "돌아가기",
                                ];
                            } else {
                                message1.keyboard.buttons = [
                                    "(" + field + ")" + titles[0],
                                    "(" + field + ")" + titles[1],
                                    "(" + field + ")" + titles[2],
                                    "(" + field + ")" + titles[3],
                                    "(" + field + ")" + titles[4],
                                    "돌아가기",
                                ];
                            }
                            res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
                        },
                        1000);
                    break;
                }
            }
            for(k = 0 ; k < 10 ; k++) {
                if(_obj.content === presses[k]){
                    console.log(presses[k]);
                    crawlingNews(pressURLS[k], pressSelector1, pressSelector2, pressImgSelector1, pressImgSelector2);

                    setTimeout(function() {
                        message1.message.text = '보고싶은 뉴스를 선택해 주세요.';
                        message1.keyboard.type = 'buttons';
                        message1.keyboard.buttons = [
                            "(" + presses[k] + ")" + titles[0],
                            "(" + presses[k] + ")" + titles[1],
                            "(" + presses[k] + ")" + titles[2],
                            "(" + presses[k] + ")" + titles[3],
                            "(" + presses[k] + ")" + titles[4],
                            "돌아가기",
                        ];
                        res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
                    },1000);

                }
            }
            if( _obj.content.charAt(0) === '('){

                    for(i=0 ; i<5 ; i++){
                        if(imgUrls[i] === undefined){
                            message3.message.text = titles[i];
                            message3.message.message_button = {
                                label : '이동하기',
                                url : urls[i]
                            };
                            message3.keyboard.type = 'buttons';
                            message3.keyboard.buttons = [
                                "돌아가기",
                            ];
                            res.set({'content-type': 'application/json'}).send(JSON.stringify(message2));
                            break;
                        }
                        if(_obj.content.indexOf(titles[i]) !== -1){

                            message2.message.text = titles[i];
                            message2.message.photo = {
                                url : imgUrls[i],
                                width : 640,
                                height : 480,
                            };
                            message2.message.message_button = {
                                label : '이동하기',
                                url : urls[i]
                            };
                            message2.keyboard.type = 'buttons';
                            message2.keyboard.buttons = [
                                "돌아가기",
                            ];
                            res.set({'content-type': 'application/json'}).send(JSON.stringify(message2));
                            break;
                        }
                    }
                } else{
            }


            break;
    }

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
