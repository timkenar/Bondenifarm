from django.contrib import admin
from .models import CropSeason, CropActivity, PestDisease, HarvestRecord

admin.site.register(CropSeason)
admin.site.register(CropActivity)
admin.site.register(PestDisease)
admin.site.register(HarvestRecord)
