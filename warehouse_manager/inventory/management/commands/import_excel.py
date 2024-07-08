import pandas as pd
from django.core.management.base import BaseCommand
from inventory.models import Article, Exit, Client
from datetime import datetime

class Command(BaseCommand):
    help = 'Import data from an Excel file'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str)

    def handle(self, *args, **kwargs):
        file_path = kwargs['file_path']
        df = pd.read_excel(file_path)

        # Crear un diccionario para mapear nombres de clientes a sus IDs
        client_name_to_id = {client.name: client.id for client in Client.objects.all()}

        for index, row in df.iterrows():
            article_name = row['article']  # Ajusta según el nombre de la columna
            client_name = row['client']  # Ajusta según el nombre de la columna
            quantity = row['quantity']  # Ajusta según el nombre de la columna
            date_val = row['date']  # Ajusta según el nombre de la columna

            # Depuración: imprimir los valores leídos
            print(f"Artículo: {article_name}, Cliente: {client_name}, Cantidad: {quantity}, Fecha: {date_val}")

            # Convertir la fecha al formato YYYY-MM-DD si es necesario
            if isinstance(date_val, datetime):
                date = date_val.date()
            elif isinstance(date_val, str):
                date = datetime.strptime(date_val, '%d/%m/%Y').date()
            else:
                self.stdout.write(self.style.ERROR(f"Formato de fecha no reconocido: {date_val}"))
                continue

            # Depuración: imprimir la fecha procesada
            print(f"Fecha procesada: {date}")

            # Obtener o crear el artículo
            article, _ = Article.objects.get_or_create(name=article_name)

            # Obtener el ID del cliente usando el nombre
            client_id = client_name_to_id.get(client_name)
            if not client_id:
                self.stdout.write(self.style.ERROR(f"Client '{client_name}' does not exist."))
                continue

            # Verificar si ya existe un registro con los mismos valores
            if not Exit.objects.filter(article=article, client_id=client_id, quantity=quantity, date=date).exists():
                # Crear la salida
                exit_record = Exit(
                    article=article,
                    client_id=client_id,
                    quantity=quantity,
                    date=date
                )
                exit_record.save()
                self.stdout.write(self.style.SUCCESS(f"Added record for article '{article_name}', client '{client_name}', quantity '{quantity}', date '{date}'"))
            else:
                self.stdout.write(self.style.WARNING(f"Duplicate record found for article '{article_name}', client '{client_name}', quantity '{quantity}', date '{date}'"))

        self.stdout.write(self.style.SUCCESS('Data imported successfully'))
