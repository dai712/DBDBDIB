'use strict';

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id : String,             //카카오 이메일
    SavedNews : [String],       //저장한 뉴스
    RecentNews : [String],      //최근 본 뉴스

    Favorite : {
        Category : [String],
        Press : [String]        //즐겨찾는 분야와 언론사
    }
});


module.exports = mongoose.model('User', UserSchema);
