#import <Foundation/Foundation.h>
#import "SANObject.h"
#import "CRFFactoryCertificateSubject.h"
#import "CRFFactoryCertificate.h"
#import "CRFKeyUsage.h"

@interface CRFFactoryCertificateRequest : NSObject

typedef NS_ENUM(NSUInteger, CFFactoryKeyAlgType) {
    KEY_ALG_RSA,
    KEY_ALG_ECDSA,
};

@property (strong, nonatomic, nonnull) NSString * serial;
@property (nonatomic) CFFactoryKeyAlgType keyType;
@property (strong, nonatomic, nonnull) NSDate * dateStart;
@property (strong, nonatomic, nonnull) NSDate * dateEnd;
@property (strong, nonatomic, nonnull) CRFFactoryCertificateSubject * subject;
@property (strong, nonatomic, nullable) CRFFactoryCertificateSubject * issuer;
@property (strong, nonatomic, nullable) NSArray<SANObject *> * sans;
@property (strong, nonatomic, nonnull) NSArray<CRFKeyUsage *> * usage;
@property (nonatomic) BOOL isCA;
@property (nonatomic) EVP_PKEY * _Nullable rootPkey;

- (CRFFactoryCertificate * _Nullable) generate:(NSError * _Nullable * _Nonnull)error;
+ (CRFFactoryCertificateRequest * _Nonnull) requestWithExistingPKCSPath:(NSURL *)path importPassword:(NSString *)password;

@end
