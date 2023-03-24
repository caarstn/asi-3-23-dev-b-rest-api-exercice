import BaseModel from "./BaseModel.js"
import UserModel from "./UserModel.js"

class RoleModel extends BaseModel {
  static tableName = "role"

   static relationMappings() {
    return {
      part: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: "role.userId",
          to: "users.id",
        },
      },
    }
  }
}

export default RoleModel