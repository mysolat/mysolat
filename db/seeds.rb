# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

require "json"

def build_about(entry)
  sections = []
  sections << "## Lokasi\n\n#{entry["lokasi"].strip}" if entry["lokasi"]&.strip.present?
  sections << "## Kemudahan\n\n#{entry["kemudahan"].strip}" if entry["kemudahan"]&.strip.present?
  sections << "## Binaan\n\n#{entry["binaan"].strip}" if entry["binaan"]&.strip.present?
  sections << "## Keistimewaan\n\n#{entry["istimewa"].strip}" if entry["istimewa"]&.strip.present?
  sections << "## Sejarah\n\n#{entry["sejarah"].strip}" if entry["sejarah"]&.strip.present?
  sections.join("\n\n").presence
end

# Import mosques from JAKIM data
mosque_file = Rails.root.join("public/mosque.json")
if mosque_file.exist?
  data = JSON.parse(mosque_file.read)

  primary_keys = %w[
    nama_masjid no_daftar alamat poskod id_negeri id_daerah
    id_jenis tel email url_website latitud longitud kapasiti
    sejarah kemudahan lokasi binaan istimewa
    distance id_masjid id_dun kod_parlimen
  ]

  records = data["locationData"].map do |entry|
    metadata = entry.except(*primary_keys)

    {
      name: entry["nama_masjid"]&.strip,
      registration_number: entry["no_daftar"].presence,
      address: entry["alamat"]&.strip,
      postcode: entry["poskod"].presence,
      state_id: entry["id_negeri"].presence,
      district_id: entry["id_daerah"].presence,
      type_id: entry["id_jenis"].presence,
      phone: entry["tel"].presence,
      email: entry["email"].presence,
      website: entry["url_website"].presence,
      latitude: entry["latitud"].presence,
      longitude: entry["longitud"].presence,
      capacity: entry["kapasiti"].to_i.nonzero?,
      about: build_about(entry),
      distance: entry["distance"].presence,
      jakim_id: entry["id_masjid"].presence,
      dun_id: entry["id_dun"].presence,
      parliament_code: entry["kod_parlimen"].presence,
      metadata: metadata
    }
  end

  Mosque.upsert_all(records, unique_by: :registration_number)
  puts "Imported #{Mosque.count} mosques"
end
