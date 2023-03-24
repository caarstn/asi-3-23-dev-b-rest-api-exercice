export const up = async (knex) => {
  await knex.schema.createTable("pages", (table) => {
    table.increments("id")
    table.text("title").notNullable()
    table.text("content").notNullable()
    table.text("urlSlug").notNullable().unique()
    table.integer("creator").references("id").inTable("users").notNullable()
    table.text("modifyBy").notNullable()
    table.datetime("pubishedAt").notNullable()
    table.timestamps(true, true, true)
    table.boolean("status").notNullable()
  })
}

export const down = async (knex) => {
  await knex.schema.dropTable("pages")
}