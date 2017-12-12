#import "CRFFactoryCertificate.h"

@interface CRFFactoryCertificate () {
    X509 * _x509;
    EVP_PKEY * _pkey;
}

@end

@implementation CRFFactoryCertificate

- (id) initWithX509:(X509 *)x509 PKey:(EVP_PKEY *)pkey {
    self = [super init];
    _x509 = x509;
    _pkey = pkey;
    return self;
}

- (X509 *) x509 {
    return _x509;
}

- (EVP_PKEY *) pkey {
    return _pkey;
}

@end
