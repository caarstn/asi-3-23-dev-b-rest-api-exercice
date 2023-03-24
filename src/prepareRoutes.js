import prepareUserRoutes from "./routes/prepareUserRoutes.js"
import prepareSignRoutes from "./routes/prepareSignRoutes.js"
import preparePageRoutes from "./routes/preparePageRoutes.js"
import prepareNavigationMenuRoutes from "./routes/prepareNavigationMenuRoutes.js"

const prepareRoutes = (ctx) => {
  prepareSignRoutes(ctx)
  prepareUserRoutes(ctx)
  preparePageRoutes(ctx)
  prepareNavigationMenuRoutes(ctx)
}

export default prepareRoutes
