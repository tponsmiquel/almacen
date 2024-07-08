from django.db import models

class Article(models.Model):
    """
    Modelo que representa un artículo en el inventario.
    """
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name


class Client(models.Model):
    """
    Modelo que representa un cliente.
    """
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Entry(models.Model):
    """
    Modelo que representa una entrada de artículos en el inventario.
    """
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    date = models.DateField()

    def __str__(self):
        return f'Entrada de {self.quantity} unidades de {self.article.name}'


class Exit(models.Model):
    """
    Modelo que representa una salida de artículos del inventario para un cliente.
    """
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    date = models.DateField()
    is_authorized = models.BooleanField(default=False)

    def __str__(self):
        return f'Salida de {self.quantity} unidades de {self.article.name} para el cliente {self.client.name}'
