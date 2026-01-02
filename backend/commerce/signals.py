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
            # If explicit link exists
            if instance.consumable:
                instance.consumable.quantity_on_hand -= instance.quantity
                instance.consumable.save()
            else:
                # Fallback to name matching
                Consumable = apps.get_model('inventory', 'Consumable')
                product_name = instance.get_product_display()
                consumable = Consumable.objects.filter(
                    farm=instance.farm, 
                    item_name__iexact=product_name
                ).first()
                
                if consumable:
                    consumable.quantity_on_hand -= instance.quantity
                    consumable.save()
                
        except (LookupError, AttributeError):
            pass
        
        # 2. Try to sync with Livestock (if linked) for direct animal sales
        if instance.livestock:
            # For now we don't automatically reduce livestock quantity as 
            # sales are often products (Milk, Eggs) rather than the animal itself.
            pass
