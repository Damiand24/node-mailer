const express = require('express');
const mailer = require('nodemailer');
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require('fs');
const helmet = require('helmet');

const app = express();
app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}
const upload = multer({ 
    storage, fileFilter, 
    limits: { fileSize: 4000000 },
});

app.listen(process.env.PORT);

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
    res.end();
})

let form;
app.post('/send', [

    check('name')
    .not().isEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 18 }).withMessage('Name can be only 18 characters')
    .trim()
    .escape(),

    check('email').not().isEmpty().withMessage('Email cannot be empty')
    .isEmail().withMessage('Enter a valid email')
    .isLength({ max: 50}).withMessage('Email can be only 50 characters')
    .trim()
    .normalizeEmail(),

    check('message').not().isEmpty().withMessage('Enter a message')
    .trim()
    .escape()

    ], (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.json({ error: errors.array() });
        }
         else {
        form = req.body;
        res.end();
    }
})

app.post('/send_file', upload.array('image', 5), (req, res) => { 
    
    filenames = req.files.map((file) => {
        return {filename: file.filename, path: 'uploads/' + file.filename};
    });

    const htmlOutputReciever = `
    <h1 style="color: blue;">New message<h1>
    <div style="font-size:22px; font-family: sans-serif; line-height: 25px;">
    <p>Name: ${form.name}</p>
    <p>Email: ${form.email}</p>
    <p>Message: ${form.message}</p>
    </div>
    `

    const htmlOutputSender = `
    <h1 style="color: blue; font-family: sans-serif">Hello ${form.name},<h1>
    <h2 style="font-family: sans-serif">your message has been sent</h2>
    <h3 style="font-family: sans-serif">Thank you for contact</h3>
    `
    
    transporter.sendMail({
        from: 'nodemailertest@interia.pl',  
        to: 'nodemailertest@interia.pl',
        subject: 'New message',
        text: `name: ${form.name}, email: ${form.email}, message: ${form.message}`,
        html: htmlOutputReciever,
        attachments: filenames
    })
    .then( deleteFiles = () => {
        if(req.files !== undefined) {
            filenames.forEach((file) => {
                fs.unlink('uploads/' + file.filename, (err) => {
                    if(err) {
                        console.log(err);
                        return;
                    }
                })
            })
        }
    })
    .then( sendConfirm = () => {
        transporter.sendMail({
            from: 'nodemailertest@interia.pl',  
            to: form.email,
            subject: 'We recieved your message',
            text: `Hello ${form.name}, your message has been sent. Thank you for contact`,
            html: htmlOutputSender,
        })
    })
    .catch(err => { deleteFiles(); console.log(err) })
    res.end();
})

let transporter = mailer.createTransport({
    host: 'poczta.interia.pl',
    port: 465,
    secure: true,
    auth: {
        user: 'nodemailertest@interia.pl',
        pass: 'password'
    },
})

app.use((req, res) => {
    res.status(404);
    res.end('page not found');
})