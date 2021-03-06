var express = require('express');
var router = express.Router();
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var mongoose = require('mongoose');
var User = require('./UserSchema');
var FieldNews = require('./FieldSchema');
var PressNews = require('./PressSchema');
var Ranking = require('./Ranking');

mongoose.connect('mongodb://localhost:27017/data');             //DB연동
var db = mongoose.connection;
db.on('error', function(){
    console.log('Connection Failed!');
});
db.once('open', function() {
    console.log('Connected!');
});
//db.dropDatabase();

//HTML 셀렉터
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
    'http://news.naver.com/main/main.nhn?mode=LSD&mid=shm&sid1=105',                //IT/과학             7개
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
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=469',                //한국                10개
];
let totalURLs = [
    'http://news.naver.com/main/list.nhn?mode=LSD&mid=sec&sid1=001',                //속보 0
    'http://news.naver.com/main/main.nhn?mode=LSD&mid=shm&sid1=100',                //정치 1
    'http://news.naver.com/main/main.nhn?mode=LSD&mid=shm&sid1=101',                //경제 2
    'http://news.naver.com/main/main.nhn?mode=LSD&mid=shm&sid1=102',                //사회 3
    'http://news.naver.com/main/main.nhn?mode=LSD&mid=shm&sid1=103',                //생활/문화 4
    'http://news.naver.com/main/main.nhn?mode=LSD&mid=shm&sid1=104',                //세계 5
    'http://news.naver.com/main/main.nhn?mode=LSD&mid=shm&sid1=105',                //IT/과학 6             7개
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=032',                //경향 7
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=005',                //국민
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=020',                //동아
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=021',                //문화
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=081',                //서울
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=023',                //조선
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=025',                //중앙
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=028',                //한겨레
    'http://news.naver.com/main/list.nhn?mode=LPOD&mid=sec&oid=469',                //한국                9개
];

var connectedUser = '';     //접속중인 카카오 유저
var targetIndex = 99;       //Save할때 쓸 Index
var titles = [];            //제목
var urls = [];              //url
var imgUrls = [];           //img url
var field = '';             //분야
var press = '';             //언론사
var targetNewsId = '';      //Save할때 쓸 뉴스의 DB Primary key
var curNews;
var fops
;

setInterval(function() {
(function loop(k) {
    if (k < 16) new Promise((resolve, reject) => {
        setTimeout( () => {
            console.log(k);
            crawling(k);
            resolve();
        }, 1500);
    }).then(loop.bind(null, k+1));
})(0);

},300000);



function crawling(k){
        clearArrays();
        var fieldAndPressList = ["속보", "정치", "경제", "사회", "생활/문화", "세계", "IT/과학", "경향", "국민", "동아", "문화", "서울", "조선", "중앙", "한겨레", "한국"];
        var request = require('request');
        request.get({
            url: totalURLs[k],
            headers: {"User-Agent": "Mozilla/5.0"},
            encoding: null,
        }, function (err, res, body) {
            if (err) console.log('err');

            var strContents = new Buffer(body);
            var $ = cheerio.load(iconv.decode(strContents, 'EUC-KR').toString());   //iconv로 EUC-KR 디코딩. cheerio로 HTML 파싱.
            /*
                    FieldNews.find({}).sort({_id: -1}).limit(85, function(err, doc){
                       if(err) console.log(err);
                        console.log('데헷' + doc);
                    });
            */
            for (var i = 1; i < 6; i++) {                                              //5개만 크롤링
                var crawSelector;
                var crawImgSelector;
                console.log('현재 k' + k);
                if (k >= 7) {
                    console.log('언론사');
                    crawSelector = pressSelector1 + i + pressSelector2;
                    crawImgSelector = pressImgSelector1 + i + pressImgSelector2;
                } else if (0 < k && k < 7) {
                    console.log('분야');
                    crawSelector = fieldSelector1 + i + fieldSelector2;
                    crawImgSelector = fieldImgSelector1 + i + fieldImgSelector2;
                }
                if (k === 0) {
                    console.log('속보');
                    crawSelector = breakingSelector1 + i + breakingSelector2;
                    crawImgSelector = breakingImgSelector1 + i + breakingImgSelector2;
                }


                var updatePressNews = new PressNews();

                $(crawSelector).each(function (index, value) {
                    var title = $(this).find('a').text().trim();
                    var url = $(value).find('a').attr('href');

                    titles.push(title);
                    urls.push(url);

                });
                $(crawImgSelector).each(function (index, value) {             //이미지 url 크롤링
                    var img = $(value).find('img').attr('src');

                    imgUrls.push(img);

                });
            }
            console.log(titles);


            for(let p = 0 ; p < titles.length ; p++) {
                if (k < 7) {
                    FieldNews.findOne({'Title': titles[p]}, {new: true}, function (err, doc) {  //긁어온 뉴스 중복 검사.
                        if (err) console.log(err);
                        if (doc === null) {             //새로긁어온 뉴스일경우

                            var updateFieldNews = new FieldNews();
                            updateFieldNews.Title = titles[p];
                            updateFieldNews.Url = urls[p];
                            updateFieldNews.ImgUrl = imgUrls[p];
                            updateFieldNews.Field = fieldAndPressList[k];
                            updateFieldNews.SavedDate = Date.now();
                            updateFieldNews.Views = Math.random()*100;


                            updateFieldNews.save({new: true}, function (err, doc) {     //저장.
                                if (err) console.log(err);
                                console.log('가져온 뉴스(분야)', doc);
                            });
                        }
                    });
                }
                if (k >= 7) {
                    PressNews.findOne({'Title': titles[p]}, {new: true}, function (err, doc) {
                        if (err) console.log(err);
                        if (doc === null) {

                            var updatePressNews = new PressNews();
                            updatePressNews.Title = titles[p];
                            updatePressNews.Url = urls[p];
                            updatePressNews.ImgUrl = imgUrls[p];
                            updatePressNews.Press = fieldAndPressList[k];
                            updatePressNews.SavedDate = Date.now();
                            updatePressNews.Views = Math.random()*100;

                            updatePressNews.save({new: true}, function (err, doc) {
                                if (err) console.log(err);
                                console.log('가져온 뉴스(언론사)', doc);
                            });
                        }
                    });
                }
            }
        });
}

function clearArrays() {                //글로벌 변수 초기화
    titles = [];
    urls = [];
    imgUrls = [];
    targetIndex = 99;
    field = '';
    press = '';
    targetNewsId = '';
}


function findUser(user_key) {
    console.log(user_key);
    User.findOne({id : user_key}, function(err, doc){       //먼저 DB에서 유저를 검색하고 없으면 저장.
        if(err) console.log(err);
        else if(doc === null) {     //없을경우

            var newUser = new User();
            newUser.id = user_key;
            newUser.save(function(err, doc){        //저장.
                if(err) {console.log(err)}
                console.log(doc);
            });
        } else {
            console.log(doc);
        }
    });
}


function getSavedNews(user_key) {           //먼저 DB에서 유저를 검색하고 그 유저가 저장한 뉴스들의 Priamry Key( _id )  를 받아와서 뉴스 DB에서 검색. Title, Url, ImgUrl 반환.
    var tempNews = [];
    var savedTitles = [];
    User.findOne({'id' : user_key}, function(err, doc){
       if(err) console.log(err);
       if(doc !== null){
           tempNews = doc.SavedNews;
           if(tempNews.length === 0 ){
           } else {
               for(i=0 ; i<tempNews.length ; i++) {
                   FieldNews.findOne({_id : tempNews[i]}, function(err, retDoc){
                       if(err) console.log(err);
                       else if(retDoc !== null) {
                           savedTitles.push(retDoc.Title);
                           console.log(retDoc.Title);
                       }
                   });
                   PressNews.findOne({_id: tempNews[i]}, function(err, retDoc){
                       if(err) console.log(err);
                       else if(retDoc !== null) {
                           savedTitles.push(retDoc.Title);
                           console.log(retDoc.Title);
                       }
                   });
               }
           }
       }
    });
    console.log(savedTitles);
    return savedTitles;
}

router.get('/keyboard', (req, res) => {
    findUser(connectedUser);
    const menu = {
        type: 'buttons',
        buttons: ["뉴스 보기", "저장 목록", "즐겨찾기", "랭킹보기"]
    };
res.set({'content-type': 'application/json'}).send(JSON.stringify(menu));
});

router.get('/user/test', (req, res) => {                //웹으로 라우팅.
    var newsList = [];
    newsList = getSavedNews(connectedUser);
    setTimeout(function() {
        console.log('뉴스리스트',newsList);
        res.render('User', {title : '뉴스bot',
            newsList : newsList,
        });
    }, 500);

});


router.post('/message', (req, res) => {

    const _obj = {
        user_key: req.body.user_key,
        type: req.body.type,
        content: req.body.content
    };
    connectedUser = req.body.user_key;
    findUser(connectedUser);
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
        case '랭킹보기' :
            message1.message.text = '랭킹보기 실행';
            message1.keyboard.type = 'buttons';
            message1.keyboard.buttons = [
                "Top10 조회순위(분야별)",
                "Top10 조회순위(언론사별)",
            ];
            res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
            break;

        case 'Top10 저장순위':

            break;
        case 'Top10 조회순위(분야별)':
            var top10Field;
            message1.keyboard.buttons = [];
            FieldNews.find().sort('-Views').limit(10).exec(function (err, docs) {
                top10Field = docs;      //분야별 뉴스를 모두 검색후 조회수별로 정렬. 갯수는 10개로 제한.

                setTimeout(function() {
                    for(let i = 0; i < docs.length ; i++){
                        message1.keyboard.buttons.push(docs[i].Title);

                    }
                },500);
            });
setTimeout(function() {

    message1.keyboard.type = 'buttons';
    message1.message.text = "순위";

    message1.keyboard.buttons.push("돌아가기");

    res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
},2000);

            break;
        case 'Top10 조회순위(언론사)':
            var top10Press;
            message1.keyboard.buttons = [];
            PressNews.find().sort('-Views').limit(10).exec(function (err, docs) {
                top10Press = docs;

                setTimeout(function() {

                    for(let i = 0; i < docs.length ; i++){
                        message1.keyboard.buttons.push(docs[i].Title);

                    }
                },500);
            });
            setTimeout(function() {

                message1.keyboard.type = 'buttons';
                message1.message.text = "순위";

                message1.keyboard.buttons.push("돌아가기");

                res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
            },2000);
            break;

        case '뉴스 보기' :
            message1.message.text = '뉴스보기 실행';
            message1.keyboard.type = 'buttons';
            message1.keyboard.buttons = [
                "장르",
                "언론사",
            ];
            res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
            break;
        case '저장 목록' :
            message1.keyboard.type = 'buttons';
            message1.keyboard.buttons = [
                "돌아가기",
            ];

            var returnSavedNews = [];
            returnSavedNews = getSavedNews(connectedUser);

            setTimeout(function () {
                if (returnSavedNews.length === 0) {
                    message1.message.text = '저장된 뉴스가 없습니다.'
                } else {
                    message1.message.text = '저장목록 실행\n 갯수 : ' + returnSavedNews.length + '개';
                    for (i = 0; i < returnSavedNews.length; i++) {
                        message1.keyboard.buttons.push(returnSavedNews[i]);
                    }
                }

                res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
            }, 500);

            break;
        case '즐겨찾기' :
            message1.message.text = '즐겨찾기 목록.';
            message1.keyboard.type = 'buttons';
            message1.keyboard.buttons = [
                "돌아가기",
            ];
            User.findOne({'id': connectedUser}, function (err, doc) {
                if (err) console.log(err);
                else if (doc !== null) {
                    if (doc.Favorite.Press.length === 0 && doc.Favorite.Category.length === 0) {
                        message1.message.text = '즐겨찾는 언론사 or 분야가 없습니다.';
                    } else {
                        for (i = 0; i < doc.Favorite.Press.length; i++) {
                            message1.keyboard.buttons.push(doc.Favorite.Press[i]);
                        }
                        for (j = 0; j < doc.Favorite.Category.length; j++) {
                            message1.keyboard.buttons.push(doc.Favorite.Category[j]);
                        }

                    }
                } else if (doc === null) {
                    message1.message.text = '즐겨찾는 언론사 or 분야가 없습니다.';
                }
            });

            setTimeout(function () {
                res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));

            }, 500);
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
                "조선",
                "중앙",
                "한겨레",
                "한국",
            ];
            res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
            break;

        case '돌아가기' :
            clearArrays();
            message1.message.text = '돌아가기';
            message1.keyboard.type = 'buttons';
            message1.keyboard.buttons = [
                "뉴스 보기",
                "저장 목록",
                "즐겨찾기",
                "랭킹보기",
            ];
            res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
            break;
        case '저장하기' :

            console.log(curNews._id);
            User.findOne({'id' : connectedUser, 'SavedNews' : curNews._id}, function(err, doc){
                if(err) console.log(err);
                if(doc === null ){      //유저의 저장한 뉴스중에 현재 저장하려는 뉴스가 존재하는지 검사후 저장.
                    User.findOneAndUpdate({'id' : connectedUser}, {$push: {'SavedNews' : curNews._id}}, {new : true}, function(err, retDoc){
                        if(err) console.log(err);
                        message1.message.text = '저장이 완료되었습니다.';
                        console.log(retDoc);
                    });
                }else {          //이미 저장한것.
                    message1.message.text = '이미 저장한 뉴스입니다.';
                }
            });

            message1.keyboard.type = 'buttons';
            message1.keyboard.buttons = [
                "뉴스 보기",
                "저장 목록",
                "즐겨찾기",
            ];
            setTimeout(function(){
                res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
            },1000);

            break;
        case '즐겨찾기등록' :
            let fieldAndPresses = ["속보", "정치", "경제", "사회", "생활/문화", "세계", "IT/과학", "경향", "국민", "동아", "문화", "서울", "조선", "중앙", "한겨레", "한국"];
            let points = fieldAndPresses.indexOf(_obj.content);

            if(points  < 7) {
                User.findOne({'id' : connectedUser, 'Favorite.Category' : fops}, function(err, doc){
                   if(err) console.log(err);
                   if(doc === null) {
                       User.findOneAndUpdate({'id' : connectedUser}, {$push : {'Favorite.Category' : fops}}, {new : true} ,function(err, doc){
                          if(err) console.log(err);
                          message1.message.text = "저장완료"
                       });
                   } else {
                       message1.message.text = "이미 저장된 즐겨찾기입니다."
                   }
                });
            } else {
                User.findOne({'id' : connectedUser, 'Favorite.Press' : fops}, function(err, doc){
                    if(err) console.log(err);
                    if(doc === null) {
                        User.findOneAndUpdate({'id' : connectedUser}, {$push : {'Favorite.Press' : fops}}, {new : true} ,function(err, doc){
                            if(err) console.log(err);
                            message1.message.text = "저장완료"
                        });
                    } else {
                        message1.message.text = "이미 저장된 즐겨찾기입니다."
                    }
                });
            }

            message1.keyboard.type = 'buttons';
            message1.keyboard.buttons = [
                "돌아가기",
            ];
            setTimeout(function () {
                res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
            }, 500);
            break;
        case '뉴스삭제' :
            message1.message.text = '삭제완료';
            User.findOneAndUpdate({'id': connectedUser}, {$pull: {'SavedNews': curNews._id}}, {new: true}, function (err, doc) {
                if (err) console.log(err);
                else if (doc !== null) {
                    message1.keyboard.type = 'buttons';
                    message1.keyboard.buttons = [
                        "돌아가기",
                    ];
                    console.log(doc);
                }
            });
            setTimeout(function () {
                res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
            }, 500);
            break;
        default:

            let fieldAndPress = ["속보", "정치", "경제", "사회", "생활/문화", "세계", "IT/과학", "경향", "국민", "동아", "문화", "서울", "조선", "중앙", "한겨레", "한국"];

            var resultNews;
            let fop;
            if (fieldAndPress.indexOf(_obj.content) !== -1) {
                let point = fieldAndPress.indexOf(_obj.content);

                if (point < 7) {
                    FieldNews.find({Field: _obj.content}).sort('-SavedDate').limit(5).exec(function (err, docs) {
                        resultNews = docs;
                    });
                }

                if (point >= 7) {
                    PressNews.find({Press: _obj.content}).sort('-SavedDate').limit(5).exec(function (err, docs) {
                        resultNews = docs;
                    });
                }


                setTimeout(function () {
                    console.log(resultNews);
                    fop = _obj.content;
                    fops = fop;
                    message1.message.text = '보고싶은 뉴스를 선택해 주세요.';
                    message1.keyboard.type = 'buttons';
                    message1.keyboard.buttons = [];
                    for (let i = 0; i < resultNews.length; i++) {
                        message1.keyboard.buttons.push(resultNews[i].Title);
                    }
                    message1.keyboard.buttons.push("돌아가기");
                    message1.keyboard.buttons.push("즐겨찾기등록");
                    res.set({'content-type': 'application/json'}).send(JSON.stringify(message1));
                }, 1500);
                break;
            }

            else{
                let returnNews;
                FieldNews.findOneAndUpdate({'Title' : _obj.content} ,{$inc:{Views : 1}},function(err, doc){
                   if(err) console.log(err);
                   if(doc === null){
                       console.log('언론사찾음');
                       PressNews.findOneAndUpdate({'Title' : _obj.content} ,{$inc:{Views : 1}},function(err, doc) {
                           setTimeout(function(){
                               returnNews = doc;
                               console.log(returnNews);
                           },2200);

                       });
                   } else {
                       console.log('분야찾음');
                       setTimeout(function(){
                           returnNews = doc;
                           console.log(returnNews);
                       },2200);
                   }
                });

                setTimeout(function(){
                   curNews = returnNews;



                    if (returnNews.ImgUrl !== null) {
                        message2.message.text = returnNews.Title;
                        message2.message.photo = {
                            url: returnNews.ImgUrl,
                            width: 640,
                            height: 480,
                        };
                        message2.message.message_button = {
                            label: '이동하기',
                            url: returnNews.Url
                        };
                        message2.keyboard.type = 'buttons';
                        message2.keyboard.buttons = [
                            "저장하기",
                            "돌아가기",
                        ];
                        res.set({'content-type': 'application/json'}).send(JSON.stringify(message2));

                    } else {
                        message3.message.text = returnNews.Title;
                        message3.message.message_button = {
                            label : '이동하기',
                            url : returnNews.Url
                        };
                        message3.keyboard.type = 'buttons';
                        message3.keyboard.buttons = [
                            "저장하기",
                            "돌아가기",
                        ];
                        res.set({'content-type': 'application/json'}).send(JSON.stringify(message3));
                    }
                },2000);



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
