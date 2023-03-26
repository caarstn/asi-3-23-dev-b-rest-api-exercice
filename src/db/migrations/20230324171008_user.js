import hashPassword from "../hashPassword.js"

const [passwordHash, passwordSalt] = await hashPassword("projetBack")

export const up = async (knex) => {
  await knex.schema
    .createTable("users", (table) => {
      table.increments("id")
      table.text("email").notNullable().unique()
      table.text("passwordHash").notNullable()
      table.text("passwordSalt").notNullable()
      table.text("firstName").notNullable()
      table.text("lastName").notNullable()
      table.integer("roleId").references("id").inTable("roles").notNullable()
      table.timestamps(true, true, true)
    })
    .then(() =>
      knex("users").insert({
        lastName: "ADMINS",
        firstName: "Admin",
        email: "admins.admin@gmail.com",
        passwordHash: passwordHash,
        passwordSalt: passwordSalt,
        roleId: 1,
      })
    )
}

export const down = async (knex) => {
  await knex.schema.dropTable("users")
}
