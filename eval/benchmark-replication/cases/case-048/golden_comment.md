# Golden Comments for feat(workflow_engine): Add in hook for producing occurrences from the stateful detector

## [High]
MetricAlertDetectorHandler inherits from StatefulDetectorHandler but only contains pass, failing to implement its required abstract methods: counter_names (property), get_dedupe_value(), get_group_key_values(), and build_occurrence_and_event_data(). This will cause a TypeError at runtime when the class is instantiated.

## [Low]
Docstring says this returns a list of DetectorEvaluationResult, but the method now returns a dict keyed by DetectorGroupKey. Consider updating the docstring to match the new return type.
