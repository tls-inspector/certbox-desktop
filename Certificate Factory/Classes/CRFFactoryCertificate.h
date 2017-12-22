#import <Foundation/Foundation.h>
#import "x509v3.h"
#import "evp.h"

@interface CRFFactoryCertificate : NSObject

- (id) initWithX509:(X509 *)x509 PKey:(EVP_PKEY *)pkey;
- (X509 *) x509;
- (EVP_PKEY *) pkey;

@property (strong, nonatomic) NSString * name;

@end
