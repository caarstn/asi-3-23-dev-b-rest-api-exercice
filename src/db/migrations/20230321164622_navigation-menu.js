export const up = async (knex) => {
  await knex.schema.createTable("navigationMenu", (table) => {
    table.increments("id") 
    table.text("name").notNullable()
    table.json("pages")
  })
}

export const down = async (knex) => {
  await knex.schema.dropTable("navigationMenu")
}