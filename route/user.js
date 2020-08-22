const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const multer = require('multer');
const sharp = require('sharp');

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        return res.status(201).send(user);

    } catch (err) {
        res.status(400).send(err);
    }
})

router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowUpdate = ['firstName', 'lastName', 'mobileNo', 'email'];
    const isValidOperation = updates.every(update => allowUpdate.includes(update));
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Update' });
    }

    try {
        console.log(req.params.id)
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ error: '' });
        }
        updates.forEach(update => user[update] = req.body[update])
        await user.save();
        return res.status(200).send(user)
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
})

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        return res.status(200).send(users)
    } catch (err) {
        res.status(400).send(err);
    }
})

router.get('/users/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id);
        if (!user)
            return res.status(404).send();
        return res.status(200).send(user)
    } catch (err) {
        res.status(400).send(err);
    }
})

router.delete('/users/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user)
            return res.status(404).send();
        return res.status(200).send(user)
    } catch (err) {
        res.status(400).send(err);
    }
})



const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)) {
            return cb(new Error('Wrong file type'))
        }
        cb(undefined, true);
    }
})
router.patch('/users/avatar/:id', upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize(320, 240).png().toBuffer()
    const user = await User.findById(req.params.id);
    console.log(buffer)
    user.avatar = buffer;
    await user.save()
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/avatar/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    user.avatar = undefined;
    await user.save();
    res.send();
})

router.get('/users/avatar/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar)
            throw new Error();
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    }
    catch (e) {
        res.status(400).send();
    }
})

module.exports = router;