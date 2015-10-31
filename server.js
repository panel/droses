var express = require('express');
var bodyParser = require('body-parser');
var mustache = require('mustache-express');
var loki = require('lokijs');
var _ = require('lodash');

var droses = express();
var db = new loki('db.json');
var anatomy = db.addCollection('anatomy');

droses.engine('html', mustache());
droses.set('view engine', 'html');
droses.set('views', __dirname + '/templates');
droses.use(express.static('public'));
droses.use(bodyParser.json());

droses.get('/api', function (req, res) {
	res.status(200).send(anatomy.data);
});

droses.get('/api/:bodyPart', function (req, res) {
	var info = findByName(req.params.bodyPart);

	if (_.isEmpty(info)) {
		res.status(404).send();
		return;
	}

	res.send(info[0]);
});

droses.post('/api', function (req, res) {
	var name = req.body.name;

	if (_.isEmpty(name)) {
		res.status(400).send({
			error: "Name is required"
		});
		return;
	}

	var existing = findByName(name);

	if (!_.isEmpty(existing)) {
		res.status(409);
		res.send({
			error: "Details for " + req.body.name + " already exist"
		});

		return;
	}

	anatomy.insert(req.body);
	db.save();
	res.status(201).send();
});

droses.put('/api/:bodyPart', function (req, res) {
	var existing = findByName(req.params.bodyPart);

	if (_.isEmpty(existing)) {
		res.status(404).send();
	}

	var updated = _.assign(existing[0], req.body);
	anatomy.update(updated);
	db.save();
	res.status(201).send();
});

droses.get('/', function (req, res) {
	res.render('index');
});

droses.get('/:bodyPart', function (req, res) {
	res.render('index', {
		initial: req.params.bodyPart
	});
});

droses.listen(80);


function findByName(name) {
	return anatomy.find({
		"name": name
	});
}