from django.utils.encoding import force_text
def log_addition(request, object):
    """
    Log that an object has been successfully added.
    The default implementation creates an admin LogEntry object.
    """
    from django.contrib.admin.models import LogEntry, ADDITION
    LogEntry.objects.log_action(
        user_id=request.user.pk,
        content_type_id=get_content_type_for_model(object).pk,
        object_id=object.pk,
        object_repr=force_text(object),
        action_flag=ADDITION
    )

def get_content_type_for_model(obj):
    # Since this module gets imported in the application's root package,
    # it cannot import models from other applications at the module level.
    from django.contrib.contenttypes.models import ContentType
    return ContentType.objects.get_for_model(obj, for_concrete_model=False)
    
def log_change(request, object, message):
        
    """
    Log that an object has been successfully changed.
    The default implementation creates an admin LogEntry object.
    """
    from django.contrib.admin.models import LogEntry, CHANGE
    LogEntry.objects.log_action(
    user_id=request.user.pk,
    content_type_id=get_content_type_for_model(object).pk,
    object_id=object.pk,
    object_repr=force_text(object),
    action_flag=CHANGE,
    change_message=message
    )    
    
def log_deletion(request, object, object_repr):
    """
    Log that an object will be deleted. Note that this method must be
    called before the deletion.

    The default implementation creates an admin LogEntry object.
    """
    from django.contrib.admin.models import LogEntry, DELETION
    LogEntry.objects.log_action(
        user_id=request.user.pk,
        content_type_id=get_content_type_for_model(object).pk,
        object_id=object.pk,
        object_repr=object_repr,
        action_flag=DELETION
    )
def user_history_actions(request):
    from django.contrib.admin.models import LogEntry
    return LogEntry.objects.filter(object_id = '3')

'''def history_view(request, object_id, extra_context=None):
    "The 'history' admin view for this model."
    from django.contrib.admin.models import LogEntry
    # First check if the user can see this history.
    model = self.model
    obj = get_object_or_404(self.get_queryset(request), pk=unquote(object_id))

    if not self.has_change_permission(request, obj):
        raise PermissionDenied

    # Then get the history for this object.
    opts = model._meta
    app_label = opts.app_label
    action_list = LogEntry.objects.filter(
        object_id=unquote(object_id),
        content_type=get_content_type_for_model(model)
    ).select_related().order_by('action_time')

    context = dict(self.admin_site.each_context(),
        title=_('Change history: %s') % force_text(obj),
        action_list=action_list,
        module_name=capfirst(force_text(opts.verbose_name_plural)),
        object=obj,
        opts=opts,
        preserved_filters=self.get_preserved_filters(request),
    )
    context.update(extra_context or {})
    return TemplateResponse(request, self.object_history_template or [
        "admin/%s/%s/object_history.html" % (app_label, opts.model_name),
        "admin/%s/object_history.html" % app_label,
        "admin/object_history.html"
    ], context, current_app=self.admin_site.name) '''