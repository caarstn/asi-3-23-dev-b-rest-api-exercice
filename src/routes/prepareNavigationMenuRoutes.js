import NavigationMenuModel from "../db/models/NavigationMenuModel.js"
import UserModel from "../db/models/UserModel.js"
import auth from "../middlewares/authentication.js"
import validate from "../middlewares/validate.js"
import {
  nameValidator, 
  limitValidator,
  idValidator,
  orderFieldValidator, 
  orderValidator, 
  pageValidator,
  stringValidator, 
  jsonValidator, 
} from "../validators.js"

const prepareNavigationMenuRoutes = ({ app }) => {
  app.post(
    "/create-menu",
    auth,
    validate({
      body: {
        name: nameValidator.required(),
        pages: jsonValidator.required(), 
      },
    }),
    async (req, res) => {
      const {
        body: { name, pages },
        session: {
          user: { id: userId },
        },
      } = req.locals

      const user = await UserModel.query().select("roleId").findById(userId)

      if (user.roleId !== 1 && user.roleId !== 2) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const menu = await NavigationMenuModel.query()
          .insert({
            name: name,
            pages: pages,
          })
          .returning("*")
    
        res.send({ result: menu })
      }
    })

  
  app.get(
    "/menus",
    auth, 
    validate({
      body: {
        limit: limitValidator.required(),
        page: pageValidator.required(),
        orderField: orderFieldValidator(["name"]).default("name"),
        order: orderValidator.default("desc"),
      },
    }),
    async (req, res) => {
      const { limit, page, orderField, order } = req.locals.body
      const query = NavigationMenuModel.query().page(page, limit)

      if (orderField) {
        query.orderBy(orderField, order)
      }

      const menu = await query

      res.send({ result: menu })
    })


  app.get(
    "/menus/:menuId",
    auth, 
    validate({
      params: {
        menuId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const menu = await NavigationMenuModel.query().findById(req.params.menuId)

      if (!menu) {
        res.status(404).send({ error: "not found" })

        return
      }

      res.send({ result: menu })
    }
  )


  app.patch(
    "/menus/:menuId",
    auth, 
    validate({
      body: {
        name: stringValidator,
        pages: jsonValidator,
      },
      params: {
        navId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { name, pages },
        session: {
          user: { id: userId },
        },
      } = req.locals

      const user = await UserModel.query().select("roleId").findById(userId)

      if (user.roleId !== 1 && user.roleId !== 2) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const menu = await NavigationMenuModel.query().findById(req.params.menuId)

        if (!menu) {
          res.status(404).send({ error: "not found" })

          return
        }

        const updatedMenu = await NavigationMenuModel.query()
          .update({
            ...(name ? { name } : {}),
            ...(pages ? { pages } : {}),
          })
          .where({
            id: req.params.menuId,
          })
          .returning("*")

        res.send({ result: updatedMenu })
      }
    })
  
  
  app.delete(
    "/menus/:menuId",
    auth,
    validate({
      params: {
        menuId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { id: userId } = req.locals.session.user

      const user = await UserModel.query().select("roleId").findById(userId)

      if (user.roleId !== 1 && user.roleId !== 2) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const menu = await NavigationMenuModel.query().findById(req.params.menuId) 

        if (!menu) {
          res.status(404).send({ error: "not found" })

          return
        }

        const deletedMenu = await NavigationMenuModel.query().delete().where({
          id: req.params.menuId,
        })

        res.send({ result: deletedMenu })
      }
    })
  }

  export default prepareNavigationMenuRoutes