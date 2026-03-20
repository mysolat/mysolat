# frozen_string_literal: true

class CreateMosques < ActiveRecord::Migration[8.0]
  def change
    create_table :mosques do |t|
      t.string :name, null: false
      t.string :registration_number
      t.text :address
      t.string :postcode
      t.string :state_id
      t.string :district_id
      t.string :type_id
      t.string :phone
      t.string :email
      t.string :website
      t.decimal :latitude, precision: 10, scale: 6
      t.decimal :longitude, precision: 10, scale: 6
      t.integer :capacity
      t.text :about
      t.decimal :distance, precision: 15, scale: 6
      t.string :jakim_id
      t.string :dun_id
      t.string :parliament_code
      t.json :metadata

      t.timestamps
    end

    add_index :mosques, :registration_number, unique: true
    add_index :mosques, :state_id
    add_index :mosques, :district_id
    add_index :mosques, %i[latitude longitude]
  end
end
