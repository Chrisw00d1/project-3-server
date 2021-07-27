# ![](https://ga-dash.s3.amazonaws.com/production/assets/logo-9f88ae6c9c3871690e33280fcf557f33.png) GA London React Template

# R8 My Pl8

![](/images/r8mypl8Gif.gif)

## Table of Contents
* [Overview](#overview)
* [Brief](#brief)
* [Technologies Used](#technologies)
* [Planning](#planning)
* [Backend](#backend)
* [Frontend](#frontend)
* [Wins and Challenges](#wins)
* [Bugs](#bugs)
* [Lessons learned](#lessons)
* [Future improvements](#future)
* [Contributors](#contributors)

<a name="overview"></a>
## Overview
The third project had us split into groups of three where we had 10 days to build a full stack app. I worked with Devante and Dom for this project. We were introduced to branching on git and how to deal with merge issues for the project. Our app is based around different food where users are able to share plates they have made with each other and can rate them.

You can add a plate [here](https://r8-my-pl8.netlify.app/)

You can see the backend [here](https://github.com/Chrisw00d1/project-3-server)

<a name="brief"></a>
## Brief
* Build a full-stack app by creating a backend and frontend
* Use Express API and Mongo database for the backend
* Build the frontend with React
* Have a complete product with CRUD functionality
* Use Git to work collaboratively

<a name="technologies"></a>
## Technologies Used
* React
* Express
* Node.js
* MongoDB
* Mongoose
* SASS
* Bulma
* Axios
* Bcrypt
* Heroku
* Netlify
* Cloudinary

<a name="planning"></a>
## Planning
We made sure we spent a lot of time working on the white boarding so that we were all clear about the models that were needed for this project. We realised that we couldn't do too much with the frontend until we had the backend in place. So we decided that finishing that would be our. We pseudo coded all the models and the controllers that we would need so when we split up to work on it we all knew what things would be called and how they would work. Since we were now introduced to git branching it made it easier for us to do work in our own time as all the code was no longer stored on one person's computer. We still decided that during the day we would be in a call together so that we could ask for help when we needed it and discuss ideas with each other as well.

<a name="backend"></a>
## Backend
When we started we split the work so that I was sorting out the data handling and the seeding initially so that we could test data with controllers and the views. With this I also set up how we connected the the Mongo database.  It was important that I added the correct information to the data, like giving the plates an owner, or the data would not load with Mongoose.

```js
await connectToDb()
    console.log('You have been connected M8')
    await mongoose.connection.db.dropDatabase()
    const m8s = await M8.create(m8Data)
    const newPl8Data = pl8Data.map(pl8 => {
      return { ...pl8, m8: m8s[0]._id }
    })
    const pl8s = await Pl8.create(newPl8Data)
    const myComment = { text: 'Perfect dish', m8: m8s[0]._id }
    const pl8ToCommentOn = pl8s[0]
    pl8ToCommentOn.comments.push(myComment)
    await pl8ToCommentOn.save()
    await mongoose.connection.close()

```

While I was doing this, Dom was working on the models and Devante worked on the controllers and adding encryption. Once I finished with the data seeding I added a comment model and controller so that users could add comments to plates.

```js
router.route('/pl8/:id/comment')
  .post(secureRoute, commentController.create)

router.route('/pl8/:pl8Id/comment/:commentId')
  .put(secureRoute, commentController.edit)
  .delete(secureRoute, commentController.remove)

```

```js
async function create(req, res, next) {
  req.body.m8 = req.currentM8._id
  try {
    const pl8 = await Pl8.findById(req.params.id) 
      .populate('user')
      .populate('comments.user')
    if (!pl8) {
      throw new NotFound('Pl8 not found.')
    }
    pl8.comments.push(req.body)
    const savedPl8 = await pl8.save()
    res.status(201).json(savedPl8)
  } catch (e) {
    next(e)
  }
}

```

I then worked on adding some custom errors for us to display for the user incase there were any mistakes.

```js
if (err.name === 'EmailNotUnique') {
	return res.status(400).json({ email: 'This email is already taken' })
  }
if (err.name === 'MongoError') {
	return res.status(400).json({ username: 'This username is alreay taken' })
  }
if (err.name === 'NoPassword') {
	return res.status(400).json({ password: 'A password is required' })
}
```

Towards the end of the project we wanted the ability to delete a user. This proved a lot more challenging than we initially thought as when you delete the user the user data only gets deleted and not where it is referenced. This means the app would crash when you load something that involves the user that no longer exists. To get around this, I created a quick fix that added a boolean to the user model that said if they had been deleted or not. This way we can hide their information if they are “deleted” by checking the value of the boolean.  The account can be reactivated by registering with the same email that was used initially. This method took a lot less time than creating a new controller that searched everything and deleted it all manually which is why I went for it with the limited time we had left.

```js
async function remove(req, res, next) {
  try {
    const currentUserId = req.currentM8._id
    const m8 = await M8.findById(req.params.id)
    if (!m8) {
      throw new NotFound('M8 not found.')
    }
    if (!currentUserId.equals(m8._id)) {
      throw new NotYours('ThIs IsNT YoUr PrOfIlE!!!')
    }
    m8.deleted = true
    await m8.save()
    res.sendStatus(204)

  } catch (e) {
    next(e)
  }
}
```

```js
async function register(req, res, next) {
  try {
    const m8 = await M8.findOne({ email: req.body.email })
    console.log(m8)
    if (m8) {
      if (m8.deleted) {
        req.body.deleted = false
        if (req.body.password === '') throw new NoPassword('A Password is Required')
        req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync())
        console.log(req.body.password)
        const reactivatedM8 = await m8.updateOne(req.body, { new: true })
        res.status(201).json(reactivatedM8)
      } else {
        throw new EmailNotUnique('This email is taken')
      }
    } else {
      req.body.deleted = false
      req.body.highScore = 0
      const newM8 = await M8.create(req.body)
      res.status(201).json(newM8)
    }
  } catch (error) {
    next(error)
  }
}

```

<a name="frontend"></a>
## Frontend
For the frontend we split the work again. Dom worked on authentication, nav bar, game and the show page. Devante worked on the profile page, SASS, image uploading, index page, show page and authentication. While I worked on the homepage, adding and deleting mates, authentication, profile page and the comment section. 

For the homepage, I created an svg image so that we could animate this to give it the effect of it smashing. This image was then used in the nav bar as well as the catch the plate game.  Audio was also added to give the effect that the plate was cracking and then a sound for it smashing.

![](/images/screenshot1.png)

Once Devante had set up the profile page I helped with creating an option to update the information on the page. To keep it all on the same page I just changed the text to inputs when the edit button gets clicked and then when it is clicked again it makes a put request with the new information. I also added the feature to add mates when on their page and the ability to remove them from your own page.

```js
{!edit && <p className="information">{!formdata.bio ? 'Add a description about yourself' : formdata.bio }</p>}
{edit && <textarea className='title is-6' name='bio' value={formdata.bio} onChange={handleChange}/>}

```

![](/images/screenshot2.png)

![](/images/screenshot3.png)

After I implemented this, Dom had finished the login and register pages as well as the creating a plate page. I added the custom errors to each of the pages by putting the errors that came back into an object. If there was a value that was in the key of the object then it would display.

```js
{formErrors.name && <p className="help invalid">{formErrors.name}</p>}
```

![](/images/screenshot4.png)

After that I worked on the comment section for the show plate page. I set it up so that once there were three or more comments made then an option appears that allows you to view all comments.  This was to prevent the page from becoming too crowded with comments. Going to the comments page provides some more information about the person who made the comment as well as when it was posted.

![](/images/screenshot5.png)

![](/images/screenshot6.png)

<a name="wins"></a>
## Wins and Challenges
This project felt like we were finally putting everything that we had learnt together to create this. Being able to successfully link up everything from the backend to the frontend and seeing it was was also very satisfying. As well as this, the website works well and looks good.

Some of the challenges were getting our heads around the relationships and getting having to change the models occasionally as plans changed during the process. Such as adding the delete user controller at the end caused a few issues. 

<a name="bugs"></a>
## Bugs
* The sound for the plate on the home screen does not work very well on production.

<a name="lessons"></a>
## Lessons learned
Getting used to using git branching was the biggest lesson I learnt during this. The benefits of being able to handle merge issues in different branches can save a lot of time if something goes wrong. Another lesson I learnt is how important it is to name your variables properly. At the begining it seemed like a fun idea to keep it the same to the theme of the website but by the end it became very confusing.

<a name="future"></a>
## Future improvements
* Have friend requests instead of instant adding
* Messaging between people
* Mobile friendly

<a name="contributors"></a>
## Contributors
I worked with Devante and Dom for this project

Devante’s GitHub can be found [here](https://github.com/dee912)

Dom’s Github can be found [here](https://github.com/dominicreynolds97)