from django.db import models


class SearchPreset(models.Model):
    name = models.CharField(max_length=120)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "matching_search_preset"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
