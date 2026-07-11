from collections.abc import Iterable


def extract_filter_params(query_params, allowed_fields: Iterable[str]) -> dict:
    allowed = set(allowed_fields)
    extracted: dict = {}

    for field in allowed:
        nested_key = f"filter[{field}]"
        if nested_key in query_params:
            values = query_params.getlist(nested_key)
            if len(values) == 1:
                value = values[0]
                extracted[field] = value.split(",") if field == "tags" and "," in value else value
            else:
                extracted[field] = values
        elif field in query_params:
            value = query_params.get(field)
            extracted[field] = value.split(",") if field == "tags" and value and "," in value else value

    return extracted


def normalize_multi_value(value):
    if value is None:
        return []
    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]
    normalized: list[str] = []
    for item in value:
        normalized.extend(normalize_multi_value(item))
    return [item for item in normalized if item]
