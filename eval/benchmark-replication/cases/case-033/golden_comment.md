# Golden Comments for Add AuthzClientCryptoProvider for authorization client cryptographic operations

## [High]
Returns wrong provider (default keystore instead of BouncyCastle)

## [Low]
Dead code exists where ASN1Encoder instances are created and written to, but their results are immediately discarded. The actual encoding is performed by new ASN1Encoder instances created in the subsequent return statement, rendering the earlier operations useless.
