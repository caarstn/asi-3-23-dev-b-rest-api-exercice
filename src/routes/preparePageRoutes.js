import PageModel from "../db/models/PageModel.js"
import UserModel from "../db/models/UserModel.js"
import auth from "../middlewares/authentication.js"
import validate from "../middlewares/validate.js"
import {
  boolValidator,
  stringValidator,
  contentValidator,
  idValidator,
  limitValidator,
  orderFieldValidator,
  orderValidator,
  pageValidator,
  titleValidator,
} from "../validators.js"

const preparePageRoutes = ({ app }) => {
  app.post(
    "/create-page",
    auth,
    validate({
      body: {
        title: titleValidator.required(),
        content: contentValidator.required(),
        urlSlug: stringValidator.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { title, content, urlSlug },
        session: {
          user: { id: userId },
        },
      } = req.locals
      const user = await UserModel.query().select("roleId").findById(userId)

      if (user.roleId !== 1 && user.roleId !== 2) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const page = await PageModel.query()
          .insert({
            title: title,
            content: content,
            urlSlug: urlSlug,
            creator: userId,
          })
          .returning("*")

        res.send({ result: page })
      }
    }
  )

  app.get(
    "/pages",
    auth,
    validate({
      body: {
        limit: limitValidator.required(),
        page: pageValidator.required(),
        orderField: orderFieldValidator(["title", "content"]).default("title"),
        order: orderValidator.default("desc"),
        status: boolValidator,
      },
    }),
    async (req, res) => {
      const {
        body: { limit, page, orderField, order, status },
        session: {
          user: { id: userId },
        },
      } = req.locals

      if (!userId && status === false) {
        res.status(405).send({ error: "Forbidden" })

        return
      }

      const query = PageModel.query().page(page, limit)

      if (!userId) {
        query.where("status", true)
      }

      if (userId && status) {
        query.where("status", status)
      }

      if (orderField) {
        query.orderBy(orderField, order)
      }

      const pages = await query

      res.send({ result: pages })
    }
  )
  app.get(
    "/pages/:pageId",
    auth,
    validate({
      params: {
        pageId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { id: userId } = req.locals.session.user

      const page = await PageModel.query().findById(req.params.pageId)

      if (!page) {
        res.status(404).send({ error: "not found" })

        return
      }

      if (page.status === false && !userId) {
        res.status(405).send({ error: "Forbidden" })

        return
      }

      res.send({ result: page })
    }
  )

  app.patch(
    "/pages/:pageId",
    auth,
    validate({
      body: {
        title: titleValidator,
        content: contentValidator,
        status: boolValidator,
      },
    }),
    async (req, res) => {
      const {
        body: { title, content, status },
        session: {
          user: { id: userId },
        },
      } = req.locals

      if (!userId) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const page = await PageModel.query().findById(req.params.pageId)

        if (!page) {
          res.status(404).send({ error: "not found" })

          return
        }

        const updatedPage = await PageModel.query()
          .update({
            ...(title ? { title } : {}),
            ...(content ? { content } : {}),
            ...(status ? { status } : {}),
          })
          .where({
            id: req.params.pageId,
          })
          .returning("*")

        res.send({ result: updatedPage })
      }
    }
  )

  app.delete(
    "/pages/:pageId",
    auth,
    validate({
      params: {
        pageId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const { id: userId } = req.locals.session.user
      const user = await UserModel.query().select("roleId").findById(userId)

      if (user.roleId !== 1 && user.roleId !== 2) {
        res.status(405).send({ error: "Forbidden" })

        return
      } else {
        const deletedPage = await PageModel.query().findById(req.params.pageId)

        if (!deletedPage) {
          res.status(404).send({ error: "not found" })

          return
        }

        await PageModel.query().delete().where({
          id: req.params.pageId,
        })

        res.send({ result: deletedPage })
      }
    }
  )
}

export default preparePageRoutes
