from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from .models import Exit, Client
from django.template.loader import render_to_string

@receiver(post_save, sender=Exit)
def send_exit_email(sender, instance, created, **kwargs):
    if created:
        # Verifica si hay más salidas no autorizadas para el mismo cliente y fecha
        pending_exits = Exit.objects.filter(client=instance.client, date=instance.date, is_authorized=False)
        
        # Solo envía el correo si es la primera entrada del pedido
        if pending_exits.count() == 1:
            client_exits = Exit.objects.filter(client=instance.client, date=instance.date)
            all_exits = Exit.objects.filter(client=instance.client).exclude(date=instance.date)

            email_subject = f'Nuevo pedido a autorizar - {instance.client.name}'

            email_body = render_to_string('email_exit_notification.html', {
                'client_exits': client_exits,
                'all_exits': all_exits,
                'client': instance.client,
                'date': instance.date,
            })

            send_mail(
                email_subject,
                '',
                'amalia.flisa@gmail.com',  # Cambia esto por tu correo electrónico de envío
                ['apons@ilunion.com'],  # Cambia esto por el correo electrónico del encargado
                fail_silently=False,
                html_message=email_body,
            )
