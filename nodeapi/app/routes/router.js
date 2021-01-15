module.exports = app => {
    const express = require("express")

    // USERS ROUTES
    const users = require("../controllers/userController")
    var usersRouter = express.Router()
    usersRouter.get("/", users.findAll)
    usersRouter.get("/:id", users.findOne)
    usersRouter.post("/", users.createOne)
    
    // AUTH ROUTES
    const authRoutes = express.Router()
    authRoutes.post("/", users.attemptLogin)





    // ACCOUNTS ROUTES
    //const users = require("../controllers/userController")
    const accountsRouter = express.Router()

    // AUTHENTICATION ROUTES

    // BUDGETS ROUTES

    // CATEGORIES ROUTES

    // ENTITIES ROUTES

    // RULES ROUTES

    // STATS ROUTES

    // TRANSACTIONS ROUTES

    app.use("/users", usersRouter)
    app.use("/auth", authRoutes)
    app.use("/accounts", accountsRouter)
}