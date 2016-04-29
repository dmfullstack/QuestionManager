var mongoose = require('mongoose'),

tournamentSchema = new mongoose.Schema({

});

tournament = mongoose.model('tournament',tournamentSchema,'tournaments')

module.exports = tournament;
