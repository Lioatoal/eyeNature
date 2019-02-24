// Require Header file
var menus = require('../config/menus');
var userInfo = require('../config/userInfo');
var sidebar = require('../config/sidebar');
var utility = require("../libs/utility");
// Require Modules
var express = require('express');
var url = require('url');
var async = require('async');
var xlsx = require('xlsx');
//Require Libs
var libMaterial = require("../libs/libMaterial");
var libPersonnel = require("../libs/libPersonnel");

var router = express.Router();