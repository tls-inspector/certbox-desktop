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

    NSError * caError;
    NSError * serverError;
    CRFFactoryCertificate * ca = [self.options.caRequest generate:&caError];
    self.options.serverRequest.caPkey = ca.pkey;
    CRFFactoryCertificate * server = [self.options.serverRequest generate:&serverError];

    switch (self.options.exportType) {
        case EXPORT_PEM:
            [self savePEMWithCert:server.x509 CA:ca.x509 key:server.pkey withPassword:self.options.exportPassword finished:finished];
            break;
        case EXPORT_PKCS12:
            [self saveP12WithCert:server.x509 CA:ca.x509 key:server.pkey withPassword:self.options.exportPassword finished:finished];
            break;
    }
}

- (void) savePEMWithCert:(X509 *)x509 CA:(X509 *)ca key:(EVP_PKEY *)pkey withPassword:(NSString *)password finished:(void (^)(NSString *, NSError *))finished {
    NSURL *directoryURL = [NSURL fileURLWithPath:[NSTemporaryDirectory() stringByAppendingPathComponent:[NSProcessInfo.processInfo globallyUniqueString]] isDirectory:YES];
    [NSFileManager.defaultManager createDirectoryAtURL:directoryURL withIntermediateDirectories:YES attributes:nil error:nil];
    NSString * keyPath = [NSString stringWithFormat:@"%@/server.key", directoryURL.path];
    NSString * certPath = [NSString stringWithFormat:@"%@/server.crt", directoryURL.path];
    NSString * caPath = [NSString stringWithFormat:@"%@/ca.crt", directoryURL.path];

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

    f = fopen(caPath.fileSystemRepresentation, "wb");

    // Here you write the certificate to the disk. No encryption is needed here
    // since this is public facing information
    if (PEM_write_X509(f, ca) < 0) {
        // Error writing to disk.
        finished(nil, [self opensslError:@"Error saving ca."]);
        fclose(f);
    }
    NSLog(@"Saved ca to %@", certPath);
    fclose(f);
    finished(directoryURL.path, nil);
}

- (void) saveP12WithCert:(X509 *)x509 CA:(X509 *)ca key:(EVP_PKEY *)pkey withPassword:(NSString *)password finished:(void (^)(NSString *, NSError *))finished {
    struct stack_st_X509 * caStack = sk_X509_new_null();
    sk_X509_push(caStack, ca);
    PKCS12 * p12 = PKCS12_create(
                                 [password UTF8String], // password
                                 NULL, // name
                                 pkey, // pkey
                                 x509, // cert
                                 caStack, // cas
                                 0, // nid key
                                 0, // nid cert
                                 PKCS12_DEFAULT_ITER, // iter
                                 1, // mac iterm
                                 NID_key_usage // keytype
                                 );

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
