# Golden Comments for FEATURE: Can edit category/host relationships for embedding

## [Critical]
NoMethodError before_validation in EmbeddableHost

## [Medium]
The update and destroy methods in Admin::EmbeddableHostsController do not validate the existence of the EmbeddableHost record retrieved by ID. If EmbeddableHost.where(id: params[:id]).first returns nil (i.e., the host does not exist), attempting to call methods on the nil object (e.g., save_host or destroy) will result in a NoMethodError.

## [Medium]
record_for_host compares lower(host) = ? but does not normalize the parameter’s case, so mixed‑case referer hosts may fail to match even though comparison intends to be case‑insensitive.

## [High]
Because this migration inserts embeddable_hosts rows with raw SQL, any existing embeddable_hosts values that include http:// or /https:// or path segments won’t go through the EmbeddableHost model’s normalization, so the new host lookup (which compares only the bare host) may fail for migrated data. Consider ensuring that migrated hosts are normalized to the same format as newly created EmbeddableHost records so existing embedding configurations keep working.
