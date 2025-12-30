from django.db.models.signals import post_save
from django.dispatch import receiver
from django.apps import apps
from .models import Sale

@receiver(post_save, sender=Sale)
def reduce_stock_on_sale(sender, instance, created, **kwargs):
    """
    When a Sale is recorded, reduce the corresponding Consumable stock 
    or Livestock quantity if applicable.
    """
    if created:
        # 1. Try to sync with Inventory (Consumables)
        try:
            Consumable = apps.get_model('inventory', 'Consumable')
            
            # Attempt to find a consumable item with the same name as the product sold
            # e.g. "Maize" -> Item "Maize"
            product_name = instance.get_product_display()
            consumable = Consumable.objects.filter(
                farm=instance.farm, 
                item_name__iexact=product_name
            ).first()
            
            if consumable:
                # Reduce the quantity on hand
                consumable.quantity_on_hand -= instance.quantity
                consumable.save()
                
        except LookupError:
            pass
        
        # 2. Try to sync with Livestock (if linked) for direct animal sales
        # Note: Usually selling an animal is done by changing its status to SOLD,
        # but if this Sale record is linked to an animal (or group), we might update it.
        if instance.livestock:
            # If the livestock is a group (quantity > 1), reduce quantity
            if instance.livestock.quantity > 1:
                # Assuming Sale.quantity represents number of animals if product is related?
                # But Sale.product might be 'MILK'. So we must be careful.
                # Only reduce livestock quantity if the Product implies selling the animal?
                # or if the user explicitly linked it for that purpose.
                # Given 'Product' choices are mostly produce, we'll skip auto-reducing Livestock count 
                # to avoid accidental deletions when selling Milk linked to a Cow.
                pass
            else:
                # Single animal - maybe marking as sold?
                # We won't automate this yet to be safe.
                pass
