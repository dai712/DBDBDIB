'use strict';

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id : String,
    SavedNews : [String],       //저장한 뉴스
    Favorite : {
        Category : [String],
        Press : [String]        //즐겨찾는 분야와 언론사
    },
});


module.exports = mongoose.model('User', UserSchema);
