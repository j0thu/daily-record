const express = require('express');
const router = express.Router();
const {ensureAuth} = require('../middleware/auth');

const Story = require('../models/Story');

// @desc Show add page
// @route GET /stories/add

router.get('/add', ensureAuth, (req, res)=>{
    res.render('stories/add');
})

// @desc Process Add form
// @route POST /stories
router.post('/', ensureAuth, async(req, res)=>{
    try{
        // console.log(req.body);
        // console.log(req.user.id);
        req.body.user = req.user.id;
        await Story.create(req.body);
        res.redirect('/dashboard');
    } 
    catch (err) {
        console.log(err);
        res.render('error/500')
    }
})

//@desc Show all Stories
// @route GET /stories
router.get('/', ensureAuth, async(req, res)=>{
    try {
        const stories = await Story.find({status: 'public'})
            .populate('user')
            .sort({createdAt: 'desc'})
            .lean()
    res.render('stories/index', {stories});
        
    } catch (err) {
        console.log(err);
        res.render('error/500');
        
    }
})

//@desc Show single story
// GET /stories/:id
router.get('/:id', ensureAuth, async(req, res)=>{
try {
    let story = await Story.findById(req.params.id)
    .populate('user')
    .lean()
    if(!story){
        return res.render('error/404');
    }
    res.render('stories/show', {story});
} catch (err) {
    console.log(err);
    res.render('error/404');
}
})

//@desc Show Edit Page
// route GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async(req, res)=>{
    try {
        const story = await Story.findOne({
            _id: req.params.id,
        }).lean();
      
        if(!story){
          return res.render('error/404');
        }
        if(story.user != req.user.id){
          res.redirect('/stories');
        }
        else{
            res.render('stories/edit', {story});
        }
    } catch (err) {
        console.log(err);
        return res.render('error/500');
    }

})

//@desc Update story
// route PUT /stories/:id
router.put('/:id', ensureAuth, async(req, res)=>{
    try {
    let story = await Story.findById(req.params.id).lean();
    if(!story){
        return res.render('error/404');
    }
    else{
        if(story.user != req.user.id){
            res.redirect('/stories');
        }
        else{
            story = await Story.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, runValidators: true});
            res.redirect('/dashboard');
        }
    }
    } catch (err) {
        console.log(err);
        return res.render('error/500')
    }
    
})

// @desc Delete Story
// route DELETE /stories/:id
router.delete('/:id', ensureAuth, async(req, res)=>{
    try {
        await Story.remove({_id: req.params.id});
        res.redirect('/dashboard');
    } catch (err) {
        console.log(err);
        return res.render('error/500')
    }
})

//@desc Users stories
//GET /stories/user/:userID
router.get('/user/:userID', ensureAuth, async(req, res)=>{
    try {
        const stories = await Story.find({user: req.params.userID, status: 'public'}).populate('user').lean();
        res.render('stories/index', {stories})
    } catch (err) {
        console.log(err);
        return res.render('errors/500');
    }
})
module.exports = router;