var express = require('express');
var router = express.Router();
var add_row = require('../utils/add-row');
var edit_row = require('../utils/edit-row');
var remove_row = require('../utils/remove-row');
var write_file = require('../utils/write-file');
var switch_on = require('../utils/switch-on');
var switch_off = require('../utils/switch-off');
var show_rows = require('../utils/show-rows');
var show_ips = require('../utils/show-ips');
var moment = require('moment');


//add new row
router.post('/rows', function(req, res, next) {
  add_row(req.body, function (err, saved_data) {
    console.log(saved_data);
    if (err) next(err);
    else {
      console.log(saved_data);
      res.status(200).end();
    }
  });
});

//edit one row
router.put('/rows', function(req, res, next) {
  edit_row(req.body, function (err, saved_data) {
    console.log(err);
    if (err) next(err);
    else {
      console.log(saved_data);
      res.status(200).end();
    }
  });
});

//remove one row
router.delete('/rows', function(req, res, next) {
  console.log(req.body);
  remove_row(req.body, function (err, answer) {
    console.log(answer);
    if (err) next(err);
    else {
      console.log(saved_data);
      res.status(200).end();
    }
  });
});

// //write active rows to file
// router.copy('/rows', function(req, res, next) {
//   write_file(function (err) {
//     if (err) next(err);
//     else {
//       res.end({saved: true});
//     }
//   });
// });



// //switch on inactive rows
// router.post('/rows/switchon', function(req, res, next) {
//   var rows = req.body.rows? req.body.rows: undefined;
//   switch_on(rows, function (err, string) {
//     if (err) next(err);
//     else {
//       res.set({"Content-Disposition":"attachment; filename=\"Hello.txt\""});      
//       res.send(string);
//     }
//   });
// });

// //switch on inactive rows
// router.get('/rows/switchon', function(req, res, next) {
//   // var rows = req.body.rows? req.body.rows: undefined;
//   switch_on(undefined, function (err, string) {
//     if (err) next(err);
//     else {
//       res.set({"Content-Disposition":"attachment; filename=\"" + moment().format() +".csv\""});      
//       res.send(string);
//     }
//   });
// });

// router.get('/rows/switchoff', function(req, res, next) {
//   // var rows = req.body.rows? req.body.rows: undefined;
//   switch_off(undefined, function (err, string) {
//     if (err) next(err);
//     else {      
//       res.end('OK');
//     }
//   });
// });


//init
router.get('/', function(req, res) {
  res.render('pages/index');       
});

//show all rows
router.get('/rows', function(req, res, next) {  
  show_rows(req.query.all,function (err, rows) {
    if (err) next(err);
    else {
      res.send(rows);
    }
  });
});

//show free ips
router.get('/freeip', function(req, res, next) {  
  show_ips(req.query.all,function (err, rows) {
    if (err) next(err);
    else {
      res.send(rows);
    }
  });
});
module.exports = router;