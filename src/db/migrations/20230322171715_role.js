export const up = async (knex) => {
  await knex.schema
    .createTable("roles", (table) => {
      table.increments("id")
      table.text("Name").notNullable()
    })
    .then(() =>
      knex("roles").insert([
        { Name: "admin" },
        { Name: "manager" },
        { Name: "editor" },
      ])
    )
}

export const down = async (knex) => {
  await knex.schema.dropTable("roles")
}
