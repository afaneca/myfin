module.exports = app => {
    const express = require("express")

    // USERS ROUTES
    const users = require("../controllers/userController")
    var usersRouter = express.Router()
    /*usersRouter.get("/", users.findAll)
    usersRouter.get("/:id", users.findOne)*/
    usersRouter.post("/", users.createOne)
    
    // AUTH ROUTES
    const authRoutes = express.Router()
    authRoutes.post("/", users.attemptLogin)

    const validityRoutes = express.Router()
    validityRoutes.post("/", users.checkSessionValidity)

    // ACCOUNTS ROUTES
    //const users = require("../controllers/userController")
    const accountsRouter = express.Router()

    // BUDGETS ROUTES

    // CATEGORIES ROUTES

    // ENTITIES ROUTES

    // RULES ROUTES

    // STATS ROUTES

    // TRANSACTIONS ROUTES

    app.use("/users", usersRouter)
    app.use("/auth", authRoutes)
    app.use("/validity", validityRoutes)
    app.use("/accounts", accountsRouter)
}