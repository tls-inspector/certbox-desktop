#import "CRFFactory.h"
#include <openssl/pkcs12.h>
#include <openssl/ssl.h>
#include <openssl/err.h>
#include <openssl/x509v3.h>

@interface CRFFactory ()

@property (strong, nonatomic, nonnull) CRFFactoryOptions * options;

@end

@implementation CRFFactory

+ (CRFFactory *) factoryWithOptions:(CRFFactoryOptions *)options {
    CRFFactory * factory = CRFFactory.new;

    factory.options = options;

    return factory;
}

- (void) generateAndSave:(void (^)(NSString *, NSError *))finished {
    OPENSSL_init_ssl(0, NULL);
    OPENSSL_init_crypto(0, NULL);

    X509 * x509;
    x509 = X509_new();
    X509_set_version(x509, 2L); // 2 means 3.

    EVP_PKEY * pkey;
    NSError * keyError;
    switch (self.options.keyType) {
        case KEY_ALG_RSA:
            pkey = [self generateRSAKey:&keyError];
            break;
        case KEY_ALG_ECDSA:
            pkey = [self generateECKey:&keyError];
            break;
    }
    if (keyError) {
        finished(nil, keyError);
        return;
    }
    X509_set_pubkey(x509, pkey);
    EVP_PKEY_free(pkey);

    // Set Serial Number
    ASN1_INTEGER_set(X509_get_serialNumber(x509), self.options.serial.longLongValue);

    // Set Valididity Date Range
    long notBefore = [self.options.dateStart timeIntervalSinceDate:NSDate.date];
    long notAfter = [self.options.dateEnd timeIntervalSinceDate:NSDate.date];
    X509_gmtime_adj((ASN1_TIME *)X509_get0_notBefore(x509), notBefore);
    X509_gmtime_adj((ASN1_TIME *)X509_get0_notAfter(x509), notAfter);

    X509_NAME * name;
    name = X509_get_subject_name(x509);

    // Now to add the subject name fields to the certificate
    // I use a macro here to make it cleaner.
#define addName(field, value) X509_NAME_add_entry_by_txt(name, field,  MBSTRING_ASC, (unsigned char *)value, -1, -1, 0); NSLog(@"%s: %s", field, value);

    // The domain name or IP address that the certificate is issued for.
    addName("CN", self.options.commonName.UTF8String);

    // The organizational unit for the cert. Usually this is a department.
    addName("OU", self.options.department.UTF8String);

    // The organization of the cert.
    addName("O",  self.options.organization.UTF8String);

    // The city of the organization.
    addName("L",  self.options.city.UTF8String);

    // The state/province of the organization.
    addName("S",  self.options.state.UTF8String);

    // The country (ISO 3166) of the organization
    addName("C",  self.options.country.UTF8String);

    X509_set_issuer_name(x509, name);

    NSMutableArray<NSString *> * sanValues = [NSMutableArray arrayWithCapacity:self.options.sans.count];
    for (NSUInteger i = 0, count = self.options.sans.count; i < count; i++) {
        SANObject * san = self.options.sans[i];

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
            finished(nil, [self opensslError:@"Error adding SAN extension"]);
            return;
        }
        X509_EXTENSION_free(extension);
    }

    // Specify the encryption algorithm of the signature.
    // SHA256 should suit your needs.
    if (X509_sign(x509, pkey, EVP_sha256()) < 0) {
        finished(nil, [self opensslError:@"Error signing the certificate with the key"]);
        return;
    }

    X509_print_fp(stdout, x509);

    switch (self.options.exportType) {
        case EXPORT_PEM:
            [self savePEMWithCert:x509 key:pkey withPassword:self.options.exportPassword finished:finished];
            break;
        case EXPORT_PKCS12:
            [self saveP12WithCert:x509 key:pkey withPassword:self.options.exportPassword finished:finished];
            break;
    }
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

- (void) savePEMWithCert:(X509 *)x509 key:(EVP_PKEY *)pkey withPassword:(NSString *)password finished:(void (^)(NSString *, NSError *))finished {
    NSURL *directoryURL = [NSURL fileURLWithPath:[NSTemporaryDirectory() stringByAppendingPathComponent:[NSProcessInfo.processInfo globallyUniqueString]] isDirectory:YES];
    [NSFileManager.defaultManager createDirectoryAtURL:directoryURL withIntermediateDirectories:YES attributes:nil error:nil];
    NSString * keyPath = [NSString stringWithFormat:@"%@/server.key", directoryURL.path];
    NSString * certPath = [NSString stringWithFormat:@"%@/server.crt", directoryURL.path];

    FILE * f = fopen(keyPath.fileSystemRepresentation, "wb");

    // Here you write the private key (pkey) to disk. OpenSSL will encrypt the
    // file using the password and cipher you provide.
    if (PEM_write_PrivateKey(f,
                             pkey,
                             EVP_des_ede3_cbc(),
                             (unsigned char *)[password UTF8String],
                             (int)password.length,
                             NULL,
                             NULL) < 0) {
        // Error encrypting or writing to disk.
        finished(nil, [self opensslError:@"Error saving private key."]);
        fclose(f);
    }
    NSLog(@"Saved key to %@", keyPath);
    fclose(f);

    f = fopen(certPath.fileSystemRepresentation, "wb");

    // Here you write the certificate to the disk. No encryption is needed here
    // since this is public facing information
    if (PEM_write_X509(f, x509) < 0) {
        // Error writing to disk.
        finished(nil, [self opensslError:@"Error saving cert."]);
        fclose(f);
    }
    NSLog(@"Saved cert to %@", certPath);
    fclose(f);
    finished(directoryURL.path, nil);
}

- (void) saveP12WithCert:(X509 *)x509 key:(EVP_PKEY *)pkey withPassword:(NSString *)password finished:(void (^)(NSString *, NSError *))finished {
    PKCS12 * p12 = PKCS12_create([password UTF8String], NULL, pkey, x509, NULL, 0, 0, PKCS12_DEFAULT_ITER, 1, NID_key_usage);

    NSURL *directoryURL = [NSURL fileURLWithPath:[NSTemporaryDirectory() stringByAppendingPathComponent:[NSProcessInfo.processInfo globallyUniqueString]] isDirectory:YES];
    [NSFileManager.defaultManager createDirectoryAtURL:directoryURL withIntermediateDirectories:YES attributes:nil error:nil];
    NSString * path = [NSString stringWithFormat:@"%@/tmp_server.p12", directoryURL.path];

    FILE * f = fopen(path.fileSystemRepresentation, "wb");

    if (i2d_PKCS12_fp(f, p12) != 1) {
        finished(nil, [self opensslError:@"Error writing p12 to disk."]);
        fclose(f);
        return;
    }
    NSLog(@"Saved p12 to %@", path);
    fclose(f);
    finished(path, nil);
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
