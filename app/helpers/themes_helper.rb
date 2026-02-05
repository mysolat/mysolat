# frozen_string_literal: true

module ThemesHelper
  def themes
    [
      "dark",
      "night",
      "luxury",
      "coffee",
      "forest",
      "sunset",
      "business",
      "dim",
      "aqua",
      "synthwave",
      "retro",
      "nord",
      "cupcake",
      "pastel",
      "lemonade",
      "garden",
      "emerald",
      "bumblebee",
      "fantasy",
      "autumn",
      "winter"
    ]
  end

  def theme_colors
    {
      "light" => "#ffffff",
      "dark" => "#1d232a",
      "night" => "#0f172a",
      "luxury" => "#09090b",
      "coffee" => "#20161f",
      "forest" => "#171212",
      "sunset" => "#121c22",
      "business" => "#202020",
      "dim" => "#2a303c",
      "aqua" => "#345da7",
      "synthwave" => "#1a103d",
      "retro" => "#efe9d6",
      "nord" => "#eceff4",
      "cupcake" => "#faf7f5",
      "pastel" => "#ffffff",
      "lemonade" => "#ffffff",
      "garden" => "#e9e7e7",
      "emerald" => "#ffffff",
      "bumblebee" => "#ffffff",
      "fantasy" => "#ffffff",
      "autumn" => "#f1f1f1",
      "winter" => "#f2f7fe"
    }
  end

  def current_theme_color(theme = nil)
    theme ||= cookies[:theme] || "dark"
    theme_colors[theme] || theme_colors["dark"]
  end
end
