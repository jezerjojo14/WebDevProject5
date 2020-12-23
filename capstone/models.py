from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinLengthValidator

# Create your models here.

class Song(models.Model):
    title=models.CharField(max_length=30)
    artist=models.CharField(max_length=30)
    notes=models.TextField()
    used_notes=models.TextField()
    user=models.ForeignKey(User, on_delete=models.CASCADE)
    credibility=models.FloatField(default=0.5)
    votes=models.ManyToManyField(User, related_name='votes')
