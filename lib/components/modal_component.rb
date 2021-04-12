module FormBuilderContainer
  def container_for(attribute, **options, &block)
    return unless block_given?

    options.merge!(class: container_class_for(attribute))
    @template.tag.div @template.capture(&block), options
  end

  def container_class_for(attribute)
    remote_form? ? "modal-#{attribute}" : "form-#{attribute}"
  end

  def modal_close
    return unless remote_form?

    "<button aria-label='Close' class='close' data-dismiss='modal' type='button'>
      <span aria-hidden='true'> × </span>
      <span class='sr-only'>Close</span>
    </button>".html_safe
  end

  def error_notification(options = {})
    if key = options.delete(:key)
      error_notification message: object.errors[key.to_sym].to_sentence if object.errors[key.to_sym].present?
    else
      super
    end
  end

  private

  def remote_form?
    template.controller.request.xhr?
  end
end

SimpleForm::FormBuilder.prepend(FormBuilderContainer)
