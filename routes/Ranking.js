'use strict';

const mongoose = require('mongoose');

const RankingSchema = new mongoose.Schema({
    MostSavedNews : [String],
    MostViewNews : [String],
    MostAddedField : [String],
    MostAddedPress : [String],
});


module.exports = mongoose.model('Ranking', RankingSchema);
