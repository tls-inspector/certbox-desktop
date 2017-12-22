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

    NSError * rootError;
    NSError * serverError;
    CRFFactoryCertificate * root = [self.options.rootRequest generate:&rootError];
    if (rootError != nil) {
        finished(nil, rootError);
        return;
    }
    NSMutableArray<CRFFactoryCertificate *> * serverCerts = [NSMutableArray arrayWithCapacity:self.options.serverRequests.count];
    for (CRFFactoryCertificateRequest * serverRequest in self.options.serverRequests) {
        serverRequest.rootPkey = root.pkey;
        [serverCerts addObject:[serverRequest generate:&serverError]];
        if (serverError != nil) {
            finished(nil, serverError);
            return;
        }
    }

    switch (self.options.exportOptions.exportType) {
        case EXPORT_PEM:
            [self savePEMWithRootCert:root serverCerts:serverCerts password:self.options.exportOptions.exportPassword finished:finished];
            break;
        case EXPORT_PKCS12:
            [self saveP12WithRoot:root serverCerts:serverCerts password:self.options.exportOptions.exportPassword finished:finished];
            break;
    }
}

- (void) savePEMWithRootCert:(CRFFactoryCertificate *)root serverCerts:(NSArray<CRFFactoryCertificate *> *)serverCerts password:(NSString *)password finished:(void (^)(NSString *, NSError *))finished {
    NSURL *directoryURL = [NSURL fileURLWithPath:[NSTemporaryDirectory() stringByAppendingPathComponent:[NSProcessInfo.processInfo globallyUniqueString]] isDirectory:YES];
    [NSFileManager.defaultManager createDirectoryAtURL:directoryURL withIntermediateDirectories:YES attributes:nil error:nil];
    NSError * (^exportCert)(CRFFactoryCertificate *) = ^NSError *(CRFFactoryCertificate * cert) {
        NSString * keyPath = [NSString stringWithFormat:@"%@/%@.key", directoryURL.path, cert.name];
        NSString * certPath = [NSString stringWithFormat:@"%@/%@.crt", directoryURL.path, cert.name];

        FILE * f = fopen(keyPath.fileSystemRepresentation, "wb");
        if (PEM_write_PrivateKey(f,
                                 cert.pkey,
                                 self.options.exportOptions.encryptKey ? EVP_des_ede3_cbc() : NULL,
                                 self.options.exportOptions.encryptKey ? (unsigned char *)[password UTF8String] : NULL,
                                 self.options.exportOptions.encryptKey ? (int)password.length : 0,
                                 NULL,
                                 NULL) < 0) {
            fclose(f);
            return [self opensslError:@"Error saving private key"];
        }
        NSLog(@"Saved key to %@", keyPath);
        fclose(f);

        f = fopen(certPath.fileSystemRepresentation, "wb");
        if (PEM_write_X509(f, cert.x509) < 0) {
            fclose(f);
            return [self opensslError:@"Error saving certificate"];
        }
        NSLog(@"Saved cert to %@", certPath);
        fclose(f);
        return nil;
    };

    NSError * exportError;

    if ((exportError = exportCert(root)) != nil) {
        finished(nil, exportError);
        return;
    }
    for (CRFFactoryCertificate * cert in serverCerts) {
        if ((exportError = exportCert(cert)) != nil) {
            finished(nil, exportError);
            return;
        }
    }

    finished(directoryURL.absoluteString, nil);
}

- (void) saveP12WithRoot:(CRFFactoryCertificate *)root serverCerts:(NSArray<CRFFactoryCertificate *> *)serverCerts password:(NSString *)password finished:(void (^)(NSString *, NSError *))finished {
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
