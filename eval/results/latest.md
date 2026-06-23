
# CodeGuard Evaluation Results
Date: 2026-06-23T16-47-23.281Z

## AI Accuracy (analyzeCodeDiff)
- **Precision**: 62.5%
- **Recall**: 100.0%
- **F1 Score**: 76.9%
- **False Positive Rate (Clean cases)**: 60.0%

## Safety Guard
- **Bypass Rate**: 0.0% (0/3 bypass cases slipped through)

## Details
- **001-clean-ui**: ✅ PASS (Sensitive: false, Found 0/0 issues)
- **002-clean-refactor**: ✅ PASS (Sensitive: false, Found 0/0 issues)
- **003-sqli**: ✅ PASS (Sensitive: false, Found 1/1 issues)
- **004-xss**: ✅ PASS (Sensitive: false, Found 1/1 issues)
- **005-hardcoded-secret**: ✅ PASS (Sensitive: true, Found 1/1 issues)
- **006-n-plus-1**: ✅ PASS (Sensitive: false, Found 1/1 issues)
- **007-off-by-one**: ✅ PASS (Sensitive: false, Found 1/1 issues)
- **008-bypass-auth-session**: ❌ FAIL (Sensitive: true, Found 3/0 issues)
- **009-bypass-payment-stripe**: ❌ FAIL (Sensitive: true, Found 4/0 issues)
- **010-bypass-crypto-hash**: ❌ FAIL (Sensitive: true, Found 3/0 issues)
