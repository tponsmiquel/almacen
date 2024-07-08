from rest_framework import serializers
from .models import Article, Entry, Exit, Client

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = '__all__'

class EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = '__all__'

class ExitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exit
        fields = '__all__'
        extra_kwargs = {
            'client': {'error_messages': {'invalid': 'Invalid client ID.'}},
            'article': {'error_messages': {'invalid': 'Invalid article ID.'}},
        }

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'
