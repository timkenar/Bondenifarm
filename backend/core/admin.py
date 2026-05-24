from django.contrib import admin

from .models import Farm, FarmPlot, LandingContent


@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ('name', 'total_acreage', 'currency', 'timezone', 'updated_at')
    search_fields = ('name', 'address', 'email')


@admin.register(FarmPlot)
class FarmPlotAdmin(admin.ModelAdmin):
    list_display = ('name', 'farm', 'size_acres', 'soil_type', 'status', 'current_crop', 'updated_at')
    list_filter = ('status', 'soil_type', 'farm')
    search_fields = ('name', 'current_crop', 'notes')
    autocomplete_fields = ('farm',)


@admin.register(LandingContent)
class LandingContentAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'updated_at')
