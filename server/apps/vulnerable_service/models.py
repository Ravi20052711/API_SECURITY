from django.db import models

class UserAccount(models.Model):
    user_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=100)
    ssn = models.CharField(max_length=20)
    role = models.CharField(max_length=50, default='student')
    created_at = models.DateTimeField(auto_now_add=True)

class Invoice(models.Model):
    account = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='invoices')
    invoice_id = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    card = models.CharField(max_length=50)

class SystemAccessKey(models.Model):
    key_id = models.CharField(max_length=50, unique=True)
    owner = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default='ACTIVE')
