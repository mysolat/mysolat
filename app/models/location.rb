module Location
  def self.list
    zones = [
      { code: "JHR01", zone: "Pulau Aur dan Pemanggil", state: "Johor"},
      { code: "JHR02", zone: "Kota Tinggi, Mersing, Johor Bahru", state: "Johor"},
      { code: "JHR03", zone: "Kluang dan Pontian", state: "Johor"},
      { code: "JHR04", zone: "Batu Pahat, Muar, Segamat, Gemas", state: "Johor"},
      { code: "KDH01", zone: "Kota Setar, Kubang Pasu, Pokok Sena", state: "Kedah"},
      { code: "KDH02", zone: "Pendang, Kuala Muda, Yan", state: "Kedah"},
      { code: "KDH03", zone: "Padang Terap, Sik", state: "Kedah"},
      { code: "KDH04", zone: "Baling", state: "Kedah"},
      { code: "KDH05", zone: "Kulim, Bandar Bahru", state: "Kedah"},
      { code: "KDH06", zone: "Langkawi", state: "Kedah"},
      { code: "KDH07", zone: "Gunung Jerai", state: "Kedah"},
      { code: "KTN01", zone: "K.Bharu, Bachok, Pasir Puteh, Tumpat, Pasir Mas,Tnh. Merah, Machang, Kuala Krai, Mukim Chiku", state: "Kelantan"},
      { code: "KTN03", zone: "Jeli, Gua Musang (Mukim Galas, Bertam)", state: "Kelantan"},
      { code: "MLK01", zone: "Bandar Melaka, Alor Gajah, Jasin, Masjid Tanah, Merlimau, Nyalas", state: "Melaka"},
      { code: "NGS01", zone: "Jempol, Tampin", state: "Negeri Sembilan"},
      { code: "NGS02", zone: "Port Dickson, Seremban, Kuala Pilah, Jelebu, Rembau", state: "Negeri Sembilan"},
      { code: "PHG01", zone: "Pulau Tioman", state: "Pahang"},
      { code: "PHG02", zone: "Kuantan, Pekan, Rompin, Muadzam Shah", state: "Pahang"},
      { code: "PHG03", zone: "Maran, Chenor, Temerloh, Bera, Jerantut", state: "Pahang"},
      { code: "PHG04", zone: "Bentong, Raub, Kuala Lipis", state: "Pahang"},
      { code: "PHG05", zone: "Genting Sempah, Janda Baik, Bukit Tinggi", state: "Pahang"},
      { code: "PHG06", zone: "Bukit Fraser, Genting Higlands, Cameron Higlands", state: "Pahang"},
      { code: "PLS01", zone: "Kangar, Padang Besar, Arau", state: "Perlis"},
      { code: "PNG01", zone: "Seluruh Negeri Pulau Pinang", state: "Pulau Pinang"},
      { code: "PRK01", zone: "Tapah, Slim River dan Tanjung Malim", state: "Perak"},
      { code: "PRK02", zone: "Ipoh, Batu Gajah, Kampar, Sg. Siput dan Kuala Kangsar", state: "Perak"},
      { code: "PRK03", zone: "Pengkalan Hulu, Grik dan Lenggong", state: "Perak"},
      { code: "PRK04", zone: "Temengor dan Belum", state: "Perak"},
      { code: "PRK05", zone: "Teluk Intan, Bagan Datoh, Kg.Gajah, Sri Iskandar, Beruas, Parit, Lumut, Setiawan dan Pulau Pangkor", state: "Perak"},
      { code: "PRK06", zone: "Selama, Taiping, Bagan Serai dan Parit Buntar", state: "Perak"},
      { code: "PRK07", zone: "Bukit Larut", state: "Perak"},
      { code: "SBH01", zone: "Sandakan, Bdr. Bkt. Garam, Semawang, Temanggong, Tambisan", state: "Sabah"},
      { code: "SBH02", zone: "Pinangah, Terusan, Beluran, Kuamut, Telupit", state: "Sabah"},
      { code: "SBH03", zone: "Lahad Datu, Kunak, Silabukan, Tungku, Sahabat, Semporna", state: "Sabah"},
      { code: "SBH04", zone: "Tawau, Balong, Merotai, Kalabakan", state: "Sabah"},
      { code: "SBH05", zone: "Kudat, Kota Marudu, Pitas, Pulau Banggi", state: "Sabah"},
      { code: "SBH06", zone: "Gunung Kinabalu", state: "Sabah"},
      { code: "SBH07", zone: "Papar, Ranau, Kota Belud, Tuaran, Penampang, Kota Kinabalu", state: "Sabah"},
      { code: "SBH08", zone: "Pensiangan, Keningau, Tambunan, Nabawan", state: "Sabah"},
      { code: "SBH09", zone: "Sipitang, Membakut, Beaufort, Kuala Penyu, Weston, Tenom, Long Pa Sia", state: "Sabah"},
      { code: "SGR01", zone: "Gombak, H.Selangor, Rawang, H.Langat, Sepang,Petaling, S.Alam", state: "Selangor"},
      { code: "SGR02", zone: "Sabak Bernam, Kuala Selangor, Klang, Kuala Langat", state: "Selangor"},
      { code: "SGR03", zone: "Kuala Lumpur", state: "Kuala Lumpur"},
      { code: "SGR04", zone: "Putrajaya", state: "Putrajaya"},
      { code: "SWK01", zone: "Limbang, Sundar, Terusan, Lawas", state: "Sarawak"},
      { code: "SWK02", zone: "Niah, Belaga, Sibuti, Miri, Bekenu, Marudi", state: "Sarawak"},
      { code: "SWK03", zone: "Song, Belingan, Sebauh, Bintulu, Tatau, Kapit", state: "Sarawak"},
      { code: "SWK04", zone: "Igan, Kanowit, Sibu, Dalat, Oya", state: "Sarawak"},
      { code: "SWK05", zone: "Belawai, Matu, Daro, Sarikei, Julau, Bitangor, Rajang", state: "Sarawak"},
      { code: "SWK06", zone: "Kabong, Lingga, Sri Aman, Engkelili, Betong, Spaoh, Pusa, Saratok, Roban, Debak", state: "Sarawak"},
      { code: "SWK07", zone: "Samarahan, Simunjan, Serian, Sebuyau, Meludam", state: "Sarawak"},
      { code: "SWK08", zone: "Kuching, Bau, Lundu, Sematan", state: "Sarawak"},
      { code: "SWK09", zone: "Zon Khas", state: "Sarawak"},
      { code: "TRG01", zone: "Kuala Terengganu, Marang", state: "Terengganu"},
      { code: "TRG02", zone: "Besut, Setiu", state: "Terengganu"},
      { code: "TRG03", zone: "Hulu Terengganu", state: "Terengganu"},
      { code: "TRG04", zone: "Kemaman Dungun", state: "Terengganu"},
      { code: "WLY02", zone: "Labuan", state: "Labuan"}
    ]
  end
end
