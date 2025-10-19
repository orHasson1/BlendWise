from django.contrib import admin
from .forms import EssentialOilAdminForm
from .models import NoteType, AromaFamily, Vibe, EssentialOil, Blend, BlendIngredient

# Custom admin classes for NoteType, AromaFamily, Vibe, EssentialOil
@admin.register(NoteType)
class NoteTypeAdmin(admin.ModelAdmin):
	list_display = ("name",)
	search_fields = ("name",)

	# Disable add, change, delete
	def has_add_permission(self, request):
		return False

	def has_change_permission(self, request, obj=None):
		return False

	def has_delete_permission(self, request, obj=None):
		return False

@admin.register(AromaFamily)
class AromaFamilyAdmin(admin.ModelAdmin):
	list_display = ("name",)
	search_fields = ("name",)
    
	# Disable add, change, delete
	"""
	def has_add_permission(self, request):
		return False

	def has_change_permission(self, request, obj=None):
		return False

	def has_delete_permission(self, request, obj=None):
		return False
    """
@admin.register(Vibe)
class VibeAdmin(admin.ModelAdmin):
	list_display = ("name",)
	search_fields = ("name",)  
	# Disable add, change, delete
	"""
	def has_add_permission(self, request):
		return False

	def has_change_permission(self, request, obj=None):
		return False

	def has_delete_permission(self, request, obj=None):
		return False  
		"""

@admin.register(EssentialOil)
class EssentialOilAdmin(admin.ModelAdmin):
	form = EssentialOilAdminForm
	list_display = ("name",)
	search_fields = ("name",)
	filter_horizontal = ("notes", "aromas", "vibes")

	def has_add_permission(self, request):
		# Only staff/admin can add
		return request.user.is_staff

	def has_change_permission(self, request, obj=None):
		# Only staff/admin can edit
		return request.user.is_staff

	def has_delete_permission(self, request, obj=None):
		# Only staff/admin can delete
		return request.user.is_staff

# Register Blend and BlendIngredient with default admin
admin.site.register(Blend)
admin.site.register(BlendIngredient)

