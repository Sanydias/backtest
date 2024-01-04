
/* Express : trdaucteur pour le serveur */

    var express = require('express');
    var app = express();

/* body-parser : permet de lire le HTML ou transmettre (middleware) */
    
    var bodyParser = require('body-parser');

/* dotenv : cacher son url */

    require('dotenv').config();

/* mongoose : connexion à la BDD */
    
    var mongoose = require('mongoose');
    const url = process.env.DATABASE_URL;
    mongoose.connect(url).then(console.log("MongoDB connected")).catch(err => console.error(err));

/* Bcrypt : Hashage de mot de passe */

    const bcrypt = require('bcrypt');

/* cookieParser : cookies */

    const cookieParser = require('cookie-parser');
    app.use(cookieParser());

/* JWT : token */

    const {createTokens, validateToken} = require('./JWT');

/* jwt-decode : decode le jeton jwt */

    const { jwtDecode } = require('jwt-decode');

/* multer : images */

    const multer = require('multer');
    app.use(express.static('uploads'));
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    });
    const upload = multer({storage});

/* method-override : CRUD */

    const methodeOverride = require('method-override');

    app.use(bodyParser.urlencoded({extended: false}));
    app.use(methodeOverride('_method'));

/* VIEWS */

    app.set('view engine', 'ejs');

    const cors = require('cors');
    app.use(cors({credentials: true, origin: process.env.FRONT_URL}));

/* MODELE USER */

    var User = require('./models/User');

/* MODELE RESERVATION */

    var Reservation = require('./models/Reservation');

/* HOME */

    app.get('/', validateToken, function(req, res){
        Reservation.find().then((data) => { console.log(data); res.json(data); }).catch(err => console.error(err));
        
    });

/* VALIDATION TOKEN */    

    app.get('/getJWT', validateToken, function(req, res){
        console.log(req.cookies["access-token"]);
        res.json(jwtDecode(req.cookies["access-token"]));
    });

/* UPLOAD */

    app.post('/upload', upload.single('imageUpload'), function(req, res){
        if (!req.file){
            res.status(400).send('no file uploaded');
        }else{
            res.send('file uploaded successfully');
        }
    })

/* INSCRIPTION */

    app.get('/inscription', function(req, res){
        res.render('Inscription');
    });

    app.post('/api/inscription', upload.single('pp'), function(req, res){
        const Data = new User({
            username : req.body.username,
            email : req.body.email,
            password : bcrypt.hashSync(req.body.password, 10),
            ppname : req.body.ppname,
            date : req.body.date
        });
        if (!req.file){
            res.status(403).send('no file uploaded');
        }
        else{
            Data.save()
            .then(() => { console.log('Data saved successfuly'); 
            res.json("data saved successfully")
            }).catch(err => console.error(err));
        }
    });

/* CONNEXION */

    app.get('/connexion', function(req, res){
        res.render('Connexion');
    });

    app.post('/api/connexion', function(req, res){
        User.findOne({
            username : req.body.username
        }).then(user => {
            if (!user){
                const message = 'User not found';
                res.redirect(process.env.FRONT_URL + '/connexion?m=' + message);
            }
            console.log(user);
            if (!bcrypt.compareSync(req.body.password, user.password)) {
                const message = 'Invalid password';
                res.redirect(process.env.FRONT_URL + '/connexion?m=' + message);
            }
            const accessToken = createTokens(user);
            res.cookie("access-token", accessToken,{
                maxAge: 1000 * 60 * 60 * 24 * 30, // 30 jours en ms
                httpOnly:true,
            });
            res.redirect(process.env.FRONT_URL + '/compte');
        }).catch(err => console.error(err));
    });

    app.get('/utilisateur/:id', function(req, res){
        User.findOne({ _id : req.params.id }).then((data) => { console.log(data); res.json( data); }).catch(err => console.error(err));
    });

/* DÉCONNEXION */

    app.get('/api/deconnexion', function(req, res){
        res.clearCookie('access-token');
        res.redirect(process.env.FRONT_URL + '');
    });

/* MODIFIER UTILISATEUR */

    app.get('/modifier/:id', function(req, res){
        User.findOne({ _id : req.params.id }).then((data) => { console.log(data); res.json(data); }).catch(err => console.error(err));
    });

    app.put('/api/modifier/:id', upload.single('pp'), function(req, res){
        const Data = {
            username : req.body.username,
            email : req.body.email,
            pp : req.body.pp
        }
        if (!req.body.pp){
            res.status(400).send('no file uploaded');
        }
        User.updateOne({'_id': req.params.id}, {$set: Data}).then(() => { console.log('Data updated successfuly'); res.redirect(process.env.FRONT_URL + '/admin/dashboard'); }).catch(err => console.error(err));
    });

/* SUPPRIMER UTILISATEUR */

    app.delete('/supprimer/:id', function (req, res) {
        User.findOneAndDelete({'_id': req.params.id}).then(() => { console.log('Data deleted successfuly'); res.redirect(process.env.FRONT_URL + '/admin/dashboard'); }).catch(err => console.error(err));
    });

/* LISTE SALLE */

    app.get('/liste', function(req, res){
        Reservation.find().then((data) => { console.log(data); res.json(data); }).catch(err => console.error(err));
    });

/* SALLE */

    app.get('/salle/:id', function(req, res){
        Reservation.findOne({ _id : req.params.id }).then((data) => { console.log(data); res.json( data); }).catch(err => console.error(err));
    });

/* AJOUT SALLE */

    app.get('/ajoutsalle', function(req, res){
        res.render('AjoutSalle');
    });

    app.post('/api/ajoutsalle', upload.single('pp'), function(req, res){
        spt = req.body.nombretable * req.body.nombresiegetable;
        const Data = new Reservation({
            roomname : req.body.roomname,
            roomsubname : req.body.roomsubname,
            nombretable : req.body.nombretable,
            nombresiege : spt,
            nombresiegetable : req.body.nombresiegetable,
            statut : 'false',
            pp : req.body.pp,
            id_reserveur : 'Aucun'
        });
        if (!req.body.pp){
            res.status(400).send('no file uploaded');
        }
        Data.save().then(() => { console.log('Data saved successfuly'); res.redirect(process.env.FRONT_URL + '/compte/listesalle'); }).catch(err => console.error(err));
    });

/* MODIFIER SALLE */

    app.get('/modifiersalle/:id', function(req, res){
        Reservation.findOne({ _id : req.params.id }).then((data) => { console.log(data); res.json(data); }).catch(err => console.error(err));
    });

    app.put('/api/modifiersalle/:id', upload.single('pp'), function(req, res){
        spt = req.body.nombretable * req.body.nombresiegetable;
            const Data = {
                roomname : req.body.roomname,
                roomsubname : req.body.roomsubname,
                nombretable : req.body.nombretable,
                nombresiege : spt,
                nombresiegetable : req.body.nombresiegetable,
                pp : req.body.pp
            }
            if (!req.body.pp){
                res.status(400).send('no file uploaded');
            }
            Reservation.updateOne({'_id': req.params.id}, {$set: Data}).then(() => { console.log('Data updated successfuly'); res.redirect(process.env.FRONT_URL + '/compte/listesalle'); }).catch(err => console.error(err));
    });

/* SUPPRIMER SALLE */

    app.delete('/supprimersalle/:id', function (req, res) {
        Reservation.findOneAndDelete({'_id': req.params.id}).then(() => { console.log('Data deleted successfuly'); res.redirect(process.env.FRONT_URL + '/compte/listesalle'); }).catch(err => console.error(err));
    });

/* LISTE RESERVATION */
    
    app.get('/listereservation/:id', function(req, res){
        console.log(req.params.id); 
        Reservation.find({ 
            'id_reserveur' : req.params.id 
        }).then((data) => { 
            console.log(data); 
            res.json(data); 
        }).catch(err => console.error(err));
    });

/* RESERVATION */

    app.get('/reservation', function(req, res){
        res.render('Reservation');
    });

    app.post('/reservationresultat', function(req, res){
        Reservation.find({
        }).then((data) => { 
            console.log(data); 
            res.json(data, req.body.nombresiege); 
        }).catch(err => console.error(err));
    });

    app.put('/api/reservation/:id', function(req, res){
            const Data = {
                statut : 'true'
            }
            Reservation.updateOne({
                '_id': req.params.id
            }, {
                $set: Data
            }).then(() => { 
                console.log('Data updated successfuly'); 
                res.redirect(process.env.FRONT_URL + '/compte/reservation/'+ req.params.id); 
            }).catch(err => console.error(err));
    });

    app.get('/reservationnom/:id', function(req, res){
        Reservation.findOne({
            '_id' : req.params.id
        }).then(data => {
            console.log(data);
            res.json(data);
        }).catch(err => console.error(err));
    });

    app.put('/api/reservationnom/:id', function(req, res){
            const Data = {
                id_reserveur : req.body.id_reserveur
            }
            Reservation.updateOne({
                '_id': req.params.id
            }, {
                $set: Data
            }).then(() => { 
                console.log('Data updated successfuly'); 
                res.redirect(process.env.FRONT_URL + '/compte/reservation/'); 
            }).catch(err => console.error(err));
    });

/* ANNULER RESERVATION */

    app.put('/api/annulerreservation/:id', function(req, res){
            const Data = {
                statut : 'false',
                id_reserveur : 'Aucun'
            }
            Reservation.updateOne({
                '_id': req.params.id
            }, {
                $set: Data
            }).then(() => { 
                console.log('Data updated successfuly'); 
                res.redirect(process.env.FRONT_URL + '/compte/reservation/'); 
            }).catch(err => console.error(err));
    });

/* LANCER SERVEUR */

    var server = app.listen(5005, function () {
        console.log("server listening on port 5005");
    })