var express = require('express');
var bodyParser = require('body-parser');
var mustache = require('mustache-express');
var Datastore = require('nedb');
var _ = require('lodash');

var droses = express();
var db = new Datastore({
	filename: './db.json',
	autoload: true
});

droses.engine('html', mustache());
droses.set('view engine', 'html');
droses.set('views', __dirname + '/templates');
droses.set('port', (process.env.PORT || 3000));

droses.use(express.static('public'));
droses.use(bodyParser.json());

droses.get('/api', function (req, res) {
	db.find({}, function (err, docs) {
		res.status(200).send(docs);
	});
});

droses.get('/api/:bodyPart', function (req, res) {
	findByName(req.params.bodyPart).exec(function (err, info) {
		if (_.isEmpty(info)) {
			res.status(404).send();
			return;
		}

		res.send(info[0]);
	});
});

droses.post('/api', function (req, res) {
	var name = req.body.name;

	if (_.isEmpty(name)) {
		res.status(400).send({
			error: "Name is required"
		});
		return;
	}

	findByName(name).exec(function (err, existing) {
		if (!_.isEmpty(existing)) {
			res.status(409);
			res.send({
				error: "Details for " + req.body.name + " already exist"
			});

			return;
		}

		db.insert(req.body);
		res.status(201).send();
	});
});

droses.put('/api/:bodyPart', function (req, res) {
	findByName(req.params.bodyPart).exec(function (err, existing) {
		if (_.isEmpty(existing)) {
			res.status(404).send();
		}

		var updated = _.assign(existing[0], req.body);
		db.update({
			name: updated.name
		}, updated);

		res.status(201).send();
	});
});

droses.get('/', function (req, res) {
	res.render('index');
});

droses.get('/:bodyPart', function (req, res) {
	res.render('index', {
		initial: req.params.bodyPart
	});
});

droses.listen(droses.get('port'));

function findByName(name) {
	return db.find({
		"name": name
	});
}