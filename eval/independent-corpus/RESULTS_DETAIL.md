# Independent Corpus Results Detail

## case-001 (cross_file)
- **Repo**: expressjs/express
- **CVE**: CVE-2024-43796
- **Source URL**: https://github.com/expressjs/express/commit/54271f69b511fea198471e6ff3400ab805d6b553
- **Expected**: Vulnerable
- **Actual**: Missed

**Human Verification**: CodeGuard MISSED this real-world vulnerability entirely.
---
## case-002 (cross_file)
- **Repo**: expressjs/express
- **CVE**: CVE-2024-29041
- **Source URL**: https://github.com/expressjs/express/commit/0867302ddbde0e9463d0564fea5861feb708c2dd
- **Expected**: Vulnerable
- **Actual**: Flagged

### True Positive Details:
> The code checks if the host changes after encoding the URL, but it does not validate if the URL is a valid redirect target. Consider implementing a whitelist of allowed redirect targets to prevent open redirect attacks.

> The code catches all exceptions when parsing the URL, which could mask other issues. Consider catching only specific exceptions related to URL parsing.

> The test case checks for a specific bad URL, but it does not cover other potential attack vectors. Consider adding more test cases to cover different scenarios.

> The test case checks for case insensitivity, but it does not verify if the URL is properly encoded. Consider adding a test case to verify that the URL is correctly encoded.

> The code uses the `urlParse` function to parse the URL, which could lead to performance issues if the URL is very large. Consider using a more efficient URL parsing library or optimizing the parsing process.

**Human Verification**: CodeGuard successfully identified the vulnerability in this historical CVE fix.
---
## case-003 (cross_file)
- **Repo**: vercel/next.js
- **CVE**: CVE-2021-43803
- **Source URL**: https://github.com/vercel/next.js/commit/6d98b4fb4315dec1badecf0e9bdc212a4272b264
- **Expected**: Vulnerable
- **Actual**: Flagged

### True Positive Details:
> The try-catch block added here seems to handle potential errors, but it does not account for all possible exceptions. Consider adding a more comprehensive error handling mechanism.

> The DecodeError exception is caught and handled, but other potential exceptions are not. Ensure that all possible exceptions are handled and logged properly.

> The test case 'should handle invalid URL properly' seems to be testing the handling of invalid URLs. However, it does not cover all possible scenarios. Consider adding more test cases to ensure comprehensive coverage.

**Human Verification**: CodeGuard successfully identified the vulnerability in this historical CVE fix.
---
## case-004 (other)
- **Repo**: vercel/next.js
- **CVE**: CVE-2026-27980
- **Source URL**: https://github.com/vercel/next.js/commit/39eb8e0ac498b48855a0430fbf4c22276a73b4bd
- **Expected**: Vulnerable
- **Actual**: Missed

**Human Verification**: CodeGuard MISSED this real-world vulnerability entirely.
---
## case-005 (other)
- **Repo**: django/django
- **CVE**: CVE-2012-4520
- **Source URL**: https://github.com/django/django/commit/92d3430f12171f16f566c9050c40feefb830a4a3
- **Expected**: Vulnerable
- **Actual**: Flagged

### True Positive Details:
> The change from `request.META['HTTP_HOST']` to `request.get_host()` is a security improvement, as it prevents the use of a potentially poisoned `HTTP_HOST` header.

> The addition of a check for potentially poisoned hostnames in the `get_host` method is a good security practice, as it prevents the use of maliciously crafted `HTTP_HOST` headers.

> The test cases for poisoned `HTTP_HOST` headers are a good addition, as they ensure that the security fix is properly tested.

**Human Verification**: CodeGuard successfully identified the vulnerability in this historical CVE fix.
---
## case-006 (other)
- **Repo**: django/django
- **CVE**: CVE-2014-0481
- **Source URL**: https://github.com/django/django/commit/26cd48e166ac4d84317c8ee6d63ac52a87e8da99
- **Expected**: Vulnerable
- **Actual**: Flagged

### True Positive Details:
> The change from using a deterministic algorithm (appending an underscore and a number) to a non-deterministic algorithm (appending an underscore and a random 7 character alphanumeric string) is a good security fix to prevent denial-of-service attacks.

> The test case has been updated to reflect the new file naming convention. The use of a regular expression to match the file suffix is a good practice.

> The test case has been updated to reflect the new file naming convention. The use of a regular expression to match the file suffix is a good practice.

**Human Verification**: CodeGuard successfully identified the vulnerability in this historical CVE fix.
---
## case-007 (injection)
- **Repo**: rails/rails
- **CVE**: CVE-2024-26143
- **Source URL**: https://github.com/rails/rails/commit/4c83b331092a79d58e4adffe4be5f250fa5782cc
- **Expected**: Vulnerable
- **Actual**: Flagged

### True Positive Details:
> The introduction of `ERB::Util.html_escape` for default translation values is a good practice to prevent XSS attacks. However, it's essential to ensure that all user-input data is properly sanitized.

> The use of a private constant `MISSING_TRANSLATION` with a unique value (`-(2**60)`) is a good approach to avoid collisions. Consider adding a comment to explain the reasoning behind this value.

> The test cases for default translations with HTML-safe output are well-covered. Ensure that similar tests are added for other scenarios to maintain comprehensive coverage.

**Human Verification**: CodeGuard successfully identified the vulnerability in this historical CVE fix.
---
## case-008 (other)
- **Repo**: tensorflow/tensorflow
- **CVE**: CVE-2022-21726
- **Source URL**: https://github.com/tensorflow/tensorflow/commit/23968a8bf65b009120c43b5ebcceaf52dbc9e943
- **Expected**: Vulnerable
- **Actual**: Missed

**Human Verification**: CodeGuard MISSED this real-world vulnerability entirely.
---
## case-009 (other)
- **Repo**: tensorflow/tensorflow
- **CVE**: CVE-2022-35968
- **Source URL**: https://github.com/tensorflow/tensorflow/commit/3a6ac52664c6c095aa2b114e742b0aa17fdce78f
- **Expected**: Vulnerable
- **Actual**: Missed

**Human Verification**: CodeGuard MISSED this real-world vulnerability entirely.
---
## case-010 (other)
- **Repo**: keras-team/keras
- **CVE**: CVE-2023-25661
- **Source URL**: https://github.com/keras-team/keras/commit/85db5d07db54b853484bfd358c3894d948c36baf
- **Expected**: Vulnerable
- **Actual**: Missed

**Human Verification**: CodeGuard MISSED this real-world vulnerability entirely.
---
## case-011 (other)
- **Repo**: pallets/flask
- **CVE**: CVE-2025-47278
- **Source URL**: https://github.com/pallets/flask/commit/73d6504063bfa00666a92b07a28aaf906c532f09
- **Expected**: Vulnerable
- **Actual**: Flagged

### True Positive Details:
> The code now correctly orders the secret keys with the oldest key first and the active signing key at the end, as expected by the `itsdangerous` serializer interface.

> The documentation has been updated to reflect that the order of `SECRET_KEY_FALLBACKS` does not matter, but it is recommended to order them from oldest to newest for performance reasons.

**Human Verification**: CodeGuard successfully identified the vulnerability in this historical CVE fix.
---
## case-012 (other)
- **Repo**: pallets/flask
- **CVE**: CVE-2026-27205
- **Source URL**: https://github.com/pallets/flask/commit/089cb86dd22bff589a4eafb7ab8e42dc357623b4
- **Expected**: Vulnerable
- **Actual**: Missed

**Human Verification**: CodeGuard MISSED this real-world vulnerability entirely.
---
## case-013 (other)
- **Repo**: tiangolo/fastapi
- **CVE**: CVE-2021-32677
- **Source URL**: https://github.com/tiangolo/fastapi/commit/fa7e3c996edf2d5482fff8f9d890ac2390dede4d
- **Expected**: Vulnerable
- **Actual**: Missed

**Human Verification**: CodeGuard MISSED this real-world vulnerability entirely.
---
## case-014 (injection)
- **Repo**: strapi/strapi
- **CVE**: CVE-2022-0764
- **Source URL**: https://github.com/strapi/strapi/commit/2a3f5e988be6a2c7dae5ac22b9e86d579b462f4c
- **Expected**: Vulnerable
- **Actual**: Missed

**Human Verification**: CodeGuard MISSED this real-world vulnerability entirely.
---
## case-015 (other)
- **Repo**: tryghost/ghost
- **CVE**: CVE-2026-22594
- **Source URL**: https://github.com/TryGhost/Ghost/commit/b59f707f670e6f175b669977724ccf16c718430b
- **Expected**: Vulnerable
- **Actual**: Flagged

### True Positive Details:
> The removal of the `skipEmailVerification` property is a good security improvement, as it prevents potential bypassing of 2FA.

> The removal of the `skipEmailVerification` check is a good security improvement, as it prevents potential bypassing of 2FA.

> The introduction of the `otp` service is a good security improvement, as it provides a secure way to generate and verify TOTP tokens.

> The generation of an email verification token after a successful password reset is a good security improvement, as it provides a secure way to bypass 2FA on login.

> The verification of the email verification token on login is a good security improvement, as it prevents potential bypassing of 2FA.

> The test for the `resetPassword` endpoint is a good security improvement, as it ensures that the email verification token is returned correctly.

> The test for the `session` endpoint is a good security improvement, as it ensures that the email verification token can be used to bypass 2FA on login.

**Human Verification**: CodeGuard successfully identified the vulnerability in this historical CVE fix.
---
## case-016 (access_control)
- **Repo**: tryghost/ghost
- **CVE**: CVE-2023-40028
- **Source URL**: https://github.com/TryGhost/Ghost/commit/690fbf3f7302ff3f77159c0795928bdd20f41205
- **Expected**: Vulnerable
- **Actual**: Missed

**Human Verification**: CodeGuard MISSED this real-world vulnerability entirely.
---
## case-017 (other)
- **Repo**: directus/directus
- **CVE**: GHSA-22rr-f3p8-5gf8
- **Source URL**: https://github.com/directus/directus/commit/284156426fa94f688e8d65a7a4f34f9e6705f058
- **Expected**: Vulnerable
- **Actual**: Flagged

### True Positive Details:
> The use of isolated-vm is a good security practice, as it provides a more secure sandboxing environment compared to vm2.

> The implementation of memory limits and timeouts for the Run Script operation helps prevent potential denial-of-service attacks.

> The removal of the FLOWS_EXEC_ALLOWED_MODULES environment variable and the restriction of module usage in the Run Script operation reduces the attack surface.

> The documentation update to reflect the removal of custom Node Modules in the Run Script operation is accurate and helpful.

> The addition of FLOWS_RUN_SCRIPT_MAX_MEMORY and FLOWS_RUN_SCRIPT_TIMEOUT environment variables provides more control over the Run Script operation and helps prevent potential security issues.

**Human Verification**: CodeGuard successfully identified the vulnerability in this historical CVE fix.
---
## case-018 (other)
- **Repo**: directus/directus
- **CVE**: CVE-2026-22032
- **Source URL**: https://github.com/directus/directus/commit/dad9576ea9362905cc4de8028d3877caff36dc23
- **Expected**: Vulnerable
- **Actual**: Missed

**Human Verification**: CodeGuard MISSED this real-world vulnerability entirely.
---
## case-019 (other)
- **Repo**: npm/npm
- **CVE**: CVE-2018-7408
- **Source URL**: https://github.com/npm/npm/commit/74e149da6efe6ed89477faa81fef08eee7999ad0
- **Expected**: Vulnerable
- **Actual**: Flagged

### True Positive Details:
> The change from correctMkdir to mkdirp may introduce a security vulnerability if the directory permissions are not properly set. Ensure that the directory permissions are correctly configured to prevent unauthorized access.

> The removal of the effectiveOwner variable and the calculateOwner function may affect the security of the directory creation process. Verify that the new implementation using mkdirp properly handles ownership and permissions.

> The use of promisified functions (e.g., mkdirp) may lead to performance issues if not properly handled. Consider using async/await or callbacks to improve performance.

> The makeParentPath function is not properly handling errors. Consider adding error handling to ensure that the function behaves as expected in case of errors.

**Human Verification**: CodeGuard successfully identified the vulnerability in this historical CVE fix.
---
## case-020 (injection)
- **Repo**: symfony/symfony
- **CVE**: CVE-2013-1348
- **Source URL**: https://github.com/symfony/symfony/commit/ac756bf39e646b4e130fad058d10a0228dbd9779
- **Expected**: Vulnerable
- **Actual**: Flagged

### True Positive Details:
> The use of include() with user-provided input ($file) poses a significant security risk, as it can lead to arbitrary code execution. Consider using a safer approach, such as using a YAML parser that does not rely on include().

> The use of ob_start() and ob_get_clean() can be problematic if not properly handled, as it can lead to output buffering issues. Consider using a more robust approach to handle output buffering.

> The code has a mix of deprecated and non-deprecated methods. Consider removing the deprecated methods to improve code maintainability and reduce technical debt.

> The use of file_get_contents() can be inefficient for large files. Consider using a more efficient approach, such as using a streaming YAML parser.

**Human Verification**: CodeGuard successfully identified the vulnerability in this historical CVE fix.
---
## case-021 (ssrf)
- **Repo**: symfony/symfony
- **CVE**: CVE-2026-48736
- **Source URL**: https://github.com/symfony/symfony/commit/82765368cf74177c36613575182f168a2eb765b2
- **Expected**: Vulnerable
- **Actual**: Missed

**Human Verification**: CodeGuard MISSED this real-world vulnerability entirely.
---
## case-022 (injection)
- **Repo**: laravel/framework
- **CVE**: CVE-2024-13918
- **Source URL**: https://github.com/laravel/framework/commit/45287fb2a91c69bb1c110539b9b7341faf5aee33
- **Expected**: Vulnerable
- **Actual**: Missed

**Human Verification**: CodeGuard MISSED this real-world vulnerability entirely.
---
## case-023 (injection)
- **Repo**: laravel/framework
- **CVE**: CVE-2021-43808
- **Source URL**: https://github.com/laravel/framework/commit/b8174169b1807f36de1837751599e2828ceddb9b
- **Expected**: Vulnerable
- **Actual**: Missed

**Human Verification**: CodeGuard MISSED this real-world vulnerability entirely.
---
## case-024 (access_control)
- **Repo**: kubernetes/kubernetes
- **CVE**: CVE-2015-5305
- **Source URL**: https://github.com/kubernetes/kubernetes/commit/37f730f68c7f06e060f90714439bfb0dbb2df5e7
- **Expected**: Vulnerable
- **Actual**: Missed

**Human Verification**: CodeGuard MISSED this real-world vulnerability entirely.
---
## case-025 (injection)
- **Repo**: prometheus/prometheus
- **CVE**: CVE-2026-44903
- **Source URL**: https://github.com/prometheus/prometheus/commit/38f23b9075ced1de2b82d2dad8b2bebb1ecd5b7d
- **Expected**: Vulnerable
- **Actual**: Missed

**Human Verification**: CodeGuard MISSED this real-world vulnerability entirely.
---
## control-001 (control)
- **Repo**: expressjs/express
- **CVE**: control-001
- **Source URL**: https://github.com/expressjs/express/commit/54271f69b511fea198471e6ff3400ab805d6b553
- **Expected**: Clean (Control)
- **Actual**: Clean

**Human Verification**: Correctly identified as safe.
---
## control-002 (control)
- **Repo**: expressjs/express
- **CVE**: control-002
- **Source URL**: https://github.com/expressjs/express/commit/0867302ddbde0e9463d0564fea5861feb708c2dd
- **Expected**: Clean (Control)
- **Actual**: Clean

**Human Verification**: Correctly identified as safe.
---
## control-003 (control)
- **Repo**: django/django
- **CVE**: control-003
- **Source URL**: https://github.com/django/django/commit/92d3430f12171f16f566c9050c40feefb830a4a3
- **Expected**: Clean (Control)
- **Actual**: Flagged

### False Positive Details:
> The change from `request.META['HTTP_HOST']` to `request.get_host()` is a good practice to prevent HTTP Host Header attacks. The `get_host()` method checks for potentially poisoned hostnames and raises a `SuspiciousOperation` exception if necessary.

> The addition of the check for potentially poisoned hostnames in the `get_host()` method is a good security measure. It prevents attackers from manipulating the HTTP Host header to inject malicious data.

> The new test cases (`test_admin_reset`, `test_poisoned_http_host`, and `test_poisoned_http_host_admin_site`) are useful in ensuring the security of the password reset functionality.

**Human Verification**: CodeGuard incorrectly flagged this clean control commit. The flagged issue is a hallucination or misinterpretation of safe refactoring.
---
## control-004 (control)
- **Repo**: rails/rails
- **CVE**: control-004
- **Source URL**: https://github.com/rails/rails/commit/4c83b331092a79d58e4adffe4be5f250fa5782cc
- **Expected**: Clean (Control)
- **Actual**: Flagged

### False Positive Details:
> The introduction of `ERB::Util.html_escape` for default translation values is a good practice to prevent XSS attacks. However, it's essential to ensure that all user-provided input is properly sanitized.

> The use of a private constant `MISSING_TRANSLATION` with a large negative value may not be the most readable or maintainable approach. Consider using a more descriptive and explicit value or a separate class for handling missing translations.

> The test cases for default translation with HTML-safe output are a good addition to ensure the security of the `translate` method. However, it's crucial to continue testing and verifying the output for various input scenarios to prevent potential security vulnerabilities.

**Human Verification**: CodeGuard incorrectly flagged this clean control commit. The flagged issue is a hallucination or misinterpretation of safe refactoring.
---
## control-005 (control)
- **Repo**: tensorflow/tensorflow
- **CVE**: control-005
- **Source URL**: https://github.com/tensorflow/tensorflow/commit/23968a8bf65b009120c43b5ebcceaf52dbc9e943
- **Expected**: Clean (Control)
- **Actual**: Flagged

### False Positive Details:
> The added check prevents out-of-bounds access, which is a good security practice. However, consider adding a check for negative axis values, as some APIs may interpret negative values as counting from the end.

> The error message could be improved for better user experience. Consider including the actual axis value that caused the error.

**Human Verification**: CodeGuard incorrectly flagged this clean control commit. The flagged issue is a hallucination or misinterpretation of safe refactoring.
---
## control-006 (control)
- **Repo**: tensorflow/tensorflow
- **CVE**: control-006
- **Source URL**: https://github.com/tensorflow/tensorflow/commit/3a6ac52664c6c095aa2b114e742b0aa17fdce78f
- **Expected**: Clean (Control)
- **Actual**: Flagged

### False Positive Details:
> The change from `output_shape.AddDim(shape_vec(i))` to `OP_REQUIRES_OK(context, output_shape.AddDimWithStatus(shape_vec(i)))` improves error handling by checking the status of the `AddDim` operation. This is a good practice to prevent potential security vulnerabilities.

> Similar to the change at line 298, this change also improves error handling by checking the status of the `AddDim` operation.

> Again, this change improves error handling by checking the status of the `AddDim` operation.

> The addition of the `testAvgPoolGradInvalidInputShapeRaiseError` test case helps ensure that the `AvgPoolGrad` operation correctly handles invalid input shapes and raises an error as expected.

**Human Verification**: CodeGuard incorrectly flagged this clean control commit. The flagged issue is a hallucination or misinterpretation of safe refactoring.
---
