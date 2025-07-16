require('dotenv').config(); //env 

const express = require('express');
const mongoose = require('mongoose');
const {HoldingModel} = require("./models/HoldingModel");
const { PositionModel } = require('./models/PositionModel');
const {OrderModel} = require('./models/OrderModel');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo'); //session store on deployment
const passport = require('passport');//3 types 2 here 1 in modeluser
const LocalStrategy = require('passport-local');

const bodyParser = require('body-parser');
const cors = require('cors');
const { UserModel } = require('./models/UserModel');
const ExpressError = require('./utils/ExpressError');
const { holdings } = require('./Data');
const WrapAsync = require('./utils/WrapAsync');

const app = express();

const url = process.env.MONGO_URL;
const PORT = process.env.PORT || 3002;
const secret = process.env.SECRET;

// app.use(cors());
app.use(bodyParser.json());

app.use(cors({
//   origin: ['http://localhost:3001','http://localhost:3000'], // React frontend
    origin: ['https://zerodha-frontend-kappa-dun.vercel.app','https://zerodha-dashboard-brown.vercel.app',],
  credentials: true, // allow cookies to be sent   https://zerodha-dashboard-brown.vercel.app
}));

app.set("trust proxy", 1);

//mogno store
const store =MongoStore.create({
    mongoUrl:url,
    crypto: {
        secret: secret,
    },
    touchAfter:24*3600,
})
//if error
store.on("error",()=>{
    console.log("Error in Mongo Session Store",err);

})

const sessionOption ={
    store,
    secret : secret,
    resave:false,
    // store:store,
    saveUninitialized:true, 
    cookie:{
        secure: true, // ❗️this is required in production
        sameSite: "none",
        expires:Date.now() + 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }   
}


//session
app.use(session(sessionOption));

//passport //read documentation //for creatig user
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(UserModel.authenticate()))
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

// app.get('/addholding',(req,res)=>{
//         let tempHolding = [
//     {
//         name: "BHARTIARTL",
//         qty: 2,
//         avg: 538.05,
//         price: 541.15,
//         net: "+0.58%",
//         day: "+2.99%",
//     },
//     {
//         name: "HDFCBANK",
//         qty: 2,
//         avg: 1383.4,
//         price: 1522.35,
//         net: "+10.04%",
//         day: "+0.11%",
//     },
//     {
//         name: "HINDUNILVR",
//         qty: 1,
//         avg: 2335.85,
//         price: 2417.4,
//         net: "+3.49%",
//         day: "+0.21%",
//     },
//     {
//         name: "INFY",
//         qty: 1,
//         avg: 1350.5,
//         price: 1555.45,
//         net: "+15.18%",
//         day: "-1.60%",
//         isLoss: true,
//     },
//     {
//         name: "ITC",
//         qty: 5,
//         avg: 202.0,
//         price: 207.9,
//         net: "+2.92%",
//         day: "+0.80%",
//     },
//     {
//         name: "KPITTECH",
//         qty: 5,
//         avg: 250.3,
//         price: 266.45,
//         net: "+6.45%",
//         day: "+3.54%",
//     },
//     {
//         name: "M&M",
//         qty: 2,
//         avg: 809.9,
//         price: 779.8,
//         net: "-3.72%",
//         day: "-0.01%",
//         isLoss: true,
//     },
//     {
//         name: "RELIANCE",
//         qty: 1,
//         avg: 2193.7,
//         price: 2112.4,
//         net: "-3.71%",
//         day: "+1.44%",
//     },
//     {
//         name: "SBIN",
//         qty: 4,
//         avg: 324.35,
//         price: 430.2,
//         net: "+32.63%",
//         day: "-0.34%",
//         isLoss: true,
//     },
//     {
//         name: "SGBMAY29",
//         qty: 2,
//         avg: 4727.0,
//         price: 4719.0,
//         net: "-0.17%",
//         day: "+0.15%",
//     },
//     {
//         name: "TATAPOWER",
//         qty: 5,
//         avg: 104.2,
//         price: 124.15,
//         net: "+19.15%",
//         day: "-0.24%",
//         isLoss: true,
//     },
//     {
//         name: "TCS",
//         qty: 1,
//         avg: 3041.7,
//         price: 3194.8,
//         net: "+5.03%",
//         day: "-0.25%",
//         isLoss: true,
//     },
//     {
//         name: "WIPRO",
//         qty: 4,
//         avg: 489.3,
//         price: 577.75,
//         net: "+18.08%",
//         day: "+0.32%",
//     },
//     ];
//     tempHolding.forEach((item)=>{
//         let newHolding = new HoldingModel({
//             name: item.name,
//             qty: item.qty,
//             avg: item.avg,
//             price: item.price,
//             net: item.net,
//             day: item.day,
//         });
//         newHolding.save();
         
//     })
//     res.send("done");
// });


// app.get("/addposition",(req,res)=>{
//     let tempPosition = [
//     {
//         product: "CNC",
//         name: "EVEREADY",
//         qty: 2,
//         avg: 316.27,
//         price: 312.35,
//         net: "+0.58%",
//         day: "-1.24%",
//         isLoss: true,
//     },
//     {
//         product: "CNC",
//         name: "JUBLFOOD",
//         qty: 1,
//         avg: 3124.75,
//         price: 3082.65,
//         net: "+10.04%",
//         day: "-1.35%",
//         isLoss: true,
//     },
//     ];
//     tempPosition.forEach((item)=>{
//         let newPosition = new PositionModel({
//             product: item.product,
//             name: item.name,
//             qty: item.qty,
//             avg: item.avg,
//             price: item.price,
//             net: item.net,
//             day: item.day,
//             isLoss: item.isLoss,
//         });
//         newPosition.save();
//     })
//     res.send("done...")
// })

// app.get('/holdings',WrapAsync((req,res)=>{
//     res.render('holdings');
// }))
app.get('/allHoldings',WrapAsync(async(req,res)=>{
    let allholdings = await HoldingModel.find({owner:req.user._id});
    res.json(allholdings);
}));
app.get('/allpositions',WrapAsync(async(req,res)=>{
    let allpositions = await PositionModel.find({});
    res.json(allpositions);
}));

app.get('/',WrapAsync((req,res)=>{
    res.send("app star");
}));
app.post("/newOrder",WrapAsync(async(req,res)=>{
    let newOrder = OrderModel({
        name: req.body.name,
        qty: req.body.qty,
        price:req.body.price,
        mode: req.body.mode,
        owner:req.user._id,
    });
     await newOrder.save();
     
    // await HoldingModel.updateOne({name:req.body.name},{ $inc: { qty: +req.body.qty } } );
    const result = await holdings.find(item => item.name === req.body.name);
    // console.log(result);
   let chechHold = await HoldingModel.findOne({name:req.body.name,owner:req.user._id});
   if(chechHold){
        await HoldingModel.updateOne({name:req.body.name ,owner:req.user._id},{ $inc: { qty: +req.body.qty } } )
   }else{
        const holding = new HoldingModel({
        name: req.body.name,
        qty: req.body.qty,
        avg: result.avg,
        price: req.body.price,
        net: result.net,
        day: result.day,
        owner: req.user._id  // associate with logged-in user
        });

    await holding.save();
    }
    res.send("success");
}));

app.post('/sellHolding',WrapAsync(async(req,res)=>{
    let sellHolding = await HoldingModel.findOne({name:req.body.name,owner:req.user._id});
    // res.json(sellHolding);
    // console.log(sellHolding);
    res.send(sellHolding);

}))
// const isLoggedIn = (req, res, next) => {
//   if (!req.isAuthenticated || !req.isAuthenticated()) {
//     return res.status(401).json({ msg: "Unauthorized. Please log in." });
//   }
//   next();
// };

app.get('/allOrders',WrapAsync(async(req,res)=>{
    let allOrders = await OrderModel.find({owner:req.user._id});
    let name = req.user.username;
    res.json({allOrders,name});
}));
app.post("/newSellOrder",WrapAsync(async(req,res)=>{
    let newOrder = OrderModel({
        name: req.body.name,
        qty:req.body.qty,
        price:req.body.price,
        mode: req.body.mode,
        owner:req.user._id,
    });
    await newOrder.save();
    
    await HoldingModel.updateOne({name:req.body.name,owner:req.user._id},{ $inc: { qty: -req.body.qty } } );
    const updatedHolding = await HoldingModel.findOne({name: req.body.name,owner: req.user._id});
    if (updatedHolding && updatedHolding.qty <= 0) {
    await HoldingModel.deleteOne({name: req.body.name,owner: req.user._id });
    }
    res.send("success"); //res.send is imp
}));


//signup
app.post("/signUp",WrapAsync(async(req,res,next)=>{
    // let hashedPassword = await bcrypt.hash(req.body.password,10);
    // console.log(hashedPassword);
    
        let newUser = UserModel({
        username:req.body.name,
        email:req.body.email,
        // password:hashedPassword,
        });
        let user = await UserModel.register(newUser,req.body.password);
        req.login(user, (err) => {
        if(err) {
           return next(err);
        }else{
            res.send("done");
        }
        });
    // } catch (error) {
    //     throw new ExpressError(404,error.message); //no use //try catch stops crash
    // }
}));
// app.post("/login", async(req, res, next) => {
//   await passport.authenticate("local", (err, user, info) => {
//     if (err) return next(err);
//     if (!user) {
//       return res.status(401).json({ msg: "Invalid username or password" });
//     }
//     req.login(user, (err) => {
//       if (err) return next(err);
//       return res.send("Login successful");
//     });
//   })(req, res, next);
// });

app.get("/bhai",(req,res)=>{
    res.send("wel");
})
app.post("/login",passport.authenticate("local",{
    failureRedirect:"/login",
    // failureFlash:true,
}),WrapAsync(async(req,res)=>{
    res.send("welcome boss");
}))

app.get('/signup',WrapAsync((req,res)=>{
    res.redirect('/signup');
}))

//check auth
app.get('/check-auth',WrapAsync((req,res)=>{
    // console.log(req.user);
    if(req.user){
        if(req.isAuthenticated()){
        res.json({loggedIn:true});
        // res.send("donne");
        // console.log(req.user);
    }else{
        // res.send("donne");
            res.json({loggedIn:false});
        }
    }
    
}))

app.get('/logout',WrapAsync((req,res)=>{
    req.logout((err)=>{
       if(err){
        next(err);
       }
       res.send("done");
    })
}))

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error("❌ Error:", message);
  res.status(status).json({ msg: message });
});



// app.get('/check',async(req,res)=>{
//     await OrderModel.deleteMany({});

// });

app.listen(PORT,()=>{
    console.log("App started!")
    
    //mono connecct
    mongoose.connect(url);
    console.log("DB connected..")
})