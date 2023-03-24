import UserModel from "../db/models/UserModel.js"
import validate from "../middlewares/validate.js"
import hashPassword from "./../db/hashPassword.js"
import auth from "../middlewares/authentication.js"
import {
  limitValidator, 
  firstNameValidator, 
  lastNameValidator, 
  idValidator, 
  emailValidator,
  passwordValidator,
  stringValidator, 
  pageValidator, 
  orderFieldValidator, 
  orderValidator, 
  filterValidator, 
} from "../validators.js"

const prepareUserRoutes = ({ app }) => {
  app.post(
    "/create-user",
    auth,
    validate({
      body: {
        lastName: lastNameValidator.required(),
        firstName: firstNameValidator.required(),
        email: emailValidator.required(),
        password: passwordValidator.required(),
        role: stringValidator.required(),
      },
    }),
    
    async (req, res) => {
      const {
        body: { lastName, firstName, email, password, role },
        session: {
          user: { id: userId },
        },
      } = req.locals
      const loggedUser = await UserModel.query().select("roleId").findById(userId)

      if (loggedUser.roleId !== 1) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const [passwordHash, passwordSalt] = await hashPassword(password)
        const newUser = await UserModel.query().insert({
          lastName: lastName,
          firstName:firstName,
          email: email,
          passwordHash: passwordHash,
          passwordSalt: passwordSalt,
          roleId: role,
        })

          .returning("*")

        res.send({ result: newUser })
      }
    }
  )
  
  app.get(
    "/users",
    auth,
    validate({
      body: {
        limit: limitValidator,
        page: pageValidator,
        orderField: orderFieldValidator([
          "firstName",
          "lastName",
          "email",
        ]).default("fistName"),
        order: orderValidator.default("desc"),
        filterRole: filterValidator(["admin", "manager", "editor"]),
      }.orNull,
      },
    ),
    async (req, res) => {
      const {
        body: { limit, page, orderField, order },
        
        session: {
          user: { id: userId }
        },
      } = req.locals

      const user = await UserModel.query().select("roleId").findById(userId)

      if (user.roleId !== 1) {
        res.status(405).send({ error: "Forbidden" })
        
        return
      } else {
        const query = UserModel.query().page(page, limit)

        if (orderField) {
          query.orderBy(orderField, order)
        }

        const allUsers = await query 

        res.send({ result: allUsers })
      }
    })
  app.get(
    "/users/:userId",
    auth,
    validate({
      params: { userId: idValidator.required() },
    }),
    async (req, res) => {
      const user = await UserModel.query().findById(req.params.userId)
      const { id: loggedUserId } = req.locals.session.user
      const loggedUser = await UserModel.query().select("roleId").findById(loggedUserId)

      if (loggedUser.roleId !== 1 || loggedUserId !== parseInt(req.params.userId)) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        if (!user) {
          res.status(404).send({ error: "Not found" })

          return
        }
      }

      res.send({ result: user })
    }
  )

  app.patch(
    "/users/:userId",
    auth,
    validate({
      body: {
        firstName: firstNameValidator,
        lastName: lastNameValidator,
        password: passwordValidator, 
        email: emailValidator,
        role: stringValidator,
      },
      params: { userId: idValidator.required() },
    }),
    async (req, res) => {
      const {
        locals: {
          body: { firstName, lastName, email, role, password },
        },
        sessions: { user: userId },
      } = req.locals

      const userRoleId = await UserModel.query().select("roleId").findById(userId)
      const userLogged = await UserModel.query().select("id").fintById(userId)

      if (userLogged.roleId !== 1 || userRoleId !== parseInt(req.params.userId)) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const user = await UserModel.query().findById(req.params.userId)

        if (!user) {
          return
        }

        const updatedUser = await UserModel.query().updateAndFetchById(userId, {
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
          ...(password ? { password } : {}), 
          ...(email ? { email } : {}),
          ...(role ? { role } : {}),
        })
        
          .where({
            id: req.params.userId,
          })
          
          .returning("*")


        res.send({ result: updatedUser })
      }
    })

  app.delete(
    "/users/:userId",
    auth,
    validate({
      params: { userId: idValidator.required() },
    }),
    async (req, res) => {
      const { userId } = req.locals.params
      const userRoleId = await UserModel.query().select("roleId").findById(userId)

      if (userRoleId.roleId !== 1 || userId !== parseInt(req.params.userId)) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const deletedUser = await UserModel.query().findById(req.params.userId)

        if (!deletedUser) {
          res.status(404).send({ error: "Not found" })

          return
        }

        res.send({ result: deletedUser })
      }
    })
}
export default prepareUserRoutes