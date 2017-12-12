#import <Foundation/Foundation.h>
#import "SANObject.h"
#import "CRFFactoryCertificateSubject.h"
#import "CRFFactoryCertificate.h"

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
@property (nonatomic) BOOL isCA;
@property (nonatomic) EVP_PKEY * _Nullable caPkey;

- (CRFFactoryCertificate * _Nullable) generate:(NSError * _Nullable * _Nonnull)error;

@end
