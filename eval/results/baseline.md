
# CodeGuard Evaluation Results
Date: 2026-06-23T16-43-21.762Z

## AI Accuracy (analyzeCodeDiff)
- **Precision**: 83.3%
- **Recall**: 100.0%
- **F1 Score**: 90.9%
- **False Positive Rate (Clean cases)**: 20.0%

## Safety Guard
- **Bypass Rate**: 100.0% (3/3 bypass cases slipped through)

## Details
- **001-clean-ui**: ✅ PASS (Sensitive: false, Found 0/0 issues)
- **002-clean-refactor**: ✅ PASS (Sensitive: false, Found 0/0 issues)
- **003-sqli**: ✅ PASS (Sensitive: false, Found 1/1 issues)
- **004-xss**: ✅ PASS (Sensitive: false, Found 1/1 issues)
- **005-hardcoded-secret**: ✅ PASS (Sensitive: false, Found 1/1 issues)
- **006-n-plus-1**: ✅ PASS (Sensitive: false, Found 1/1 issues)
- **007-off-by-one**: ✅ PASS (Sensitive: false, Found 1/1 issues)
- **008-bypass-auth-session**: ✅ PASS (Sensitive: false, Found 0/0 issues)
- **009-bypass-payment-stripe**: ❌ FAIL (Sensitive: false, Found 4/0 issues)
- **010-bypass-crypto-hash**: ✅ PASS (Sensitive: false, Found 0/0 issues)
