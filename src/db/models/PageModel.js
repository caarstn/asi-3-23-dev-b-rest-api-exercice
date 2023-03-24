import BaseModel from "./BaseModel.js"
import UserModel from "./UserModel.js"

class PageModel extends BaseModel {
  static tableName = "pages"

   static relationMappings() {
    return {
      author: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: "pages.creator",
          to: "users.id",
        },
        modify: (query) => query.select("id", "displayName"),
      },
    }
  }
}

export default PageModel