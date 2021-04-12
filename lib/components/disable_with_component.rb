module DisableWithSimpleForms
  def button(type, *args, &block)
    options = args.dup.extract_options!
    disable_with = "<span class='loading dots'> Saving </span>".html_safe
    options[:data] ||= {}
    if options[:name] == :commit
      options[:data][:disable_with] ||= disable_with
    end
    super(type, *args, &block)
  end
end

SimpleForm::FormBuilder.prepend(DisableWithSimpleForms)
