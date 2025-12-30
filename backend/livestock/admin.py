from django.contrib import admin
from .models import Livestock, AnimalHealthRecord

@admin.register(Livestock)
class LivestockAdmin(admin.ModelAdmin):
    list_display = ('tag_id', 'name', 'species', 'breed', 'sex', 'status')
    search_fields = ('tag_id', 'name')
    list_filter = ('species', 'status', 'sex')

@admin.register(AnimalHealthRecord)
class AnimalHealthRecordAdmin(admin.ModelAdmin):
    list_display = ('livestock', 'date', 'vet_name', 'treatment')
    list_filter = ('date',)
