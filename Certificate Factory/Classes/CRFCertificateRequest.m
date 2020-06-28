#import "CRFCertificateRequest.h"
#include <openssl/pkcs12.h>
#include <openssl/ssl.h>
#include <openssl/err.h>
#include <openssl/x509v3.h>

@interface CRFCertificateRequest ()

@property (nonatomic) X509 * importCert;
@property (nonatomic) EVP_PKEY * importPkey;

@end

@implementation CRFCertificateRequest

+ (CRFCertificateRequest *) requestWithExistingPKCSPath:(NSURL *)path importPassword:(NSString *)password {
    FILE *fp;
    PKCS12 *p12;
    if ((fp = fopen(path.path.UTF8String, "rb")) == NULL) {
        return nil;
    }
    
    p12 = d2i_PKCS12_fp(fp, NULL);
    fclose(fp);
    if (p12 == NULL) {
        return nil;
    }
    if (!PKCS12_verify_mac(p12, password.UTF8String, (int)password.length)) {
        return nil;
    }

    EVP_PKEY *pkey;
    X509 *cert;
    STACK_OF(X509) *ca = NULL;
    if (!PKCS12_parse(p12, password.UTF8String, &pkey, &cert, &ca)) {
        return nil;
    }

    CRFCertificateRequest * request = [CRFCertificateRequest new];

    request.importCert = cert;
    request.importPkey = pkey;
    request.subject = [CRFCertificateSubject subjectFromX509:cert];

    return request;
}

- (CRFCertificate *) generate:(NSError * __autoreleasing *)error {
    if (self.importPkey != nil && self.importCert != nil) {
        CRFCertificate * cert = [[CRFCertificate alloc] initWithX509:self.importCert PKey:self.importPkey];
        cert.imported = YES;
        return cert;
    }

    OPENSSL_init_ssl(0, NULL);
    OPENSSL_init_crypto(0, NULL);

    X509 * x509;
    x509 = X509_new();
    X509_set_version(x509, 2L); // 2 means 3.

    EVP_PKEY * pkey;
    NSError * keyError;
    switch (self.keyType) {
        case KEY_ALG_RSA:
            pkey = [self generateRSAKey:&keyError];
            break;
        case KEY_ALG_ECDSA:
            pkey = [self generateECKey:&keyError];
            break;
    }
    if (keyError) {
        *error = keyError;
        return nil;
    }
    X509_set_pubkey(x509, pkey);
    EVP_PKEY_free(pkey);

    // Set Serial Number
    ASN1_INTEGER_set(X509_get_serialNumber(x509), self.serial.longLongValue);

    // Set Valididity Date Range
    long notBefore = [self.dateStart timeIntervalSinceDate:NSDate.date];
    long notAfter = [self.dateEnd timeIntervalSinceDate:NSDate.date];
    X509_gmtime_adj((ASN1_TIME *)X509_get0_notBefore(x509), notBefore);
    X509_gmtime_adj((ASN1_TIME *)X509_get0_notAfter(x509), notAfter);

    X509_NAME * subject = [self.subject x509Name];
    X509_set_subject_name(x509, subject);

    if (self.issuer != nil) {
        X509_NAME * issue = [self.issuer x509Name];
        X509_set_issuer_name(x509, issue);
    } else {
        X509_set_issuer_name(x509, subject);
    }

    if (self.isCA) {
        X509_EXTENSION * caExtension = X509V3_EXT_conf_nid(NULL, NULL, NID_basic_constraints, "critical,CA:true,pathlen:1");
        X509_add_ext(x509, caExtension, -1);
    }
    NSMutableArray<NSString *> * usageValues = [NSMutableArray arrayWithCapacity:self.usage.count];
    NSMutableArray<NSString *> * extUsageValues = [NSMutableArray arrayWithCapacity:self.usage.count];
    for (CRFKeyUsage * usage in self.usage) {
        if (!usage.extended) {
            [usageValues addObject:usage.value];
        } else {
            [extUsageValues addObject:usage.value];
        }
    }
    if (usageValues.count > 0) {
        X509_EXTENSION * usageExtension = X509V3_EXT_conf_nid(NULL, NULL, NID_key_usage, [usageValues componentsJoinedByString:@","].UTF8String);
        X509_add_ext(x509, usageExtension, -1);
    }
    if (extUsageValues.count > 0) {
        X509_EXTENSION * extUsageExtension = X509V3_EXT_conf_nid(NULL, NULL, NID_ext_key_usage, [extUsageValues componentsJoinedByString:@","].UTF8String);
        X509_add_ext(x509, extUsageExtension, -1);
    }

    if (self.crlURLs && self.crlURLs.count > 0) {
        NSMutableArray<NSString *> * urls = [NSMutableArray arrayWithCapacity:self.crlURLs.count];
        for (NSURL * crlURL in self.crlURLs) {
            [urls addObject:[NSString stringWithFormat:@"URI:%@", crlURL.absoluteString]];
        }
        const char * crl_url_str = [urls componentsJoinedByString:@","].UTF8String;
        X509_EXTENSION * crlExtension = X509V3_EXT_conf_nid(NULL, NULL, NID_crl_distribution_points, crl_url_str);
        if (!X509_add_ext(x509, crlExtension, -1)) {
            *error = [self opensslError:@"Error adding CRL extension"];
            return nil;
        }
    }
    if (self.ocspURL) {
        const char * ocsp_url_str = [NSString stringWithFormat:@"OCSP;URI:%@", self.ocspURL.absoluteString].UTF8String;
        X509_EXTENSION * ocspExtension = X509V3_EXT_conf_nid(NULL, NULL, NID_info_access, ocsp_url_str);
        if (!X509_add_ext(x509, ocspExtension, -1)) {
            *error = [self opensslError:@"Error adding OCSP extension"];
            return nil;
        }
    }
    
    if (self.sans != nil) {
        NSMutableArray<NSString *> * sanValues = [NSMutableArray arrayWithCapacity:self.sans.count];
        for (NSUInteger i = 0, count = self.sans.count; i < count; i++) {
            CRFSANObject * san = self.sans[i];

            if (!san.value || san.value.length <= 0) {
                continue;
            }

            NSString * value = [NSString stringWithFormat:@"%@.%li:%@", [san x509Prefix], (long)i + 1, san.value];
            [sanValues addObject:value];
            NSLog(@"Add subjectAltName %@", value);
        }
        if (sanValues.count > 0) {
            NSString * value = [sanValues componentsJoinedByString:@","];
            X509_EXTENSION * extension = X509V3_EXT_conf_nid(NULL, NULL, NID_subject_alt_name, (const char *)[value UTF8String]);
            if (X509_add_ext(x509, extension, -1) == 0) {
                X509_EXTENSION_free(extension);
                *error = [self opensslError:@"Error adding SAN extension"];
                return nil;
            }
            X509_EXTENSION_free(extension);
        }
    }
    
    X509_print_fp(stdout, x509);

    if (self.rootPkey) {
        if (X509_sign(x509, self.rootPkey, EVP_sha256()) < 0) {
            *error = [self opensslError:@"Error signing the certificate with the key"];
            return nil;
        }
    } else {
        if (X509_sign(x509, pkey, EVP_sha256()) < 0) {
            *error = [self opensslError:@"Error signing the certificate with the key"];
            return nil;
        }
    }

    CRFCertificate * cert = [[CRFCertificate alloc] initWithX509:x509 PKey:pkey];
    cert.name = self.subject.commonName;
    return cert;
}

- (EVP_PKEY *) generateRSAKey:(NSError **)error {
    EVP_PKEY * pkey      = EVP_PKEY_new();
    if (!pkey) {
        *error = [self opensslError:@"Unable to generate RSA key"];
        return NULL;
    }

    BIGNUM   * bigNumber = BN_new();
    int        exponent  = RSA_F4;
    RSA      * rsa       = RSA_new();

    if (BN_set_word(bigNumber, exponent) < 0) {
        *error = [self opensslError:@"Error creating modulus."];
        goto cleanup;
    }

    if (RSA_generate_key_ex(rsa,
                            2048,
                            bigNumber,
                            NULL) < 0) {
        *error = [self opensslError:@"Error generating private key."];
        goto cleanup;
    }

    if (!EVP_PKEY_set1_RSA(pkey, rsa)) {
        *error = [self opensslError:@"Unable to generate RSA key"];
        goto cleanup;
    }

cleanup:
    RSA_free(rsa);
    BN_free(bigNumber);

    return pkey;
}

- (EVP_PKEY *) generateECKey:(NSError **)error {
    EVP_PKEY * pkey = EVP_PKEY_new();

    EC_KEY * ecc = EC_KEY_new_by_curve_name(NID_X9_62_prime256v1);
    if (!ecc) {
        *error = [self opensslError:@"Error selecting curve"];
        return NULL;
    }

    EC_KEY_set_asn1_flag(ecc, OPENSSL_EC_NAMED_CURVE);
    if (EC_KEY_generate_key(ecc) < 0) {
        *error = [self opensslError:@"Error generating key"];
        return NULL;
    }

    if (EVP_PKEY_assign_EC_KEY(pkey, ecc) < 0) {
        *error = [self opensslError:@"Error assigning key to pkey class"];
        return NULL;
    }

    return pkey;
}

- (NSError *) opensslError:(NSString *)description {
    const char * file;
    int line;
    ERR_peek_last_error_line(&file, &line);
    NSString * errorBody = [NSString stringWithFormat:@"%@ - OpenSSL Error %s:%i", description, file, line];
    NSLog(@"%@", errorBody);
    return NSMakeError(errorBody);
}

@end
