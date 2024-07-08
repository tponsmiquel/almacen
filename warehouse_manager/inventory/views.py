from collections import defaultdict
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.urls import reverse
from django.db.models import Q
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Exit, Article, Client, Entry
from .serializers import ExitSerializer, ArticleSerializer, EntrySerializer, ClientSerializer

class ExitViewSet(viewsets.ModelViewSet):
    queryset = Exit.objects.all()
    serializer_class = ExitSerializer

    @action(detail=False, methods=['post'])
    def create_multiple(self, request):
        client_id = request.data.get('client')
        date = request.data.get('date')
        articles = request.data.get('articles')  # Lista de artículos con cantidades

        if not client_id or not date or not articles:
            return Response({'error': 'Datos inválidos'}, status=status.HTTP_400_BAD_REQUEST)

        client = Client.objects.get(id=client_id)
        exits = []

        for item in articles:
            article_id = item.get('article')
            quantity = item.get('quantity')
            if not article_id or not quantity:
                continue
            article = Article.objects.get(id=article_id)
            exit_instance = Exit.objects.create(article=article, client=client, quantity=quantity, date=date, is_authorized=False)
            exits.append(exit_instance)

        # Obtener el histórico de pedidos para los artículos solicitados por el cliente
        historical_exits = Exit.objects.filter(
            client=client,
            article__in=[item.get('article') for item in articles]
        ).exclude(
            Q(date=date)
        ).order_by('-date')

        # Agrupar por año y artículo
        historical_data = defaultdict(lambda: defaultdict(int))
        for h_exit in historical_exits:
            year = h_exit.date.year
            historical_data[year][h_exit.article.name] += h_exit.quantity

        # Convertir defaultdict a dict antes de pasarlo a la plantilla y ordenar por año
        historical_data = {year: dict(articles) for year, articles in sorted(historical_data.items())}

        # Ordenar los exits alfabéticamente por el nombre del artículo
        exits = sorted(exits, key=lambda x: x.article.name)  # Esta línea realiza la ordenación alfabética

        email_subject = f'Nuevo pedido a autorizar - {client.name}'
        email_body = render_to_string('email_exit_notification.html', {
            'client_exits': exits,
            'client': client,
            'date': date,
            'historical_data': historical_data,
        })

        # Print statement to verify recipients
        print("Enviando correo a:", settings.EMAIL_RECIPIENT)

        send_mail(
            email_subject,
            '',
            settings.EMAIL_HOST_USER,  # Cambia esto por tu correo electrónico de envío
            settings.EMAIL_RECIPIENT,  # Asegúrate de que sea una lista
            fail_silently=False,
            html_message=email_body,
        )

        debug_info = {
            'status': 'Pedido creado y email enviado',
            'exits': [{'article': e.article.name, 'quantity': e.quantity} for e in exits]
        }
        return Response(debug_info, status=status.HTTP_201_CREATED)

def authorize_exit(request, pk):
    # Obtener la salida correspondiente
    exit_instance = get_object_or_404(Exit, pk=pk)
    
    # Obtener todas las salidas del mismo cliente en la misma fecha
    exits = Exit.objects.filter(client=exit_instance.client, date=exit_instance.date)
    
    # Autorizar todas las salidas
    for exit in exits:
        exit.is_authorized = True
        exit.save()

    return HttpResponse('Pedido autorizado con éxito.')

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer

class EntryViewSet(viewsets.ModelViewSet):
    queryset = Entry.objects.all()
    serializer_class = EntrySerializer
