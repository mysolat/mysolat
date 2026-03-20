# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_02_19_123209) do
  create_table "mosques", force: :cascade do |t|
    t.text "about"
    t.text "address"
    t.integer "capacity"
    t.datetime "created_at", null: false
    t.decimal "distance", precision: 15, scale: 6
    t.string "district_id"
    t.string "dun_id"
    t.string "email"
    t.string "jakim_id"
    t.decimal "latitude", precision: 10, scale: 6
    t.decimal "longitude", precision: 10, scale: 6
    t.json "metadata"
    t.string "name", null: false
    t.string "parliament_code"
    t.string "phone"
    t.string "postcode"
    t.string "registration_number"
    t.string "state_id"
    t.string "type_id"
    t.datetime "updated_at", null: false
    t.string "website"
    t.index ["district_id"], name: "index_mosques_on_district_id"
    t.index ["latitude", "longitude"], name: "index_mosques_on_latitude_and_longitude"
    t.index ["registration_number"], name: "index_mosques_on_registration_number", unique: true
    t.index ["state_id"], name: "index_mosques_on_state_id"
  end

  create_table "push_subscriptions", force: :cascade do |t|
    t.string "auth_key", null: false
    t.datetime "created_at", null: false
    t.string "endpoint", null: false
    t.string "endpoint_ip"
    t.string "p256dh_key", null: false
    t.datetime "updated_at", null: false
    t.string "zone", default: "WLY01", null: false
    t.index ["endpoint"], name: "index_push_subscriptions_on_endpoint", unique: true
    t.index ["zone"], name: "index_push_subscriptions_on_zone"
  end
end
